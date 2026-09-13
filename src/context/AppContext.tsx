import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Business,
  Product,
  Order,
  PaymentTransaction,
  CustomerRecord,
  SubscriptionPlan,
  CartItem,
  UserRole,
  OrderStatus,
  PaymentStatus,
} from '../types';
import {
  INITIAL_BUSINESSES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_CUSTOMERS,
  INITIAL_PLANS,
} from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AppContextType {
  // Auth
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  login: (email: string, role?: UserRole, redirect?: boolean) => void;
  register: (name: string, email: string, phone: string, role: UserRole) => Promise<UserProfile>;
  loginWithPassword: (email: string, password: string, role?: UserRole, redirect?: boolean) => Promise<{ success: boolean; error?: string }>;
  registerWithPassword: (name: string, email: string, phone: string, role: UserRole, password?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'merchant' | 'customer' | 'admin';
  setAuthModalTab: (tab: 'merchant' | 'customer' | 'admin') => void;
  authModalMode: 'signin' | 'signup';
  setAuthModalMode: (mode: 'signin' | 'signup') => void;
  openAuthModal: (defaultTab?: 'merchant' | 'customer' | 'admin', defaultMode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  isSupabaseConfigured: boolean;

  // Navigation
  currentRoute: string;
  activeShopSlug: string;
  navigateTo: (route: string, slug?: string) => void;
  getShopUrl: (slug?: string) => string;

  // Businesses
  businesses: Business[];
  currentShop: Business | undefined;
  myBusiness: Business | undefined;
  createBusiness: (businessData: Omit<Business, 'id' | 'created_at' | 'currency' | 'status'>) => Promise<Business>;
  updateBusiness: (id: string, updates: Partial<Business>) => void;
  toggleBusinessStatus: (id: string) => void;
  toggleBusinessFeatured: (id: string) => void;

  // Products
  products: Product[];
  currentShopProducts: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'created_at'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartTotal: number;

  // Orders & Payments
  orders: Order[];
  payments: PaymentTransaction[];
  createOrder: (orderPayload: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryLocation: string;
    deliveryAddress: string;
    deliveryNotes?: string;
    deliveryType?: 'delivery' | 'pickup';
    deliveryFee?: number;
    mpesaPhone: string;
  }) => Promise<{ order: Order; paymentPrompt: any }>;
  processPaymentWebhook: (orderId: string, status: PaymentStatus, receiptNumber?: string) => Promise<boolean>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  updateOrderDeliveryFee: (orderId: string, fee: number) => void;

  // Customers & Subscriptions
  customers: CustomerRecord[];
  plans: SubscriptionPlan[];
  updateBusinessSubscription: (
    businessId: string,
    planId: string,
    paymentInfo?: {
      mpesaPhone: string;
      receiptNumber: string;
      amount: number;
      billingInterval?: 'month' | 'year';
    }
  ) => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BUSINESSES: 'shoplink_businesses',
  PRODUCTS: 'shoplink_products',
  ORDERS: 'shoplink_orders',
  PAYMENTS: 'shoplink_payments',
  CUSTOMERS: 'shoplink_customers',
  USER: 'shoplink_current_user',
};

// Helper to extract initial route & shop slug from browser URL
const getInitialNavigation = (): { route: string; slug: string } => {
  if (typeof window === 'undefined') {
    return { route: 'landing', slug: 'john-shoes' };
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const shopParam = params.get('shop') || params.get('s');
    const routeParam = params.get('route');

    // 1. Check path /shop/slug
    const pathname = window.location.pathname;
    const pathMatch = pathname.match(/^\/shop\/([a-zA-Z0-9_-]+)/);

    // 2. Check hash #/shop/slug or #shop/slug
    const hash = window.location.hash;
    const hashMatch = hash.match(/#\/?shop\/([a-zA-Z0-9_-]+)/);

    if (shopParam) {
      return { route: 'shop', slug: shopParam };
    }
    if (pathMatch && pathMatch[1]) {
      return { route: 'shop', slug: pathMatch[1] };
    }
    if (hashMatch && hashMatch[1]) {
      return { route: 'shop', slug: hashMatch[1] };
    }
    if (routeParam) {
      return { route: routeParam, slug: 'john-shoes' };
    }
  } catch {}
  return { route: 'landing', slug: 'john-shoes' };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation initialized from active browser URL
  const initialNav = getInitialNavigation();
  const [currentRoute, setCurrentRoute] = useState<string>(initialNav.route);
  const [activeShopSlug, setActiveShopSlug] = useState<string>(initialNav.slug);

  // User Authentication: Defaults to null so each visitor creates their own account or signs in
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  });

  // State
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_BUSINESSES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_ORDERS;
  });

  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_PAYMENTS;
  });

  const [customers, setCustomers] = useState<CustomerRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_CUSTOMERS;
  });

  const [plans] = useState<SubscriptionPlan[]>(INITIAL_PLANS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'merchant' | 'customer' | 'admin'>('merchant');
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const openAuthModal = (
    defaultTab: 'merchant' | 'customer' | 'admin' = 'merchant',
    defaultMode: 'signin' | 'signup' = 'signin'
  ) => {
    setAuthModalTab(defaultTab);
    setAuthModalMode(defaultMode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // -----------------------------------------------------------------------
  // Supabase Data & Auth Synchronizer: Fetch businesses, products & profiles
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;

    const loadSupabaseCatalog = async () => {
      try {
        // 1. Fetch businesses
        const { data: dbBusinesses, error: bErr } = await supabase
          .from('businesses')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbBusinesses && dbBusinesses.length > 0 && !bErr) {
          setBusinesses(prev => {
            const map = new Map<string, Business>();
            dbBusinesses.forEach((b: any) => map.set(b.id, b));
            prev.forEach(b => {
              if (!map.has(b.id) && !dbBusinesses.some((rb: any) => rb.slug === b.slug)) {
                map.set(b.id, b);
              }
            });
            return Array.from(map.values());
          });
        }

        // 2. Fetch products (visible to everyone!)
        const { data: dbProducts, error: pErr } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (dbProducts && dbProducts.length > 0 && !pErr) {
          setProducts(prev => {
            const map = new Map<string, Product>();
            dbProducts.forEach((p: any) => map.set(p.id, p));
            prev.forEach(p => {
              if (!map.has(p.id)) {
                map.set(p.id, p);
              }
            });
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn('Supabase catalog sync skipped:', err);
      }
    };

    loadSupabaseCatalog();

    // Check active Supabase Auth session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              phone: profile.phone || '',
              role: profile.role,
              created_at: profile.created_at,
            });
          }
        } catch (e) {
          console.warn('Supabase session load error:', e);
        }
      }
    });

    // Listen for auth changes
    const { data: authSub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              phone: profile.phone || '',
              role: profile.role,
              created_at: profile.created_at,
            });
          }
        } catch (e) {
          console.warn('Supabase profile listener error:', e);
        }
      }
    });

    return () => {
      authSub.subscription.unsubscribe();
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Keep navigation in sync with browser back / forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const nav = getInitialNavigation();
      setCurrentRoute(nav.route);
      if (nav.slug) {
        setActiveShopSlug(nav.slug);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const getShopUrl = (slug?: string): string => {
    const targetSlug = slug || myBusiness?.slug || activeShopSlug || 'john-shoes';
    if (typeof window === 'undefined') {
      return `https://shoplink.co.ke/?shop=${targetSlug}`;
    }
    return `${window.location.origin}/?shop=${encodeURIComponent(targetSlug)}`;
  };

  const navigateTo = (route: string, slug?: string) => {
    const effectiveSlug = slug || activeShopSlug;
    if (slug) {
      setActiveShopSlug(slug);
    }
    setCurrentRoute(route);

    // Update browser URL query so merchants and customers can copy & bookmark directly
    try {
      let targetQuery = '';
      if (route === 'shop' && effectiveSlug) {
        targetQuery = `?shop=${encodeURIComponent(effectiveSlug)}`;
      } else if (route !== 'landing') {
        targetQuery = `?route=${encodeURIComponent(route)}`;
      }
      const targetUrl = window.location.pathname + targetQuery;
      window.history.pushState({ route, slug: effectiveSlug }, '', targetUrl);
    } catch {}

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // -----------------------------------------------------------------------
  // Auth Actions: Sign In & Sign Up with Supabase & Local Fallback
  // -----------------------------------------------------------------------
  const loginWithPassword = async (
    email: string,
    password: string,
    role: UserRole = 'customer',
    redirect: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    // 1. Try Supabase Auth first if configured
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Fetch profile from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          const loggedInUser: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
            phone: profile?.phone || data.user.user_metadata?.phone || '',
            role: (profile?.role as UserRole) || (data.user.user_metadata?.role as UserRole) || role,
            created_at: data.user.created_at,
          };

          setUser(loggedInUser);
          showToast(`Welcome back, ${loggedInUser.full_name}!`);

          if (redirect) {
            if (loggedInUser.role === 'business_owner') navigateTo('dashboard');
            else if (loggedInUser.role === 'admin') navigateTo('admin');
            else navigateTo('customer-orders');
          }

          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Authentication failed' };
      }
    }

    // 2. Local Fallback Mode
    let matchedUser: UserProfile;
    if (role === 'admin') {
      matchedUser = {
        id: 'admin-1',
        email: email || 'admin@shoplink.co.ke',
        full_name: 'Platform Administrator',
        role: 'admin',
        created_at: new Date().toISOString(),
      };
      setUser(matchedUser);
      showToast(`Signed in to Platform Admin Console`);
      if (redirect) navigateTo('admin');
    } else if (role === 'customer') {
      const shopperName = email.includes('@') ? email.split('@')[0] : email;
      matchedUser = {
        id: 'cust-' + Date.now(),
        email: email || 'customer@gmail.com',
        full_name: shopperName || 'Shopper',
        phone: email.startsWith('0') ? email : '0711445566',
        role: 'customer',
        created_at: new Date().toISOString(),
      };
      setUser(matchedUser);
      showToast(`Signed in as Shopper (${matchedUser.full_name})`);
      if (redirect && currentRoute === 'landing') navigateTo('marketplace');
      else if (redirect) navigateTo('customer-orders');
    } else {
      const existingBiz = businesses.find(
        b => b.email.toLowerCase() === email.toLowerCase() || b.phone === email
      );
      matchedUser = {
        id: existingBiz ? existingBiz.owner_id : 'user-' + Date.now(),
        email: email || (existingBiz ? existingBiz.email : 'merchant@shoplink.co.ke'),
        full_name: existingBiz ? existingBiz.name + ' Owner' : 'Shop Owner',
        phone: existingBiz?.phone || '0712345678',
        role: 'business_owner',
        created_at: new Date().toISOString(),
      };
      setUser(matchedUser);
      showToast(`Welcome back to your shop dashboard (${existingBiz?.name || "My Store"})`);
      if (redirect) navigateTo('dashboard');
    }

    return { success: true };
  };

  const registerWithPassword = async (
    name: string,
    email: string,
    phone: string,
    role: UserRole,
    password?: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    // 1. Try Supabase Auth first
    if (supabase && isSupabaseConfigured && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone,
              role,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const newUser: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: name,
            phone,
            role,
            created_at: data.user.created_at || new Date().toISOString(),
          };

          // Also attempt explicit profile upsert
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: data.user.email || email,
              full_name: name,
              phone,
              role,
            });
          } catch {}

          setUser(newUser);
          showToast(`Account created successfully! Welcome to ShopLink, ${name}.`);
          return { success: true, user: newUser };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Registration failed' };
      }
    }

    // 2. Local Fallback Mode
    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      email,
      full_name: name,
      phone,
      role,
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    showToast(`Welcome to ShopLink Kenya, ${name}!`);
    return { success: true, user: newUser };
  };

  // Backwards compatible login / register
  const login = (email: string, role: UserRole = 'business_owner', redirect: boolean = true) => {
    loginWithPassword(email, 'demo123', role, redirect);
  };

  const register = async (name: string, email: string, phone: string, role: UserRole): Promise<UserProfile> => {
    const res = await registerWithPassword(name, email, phone, role, 'secure123');
    return res.user || {
      id: 'usr-' + Date.now(),
      email,
      full_name: name,
      phone,
      role,
      created_at: new Date().toISOString(),
    };
  };

  const logout = () => {
    if (supabase && isSupabaseConfigured) {
      supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    showToast('Signed out successfully.');
    navigateTo('landing');
  };

  // Business relations - ONLY business_owner role receives a myBusiness handle
  const myBusiness = user?.role === 'business_owner'
    ? (businesses.find(b => b.owner_id === user?.id) || (user.id === 'user-john-1' ? businesses[0] : undefined))
    : undefined;
  const currentShop = businesses.find(b => b.slug === activeShopSlug) || businesses[0];
  const currentShopProducts = products.filter(p => p.business_id === currentShop?.id);

  const createBusiness = async (data: Omit<Business, 'id' | 'created_at' | 'currency' | 'status'>): Promise<Business> => {
    // Slug uniqueness check
    let cleanSlug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    if (businesses.some(b => b.slug === cleanSlug)) {
      cleanSlug = `${cleanSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Exactly 30 days free trial

    const newBiz: Business = {
      ...data,
      id: 'biz-' + Date.now(),
      slug: cleanSlug,
      currency: 'KSh',
      status: 'active',
      created_at: now.toISOString(),
      trial_ends_at: trialEnd.toISOString(),
    };

    // If Supabase is active, persist to businesses table
    if (supabase && isSupabaseConfigured) {
      try {
        const { data: dbBiz, error } = await supabase
          .from('businesses')
          .insert([
            {
              owner_id: data.owner_id,
              name: data.name,
              slug: cleanSlug,
              description: data.description || '',
              phone: data.phone,
              email: data.email,
              location: data.location,
              county: data.county || 'Nairobi',
              exact_location: data.exact_location || data.location,
              category: data.category,
              logo_url: data.logo_url || '',
              banner_url: data.banner_url || '',
              delivery_fee: data.delivery_fee,
              settlement: data.settlement || { settlement_type: 'till', auto_payout_enabled: true, verified: true },
              status: 'active',
              subscription_plan_id: data.subscription_plan_id || 'plan_free',
              trial_ends_at: trialEnd.toISOString(),
            },
          ])
          .select()
          .single();

        if (dbBiz && !error) {
          newBiz.id = dbBiz.id;
        }
      } catch (err) {
        console.warn('Supabase business creation fallback:', err);
      }
    }

    setBusinesses(prev => [newBiz, ...prev]);
    showToast(`Shop "${newBiz.name}" launched successfully!`);
    return newBiz;
  };

  const updateBusiness = async (id: string, updates: Partial<Business>) => {
    setBusinesses(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('businesses')
          .update(updates)
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase business update error:', err);
      }
    }

    showToast('Shop settings updated.');
  };

  const toggleBusinessStatus = (id: string) => {
    setBusinesses(prev =>
      prev.map(b => (b.id === id ? { ...b, status: b.status === 'active' ? 'suspended' : 'active' } : b))
    );
    showToast('Business status updated.');
  };

  const toggleBusinessFeatured = (id: string) => {
    setBusinesses(prev =>
      prev.map(b => (b.id === id ? { ...b, is_featured: !b.is_featured } : b))
    );
    showToast('Marketplace featured status updated.');
  };

  // Product actions: Saved to Supabase & visible to everyone!
  const addProduct = async (data: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
    const newProduct: Product = {
      ...data,
      id: 'prod-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    // If Supabase is active, persist to products table
    if (supabase && isSupabaseConfigured) {
      try {
        const { data: dbProduct, error } = await supabase
          .from('products')
          .insert([
            {
              business_id: data.business_id,
              name: data.name,
              description: data.description || '',
              price: data.price,
              sale_price: data.sale_price || null,
              stock_quantity: data.stock_quantity,
              category: data.category,
              image_url: data.image_url,
              images: data.images || [],
              is_active: data.is_active ?? true,
              is_featured: data.is_featured ?? false,
            },
          ])
          .select()
          .single();

        if (dbProduct && !error) {
          newProduct.id = dbProduct.id;
        }
      } catch (err) {
        console.warn('Supabase product insert fallback:', err);
      }
    }

    // Immediately add to state so all visitors and search see it in real-time
    setProducts(prev => [newProduct, ...prev]);
    showToast(`Added product "${newProduct.name}" - Visible to everyone in the marketplace!`);
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('products')
          .update(updates)
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase product update error:', err);
      }
    }

    showToast('Product updated successfully.');
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('products')
          .delete()
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase product delete error:', err);
      }
    }

    showToast('Product deleted from inventory.');
  };

  // Shopping cart actions
  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock_quantity <= 0) {
      showToast(`Sorry, "${product.name}" is out of stock.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock_quantity, existing.quantity + quantity);
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock_quantity, quantity) }];
    });
    setIsCartOpen(true);
    showToast(`Added "${product.name}" to cart.`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const maxAllowed = Math.min(item.product.stock_quantity, quantity);
          return { ...item, quantity: maxAllowed };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((acc, item) => {
    const price = item.product.sale_price || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const cartDeliveryFee = cart.length > 0 ? (currentShop?.delivery_fee || 200) : 0;
  const cartTotal = cartSubtotal + cartDeliveryFee;

  // Order & Hashback Payment Handling
  const createOrder = async (payload: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryLocation: string;
    deliveryAddress: string;
    deliveryNotes?: string;
    deliveryType?: 'delivery' | 'pickup';
    deliveryFee?: number;
    mpesaPhone: string;
  }) => {
    if (cart.length === 0) {
      throw new Error('Shopping cart is empty.');
    }

    // Check stock availability
    for (const item of cart) {
      const liveProduct = products.find(p => p.id === item.product.id);
      if (!liveProduct || liveProduct.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for "${item.product.name}". Remaining: ${liveProduct?.stock_quantity || 0}`);
      }
    }

    const orderNumber = `SLK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrderId = 'ord-' + Date.now();

    const orderItems = cart.map(item => ({
      id: 'item-' + Math.random().toString(36).substr(2, 9),
      order_id: newOrderId,
      product_id: item.product.id,
      product_name: item.product.name,
      product_image: item.product.image_url,
      price: item.product.sale_price || item.product.price,
      quantity: item.quantity,
      total: (item.product.sale_price || item.product.price) * item.quantity,
    }));

    const deliveryType = payload.deliveryType || 'delivery';
    const isPickup = deliveryType === 'pickup';
    const deliveryFee = isPickup
      ? 0
      : (payload.deliveryFee !== undefined ? payload.deliveryFee : (currentShop?.delivery_fee || 0));
    const feeStatus = isPickup
      ? 'free_pickup'
      : (payload.deliveryFee !== undefined ? 'quoted' : 'pending_quote');
    const orderTotal = cartSubtotal + deliveryFee;

    const newOrder: Order = {
      id: newOrderId,
      order_number: orderNumber,
      business_id: currentShop?.id || 'biz-john-shoes',
      business_name: currentShop?.name || "John's Shoes",
      customer_id: user?.id,
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      customer_email: payload.customerEmail,
      delivery_location: payload.deliveryLocation,
      delivery_address: payload.deliveryAddress,
      delivery_notes: payload.deliveryNotes,
      delivery_type: deliveryType,
      delivery_fee_status: feeStatus,
      mpesa_phone: payload.mpesaPhone,
      items: orderItems,
      subtotal: cartSubtotal,
      delivery_fee: deliveryFee,
      total: orderTotal,
      currency: 'KSh',
      payment_status: 'pending',
      order_status: 'pending',
      hashback_reference: `HB-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save pending order
    setOrders(prev => [newOrder, ...prev]);

    // Send payment STK push request to backend
    let paymentResponse: any = null;
    try {
      const res = await fetch('/api/payments/hashback/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: newOrder.id,
          orderNumber: newOrder.order_number,
          amount: newOrder.total,
          phoneNumber: payload.mpesaPhone,
          customerName: payload.customerName,
          businessId: newOrder.business_id,
        }),
      });

      if (res.ok) {
        paymentResponse = await res.json();
      }
    } catch {
      // Fallback response for browser-only execution
      paymentResponse = {
        success: true,
        status: 'pending',
        gatewayTransactionId: `HB-MPESA-${Date.now()}`,
        message: 'STK push sent to phone via Hashback gateway.',
      };
    }

    // Clear cart
    clearCart();
    setIsCartOpen(false);

    return {
      order: newOrder,
      paymentPrompt: paymentResponse,
    };
  };

  // Webhook completion: Idempotent order payment & inventory deduction
  const processPaymentWebhook = async (orderId: string, status: PaymentStatus, receiptNumber?: string): Promise<boolean> => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return false;

    // Idempotency check: Already processed
    if (targetOrder.payment_status === 'successful') {
      return true;
    }

    if (status === 'successful') {
      const mpesaReceipt = receiptNumber || `RHB${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // 1. Reduce inventory automatically
      setProducts(prevProducts =>
        prevProducts.map(product => {
          const matchedItem = targetOrder.items.find(i => i.product_id === product.id);
          if (matchedItem) {
            const newStock = Math.max(0, product.stock_quantity - matchedItem.quantity);
            return { ...product, stock_quantity: newStock };
          }
          return product;
        })
      );

      // 2. Mark order as PAID & Processing
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.id === orderId
            ? {
                ...o,
                payment_status: 'successful',
                order_status: 'paid',
                hashback_reference: mpesaReceipt,
                updated_at: new Date().toISOString(),
              }
            : o
        )
      );

      // 3. Create payment transaction record
      const newPayment: PaymentTransaction = {
        id: 'pay-' + Date.now(),
        order_id: targetOrder.id,
        business_id: targetOrder.business_id,
        customer_id: targetOrder.customer_id,
        amount: targetOrder.total,
        currency: 'KSh',
        phone_number: targetOrder.mpesa_phone,
        gateway: 'hashback',
        gateway_transaction_id: mpesaReceipt,
        status: 'successful',
        callback_data: {
          mpesa_receipt: mpesaReceipt,
          paid_at: new Date().toISOString(),
          status: 'SUCCESS',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setPayments(prev => [newPayment, ...prev]);

      // 4. Update or add to business customer directory
      setCustomers(prevCusts => {
        const existing = prevCusts.find(
          c => c.business_id === targetOrder.business_id && c.phone === targetOrder.customer_phone
        );
        if (existing) {
          return prevCusts.map(c =>
            c.id === existing.id
              ? {
                  ...c,
                  orders_count: c.orders_count + 1,
                  total_spent: c.total_spent + targetOrder.total,
                  last_order_date: new Date().toISOString(),
                  status: c.total_spent + targetOrder.total > 15000 ? 'vip' : 'active',
                }
              : c
          );
        } else {
          return [
            ...prevCusts,
            {
              id: 'cust-' + Date.now(),
              business_id: targetOrder.business_id,
              name: targetOrder.customer_name,
              phone: targetOrder.customer_phone,
              email: targetOrder.customer_email,
              orders_count: 1,
              total_spent: targetOrder.total,
              last_order_date: new Date().toISOString(),
              status: 'active',
            },
          ];
        }
      });

      showToast(`Payment of KSh ${targetOrder.total.toLocaleString()} confirmed via Hashback!`);
      return true;
    } else {
      // Failed payment
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.id === orderId
            ? { ...o, payment_status: 'failed', updated_at: new Date().toISOString() }
            : o
        )
      );
      showToast('M-Pesa payment was not completed or was cancelled.');
      return false;
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, order_status: newStatus, updated_at: new Date().toISOString() } : o))
    );
    showToast(`Order status updated to "${newStatus.toUpperCase()}".`);
  };

  const updateOrderDeliveryFee = (orderId: string, fee: number) => {
    const validFee = Math.max(0, Math.round(fee));
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const updatedTotal = o.subtotal + validFee;
          return {
            ...o,
            delivery_fee: validFee,
            delivery_fee_status: 'quoted',
            total: updatedTotal,
            updated_at: new Date().toISOString(),
          };
        }
        return o;
      })
    );
    showToast(`Delivery fee set to KSh ${validFee.toLocaleString()}`);
  };

  const updateBusinessSubscription = (
    businessId: string,
    planId: string,
    paymentInfo?: {
      mpesaPhone: string;
      receiptNumber: string;
      amount: number;
      billingInterval?: 'month' | 'year';
    }
  ) => {
    setBusinesses(prev =>
      prev.map(b => (b.id === businessId ? { ...b, subscription_plan_id: planId } : b))
    );
    const plan = plans.find(p => p.id === planId);
    const planName = plan?.name || 'Plan';

    if (paymentInfo && plan && plan.price > 0) {
      const newPayment: PaymentTransaction = {
        id: 'pay-sub-' + Date.now(),
        order_id: 'sub-' + planId + '-' + Date.now(),
        business_id: businessId,
        amount: paymentInfo.amount,
        currency: 'KSh',
        phone_number: paymentInfo.mpesaPhone,
        gateway: 'hashback',
        gateway_transaction_id: paymentInfo.receiptNumber,
        status: 'successful',
        callback_data: {
          mpesa_receipt: paymentInfo.receiptNumber,
          plan_id: planId,
          plan_name: planName,
          type: 'subscription_payment',
          interval: paymentInfo.billingInterval || 'month',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setPayments(prev => [newPayment, ...prev]);
      showToast(`M-Pesa payment verified! Subscribed to ${planName} Plan (Receipt: ${paymentInfo.receiptNumber})`);
    } else {
      showToast(`Switched to ${planName} Plan successfully!`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        loginWithPassword,
        registerWithPassword,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        isSupabaseConfigured,
        currentRoute,
        activeShopSlug,
        navigateTo,
        getShopUrl,
        businesses,
        currentShop,
        myBusiness,
        createBusiness,
        updateBusiness,
        toggleBusinessStatus,
        toggleBusinessFeatured,
        products,
        currentShopProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartDeliveryFee,
        cartTotal,
        orders,
        payments,
        createOrder,
        processPaymentWebhook,
        updateOrderStatus,
        updateOrderDeliveryFee,
        customers,
        plans,
        updateBusinessSubscription,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
