import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  CreditCard,
  Crown,
  User,
  Plus,
  Edit2,
  Trash2,
  Share2,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  QrCode,
  Copy,
  Check,
  Building2,
  Smartphone,
  PhoneCall,
  Lock,
} from 'lucide-react';
import { OrderStatus, Product, SubscriptionPlan, SettlementType, PaymentMethodChoice } from '../types';
import { KENYA_COUNTIES } from '../data/counties';
import { SubscriptionPaymentModal } from './SubscriptionPaymentModal';
import { ShopLinkModal } from './ShopLinkModal';
import { ASSISTANCE_CONFIG, buildWhatsAppUrl } from '../lib/assistanceConfig';

export const BusinessDashboard: React.FC = () => {
  const {
    user,
    openAuthModal,
    myBusiness,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    updateOrderDeliveryFee,
    customers,
    payments,
    plans,
    updateBusinessSubscription,
    updateBusiness,
    navigateTo,
    getShopUrl,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'orders' | 'customers' | 'analytics' | 'settings' | 'payments' | 'subscription' | 'profile'
  >('dashboard');

  const [isShopLinkModalOpen, setIsShopLinkModalOpen] = useState(false);
  const [copiedDirectLink, setCopiedDirectLink] = useState(false);
  const [editingFeeOrderId, setEditingFeeOrderId] = useState<string | null>(null);
  const [customFeeInput, setCustomFeeInput] = useState<string>('');

  // 30-Day Free Trial Calculation (First month free, counting day 1 to 30)
  const trialInfo = useMemo(() => {
    if (!myBusiness) {
      return { daysElapsed: 1, daysRemaining: 30, isTrialActive: true, trialEndDateFormatted: '', percentComplete: 3 };
    }
    const createdMs = new Date(myBusiness.created_at).getTime();
    const trialEndMs = myBusiness.trial_ends_at
      ? new Date(myBusiness.trial_ends_at).getTime()
      : createdMs + 30 * 24 * 60 * 60 * 1000;
    const nowMs = Date.now();
    const msElapsed = Math.max(0, nowMs - createdMs);
    const msRemaining = Math.max(0, trialEndMs - nowMs);

    // Count day from creation: Day 1, Day 2 ... up to Day 30
    const rawElapsedDays = Math.floor(msElapsed / (1000 * 60 * 60 * 24)) + 1;
    const daysElapsed = Math.min(30, Math.max(1, rawElapsedDays));
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
    const isTrialActive = daysRemaining > 0;
    const trialEndDateFormatted = new Date(trialEndMs).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return {
      daysElapsed,
      daysRemaining,
      isTrialActive,
      trialEndDateFormatted,
      percentComplete: Math.min(100, Math.round((daysElapsed / 30) * 100)),
    };
  }, [myBusiness]);

  // Payment methods selection (Till, Paybill, Pochi, or all of them)
  const [enabledMethods, setEnabledMethods] = useState<PaymentMethodChoice[]>(
    myBusiness?.settlement?.enabled_methods ||
      (myBusiness?.settlement?.settlement_type && myBusiness.settlement.settlement_type !== 'multiple'
        ? [myBusiness.settlement.settlement_type as PaymentMethodChoice]
        : ['till'])
  );
  const [tillNumber, setTillNumber] = useState(myBusiness?.settlement?.till_number || '5928341');
  const [storeName, setStoreName] = useState(myBusiness?.settlement?.store_name || myBusiness?.name || '');
  const [paybillNumber, setPaybillNumber] = useState(myBusiness?.settlement?.paybill_number || '400200');
  const [paybillAccount, setPaybillAccount] = useState(
    myBusiness?.settlement?.paybill_account_number || myBusiness?.settlement?.account_number_format || myBusiness?.slug?.toUpperCase() || ''
  );
  const [pochiPhone, setPochiPhone] = useState(
    myBusiness?.settlement?.pochi_phone || myBusiness?.phone || ''
  );
  const [pochiName, setPochiName] = useState(
    myBusiness?.settlement?.pochi_name || myBusiness?.name || ''
  );
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(
    myBusiness?.settlement?.auto_payout_enabled ?? true
  );
  const [isSavingSettlement, setIsSavingSettlement] = useState(false);

  // Shop Location Settings (47 Counties & Exact Location)
  const [selectedCounty, setSelectedCounty] = useState(myBusiness?.county || 'Nairobi');
  const [exactLocation, setExactLocation] = useState(myBusiness?.exact_location || myBusiness?.location || '');

  const togglePaymentMethod = (method: PaymentMethodChoice) => {
    if (enabledMethods.includes(method)) {
      if (enabledMethods.length === 1) {
        showToast('At least one payment method must remain active.');
        return;
      }
      setEnabledMethods(prev => prev.filter(m => m !== method));
    } else {
      setEnabledMethods(prev => [...prev, method]);
    }
  };

  const handleEnableAllMethods = () => {
    setEnabledMethods(['till', 'paybill', 'pochi']);
    showToast('All 3 payment methods enabled! Fill details below.');
  };

  const handleSaveSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myBusiness) return;
    if (enabledMethods.length === 0) {
      showToast('Please enable at least one payment method.');
      return;
    }
    setIsSavingSettlement(true);
    updateBusiness(myBusiness.id, {
      settlement: {
        settlement_type: enabledMethods.length > 1 ? 'multiple' : enabledMethods[0],
        enabled_methods: enabledMethods,
        till_number: tillNumber,
        store_name: storeName,
        paybill_number: paybillNumber,
        paybill_account_number: paybillAccount,
        account_number_format: paybillAccount,
        pochi_phone: pochiPhone,
        pochi_name: pochiName,
        mpesa_phone: pochiPhone || myBusiness.phone,
        hashback_subaccount_id: `HB_${myBusiness.slug.toUpperCase()}`,
        auto_payout_enabled: autoPayoutEnabled,
        verified: true,
      },
    });
    setTimeout(() => {
      setIsSavingSettlement(false);
      showToast('Payment methods updated & verified for your shop!');
    }, 400);
  };

  // Business specific datasets
  const bizProducts = useMemo(
    () => products.filter(p => p.business_id === myBusiness?.id),
    [products, myBusiness]
  );

  const bizOrders = useMemo(
    () => orders.filter(o => o.business_id === myBusiness?.id),
    [orders, myBusiness]
  );

  const bizCustomers = useMemo(
    () => customers.filter(c => c.business_id === myBusiness?.id),
    [customers, myBusiness]
  );

  const bizPayments = useMemo(
    () => payments.filter(p => p.business_id === myBusiness?.id),
    [payments, myBusiness]
  );

  // Metrics calculations
  const totalSales = useMemo(
    () => bizOrders.filter(o => o.payment_status === 'successful').reduce((acc, o) => acc + o.total, 0),
    [bizOrders]
  );

  // Today's sales (mocked or filtered by date)
  const todaySales = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return bizOrders
      .filter(o => o.payment_status === 'successful' && o.created_at.startsWith(today))
      .reduce((acc, o) => acc + o.total, 0) || Math.round(totalSales * 0.25);
  }, [bizOrders, totalSales]);

  // This month's sales
  const monthSales = totalSales;

  const totalOrdersCount = bizOrders.length;
  const pendingOrdersCount = bizOrders.filter(o => o.order_status === 'pending' || o.payment_status === 'pending').length;
  const completedOrdersCount = bizOrders.filter(o => o.order_status === 'delivered' || o.order_status === 'paid').length;
  const lowStockCount = bizProducts.filter(p => p.stock_quantity <= 5).length;

  // Product Add/Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 1500,
    sale_price: '',
    stock_quantity: 10,
    category: 'Shoes & Footwear',
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    is_featured: false,
  });

  // Order status filter
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [searchOrder, setSearchOrder] = useState<string>('');

  // Subscription Payment Modal State
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Guard: Directed according to profile - strictly separates shoppers from merchant dashboard
  if (user?.role !== 'business_owner') {
    if (user?.role === 'customer') {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-neutral-200 p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">Shopper Account</h2>
            <p className="text-xs text-neutral-600 mt-2">
              You are signed in as a shopper (<span className="font-semibold text-neutral-800">{user.email || user.phone}</span>). Merchant store management and subscriptions are reserved for shop owners.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={() => navigateTo('customer-orders')}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>View My Orders & Receipts</span>
              </button>
              <button
                onClick={() => navigateTo('marketplace')}
                className="w-full py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-xs font-bold hover:bg-neutral-50 transition-colors"
              >
                Explore Kenyan Stores
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Visitor not logged in
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl border border-neutral-200 p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900">Merchant Dashboard Access</h2>
          <p className="text-xs text-neutral-600 mt-2">
            This dashboard is dedicated to verified Kenyan store owners. Please sign in to your merchant account to manage products and sales.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => openAuthModal('merchant', 'signin')}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Sign In as Shop Owner
            </button>
            <button
              onClick={() => openAuthModal('merchant', 'signup')}
              className="w-full py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors"
            >
              Create Merchant Account
            </button>
            <button
              onClick={() => navigateTo('marketplace')}
              className="w-full py-2 text-neutral-500 text-xs hover:text-neutral-800"
            >
              Browse Public Stores
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = useMemo(() => {
    return bizOrders.filter(o => {
      const matchesFilter = orderFilter === 'all' || o.order_status === orderFilter;
      const matchesSearch =
        o.order_number.toLowerCase().includes(searchOrder.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(searchOrder.toLowerCase()) ||
        o.customer_phone.includes(searchOrder);
      return matchesFilter && matchesSearch;
    });
  }, [bizOrders, orderFilter, searchOrder]);

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      description: '',
      price: 2500,
      sale_price: '',
      stock_quantity: 15,
      category: myBusiness?.category || 'Shoes & Footwear',
      image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80',
      is_active: true,
      is_featured: false,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      sale_price: prod.sale_price ? String(prod.sale_price) : '',
      stock_quantity: prod.stock_quantity,
      category: prod.category,
      image_url: prod.image_url,
      is_active: prod.is_active,
      is_featured: prod.is_featured,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myBusiness) return;

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        sale_price: productForm.sale_price ? Number(productForm.sale_price) : undefined,
        stock_quantity: Number(productForm.stock_quantity),
        category: productForm.category,
        image_url: productForm.image_url,
        is_active: productForm.is_active,
        is_featured: productForm.is_featured,
      });
    } else {
      await addProduct({
        business_id: myBusiness.id,
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        sale_price: productForm.sale_price ? Number(productForm.sale_price) : undefined,
        stock_quantity: Number(productForm.stock_quantity),
        category: productForm.category,
        image_url: productForm.image_url,
        is_active: productForm.is_active,
        is_featured: productForm.is_featured,
      });
    }
    setIsProductModalOpen(false);
  };

  // WhatsApp share generator
  const shopUrl = myBusiness ? getShopUrl(myBusiness.slug) : '';
  const handleShareOnWhatsApp = () => {
    if (!myBusiness) return;
    const text = encodeURIComponent(
      `Habari! Welcome to ${myBusiness.name} on ShopLink Kenya! 🛍️✨\n\nBrowse our full catalog and order with instant Lipa na M-Pesa:\n👉 ${shopUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopyDirectLink = () => {
    if (!shopUrl) return;
    navigator.clipboard.writeText(shopUrl);
    setCopiedDirectLink(true);
    showToast('Unique shop link copied to clipboard!');
    setTimeout(() => setCopiedDirectLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-neutral-900 text-white shrink-0 border-r border-neutral-800 flex flex-col justify-between">
        <div>
          {/* Shop branding pill */}
          <div className="p-5 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <img
                src={myBusiness?.logo_url}
                alt={myBusiness?.name}
                className="w-10 h-10 rounded-xl object-cover border border-neutral-700 bg-white"
              />
              <div className="overflow-hidden">
                <h2 className="text-sm font-bold truncate">{myBusiness?.name}</h2>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Storefront Active
                </span>
              </div>
            </div>

            {/* Quick Public Storefront Link */}
            <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
              <button
                onClick={() => navigateTo('shop', myBusiness?.slug)}
                className="text-xs text-neutral-300 hover:text-white flex items-center gap-1 font-medium group"
              >
                <span>View My Public Shop</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'products', label: 'Products', icon: Package, badge: bizProducts.length },
              { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount ? `${pendingOrdersCount} new` : undefined },
              { id: 'customers', label: 'Customers', icon: Users, badge: bizCustomers.length },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Shop Settings', icon: Settings },
              { id: 'payments', label: 'Payments (Hashback)', icon: CreditCard },
              { id: 'subscription', label: 'Subscription', icon: Crown },
              { id: 'profile', label: 'Profile', icon: User },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        isActive ? 'bg-emerald-700 text-white' : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* WhatsApp Share CTA & Assistance Hotline */}
        <div className="p-4 border-t border-neutral-800 space-y-2.5">
          <button
            onClick={handleShareOnWhatsApp}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Shop on WhatsApp</span>
          </button>

          <div className="p-3 rounded-xl bg-neutral-800/90 border border-neutral-700/60 text-[11px] text-neutral-300">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Merchant Help Desk</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 mb-2">
              Have onboarding questions or need payment support?
            </p>
            <a
              href={buildWhatsAppUrl(`Hello ShopLink Support Team, I am merchant ${myBusiness?.name || ''} and need assistance.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* =========================================================================
            TAB 1: DASHBOARD OVERVIEW
        ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                  Business Dashboard
                </h1>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Welcome back, {myBusiness?.name}. Here is your sales and order performance.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsShopLinkModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Store Link &amp; QR</span>
                </button>
                <button
                  onClick={handleShareOnWhatsApp}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </button>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* 30-Day Free Trial Banner with 1-30 Day Counter */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200/80 rounded-3xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="p-1 rounded-lg bg-emerald-600 text-white">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-black text-neutral-900 tracking-tight">
                      First Month Free Trial &bull; Day {trialInfo.daysElapsed} of 30
                    </h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      trialInfo.daysRemaining > 5
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                    }`}>
                      {trialInfo.daysRemaining > 0 ? `${trialInfo.daysRemaining} days free remaining` : 'Trial Complete'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 max-w-2xl">
                    Every new shop in all 47 counties gets the first 30 days 100% free with unlimited product listings and direct M-Pesa buyer checkout. Subscription starts on Day 30 ({trialInfo.trialEndDateFormatted || 'end of trial'}).
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('subscription')}
                    className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Plans</span>
                  </button>
                </div>
              </div>

              {/* Visual 30-Day Progress Bar */}
              <div className="mt-4 pt-3 border-t border-emerald-200/60">
                <div className="flex justify-between items-center text-[11px] text-neutral-600 mb-1.5 font-medium">
                  <span>Day 1 (Shop Opened)</span>
                  <span className="font-bold text-emerald-800">
                    Day {trialInfo.daysElapsed} / 30 ({trialInfo.daysRemaining} days to subscription)
                  </span>
                  <span>Day 30 (Subscription Starts)</span>
                </div>
                <div className="w-full h-2.5 bg-neutral-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, trialInfo.percentComplete)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Dedicated Unique Shop Link Showcase Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-neutral-900 to-neutral-950 text-white p-5 rounded-3xl shadow-md border border-emerald-800/40 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Store className="w-4 h-4" />
                    </span>
                    <h2 className="text-sm font-extrabold text-white tracking-tight">
                      Your Dedicated Storefront Link
                    </h2>
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Customers who click this link land directly on <strong>{myBusiness?.name}</strong> to view your catalog and pay via M-Pesa.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-300 select-all">
                      <span className="text-neutral-400 text-[11px]">URL:</span>
                      <span>{shopUrl}</span>
                    </div>
                    <button
                      onClick={handleCopyDirectLink}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/15"
                    >
                      {copiedDirectLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsShopLinkModalOpen(true)}
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-neutral-950" />
                    <span>Get QR &amp; Flyers</span>
                  </button>
                  <button
                    onClick={() => navigateTo('shop', myBusiness?.slug)}
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/15"
                  >
                    <span>Open Shop</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Overview Cards (Total sales, today's sales, this month's sales, orders, low-stock, products, customers) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
                <p className="text-xs font-medium text-neutral-500">Total Sales (KSh)</p>
                <p className="text-2xl font-extrabold text-neutral-900 mt-1">
                  KSh {totalSales.toLocaleString()}
                </p>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  <span>+18% this week</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
                <p className="text-xs font-medium text-neutral-500">Today&apos;s Sales</p>
                <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                  KSh {todaySales.toLocaleString()}
                </p>
                <p className="mt-2 text-[11px] text-neutral-400">Via Hashback M-Pesa</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
                <p className="text-xs font-medium text-neutral-500">Total Orders</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-neutral-900">
                    {totalOrdersCount}
                  </span>
                  {pendingOrdersCount > 0 && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      {pendingOrdersCount} pending
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-neutral-400">
                  {completedOrdersCount} completed
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
                <p className="text-xs font-medium text-neutral-500">Products & Inventory</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-neutral-900">
                    {bizProducts.length}
                  </span>
                  {lowStockCount > 0 && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      {lowStockCount} low stock
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-neutral-400">
                  {bizCustomers.length} registered buyers
                </p>
              </div>
            </div>

            {/* Charts Section: Sales Over Time, Orders Over Time, Best Selling Products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Over Time Chart */}
              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Sales Over Time</h3>
                    <p className="text-xs text-neutral-500">Daily revenue across recent periods (KSh)</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    This Month: KSh {monthSales.toLocaleString()}
                  </span>
                </div>

                {/* Visual Bar Chart */}
                <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2 border-b border-neutral-200 pb-2">
                  {[
                    { day: 'Mon', amt: 4800, height: '40%' },
                    { day: 'Tue', amt: 7200, height: '60%' },
                    { day: 'Wed', amt: 3200, height: '30%' },
                    { day: 'Thu', amt: 9800, height: '80%' },
                    { day: 'Fri', amt: 12400, height: '95%' },
                    { day: 'Sat', amt: 11000, height: '85%' },
                    { day: 'Sun', amt: 6500, height: '55%' },
                  ].map(bar => (
                    <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <div className="text-[10px] font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {bar.amt}
                      </div>
                      <div
                        style={{ height: bar.height }}
                        className="w-full max-w-[36px] bg-emerald-600 rounded-t-md hover:bg-emerald-500 transition-all"
                      />
                      <span className="text-[11px] font-medium text-neutral-600">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Selling Products */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
                <h3 className="text-sm font-bold text-neutral-900 mb-1">Best-Selling Products</h3>
                <p className="text-xs text-neutral-500 mb-4">Top performers by order volume</p>

                <div className="space-y-3">
                  {bizProducts.slice(0, 3).map((prod, idx) => (
                    <div key={prod.id} className="flex items-center gap-3 p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                      <span className="w-6 h-6 rounded-lg bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-10 h-10 rounded-lg object-cover border border-neutral-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-neutral-900 truncate">{prod.name}</p>
                        <p className="text-[11px] text-neutral-500">
                          KSh {prod.price.toLocaleString()} • {prod.stock_quantity} left
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Recent Customer Orders</h3>
                  <p className="text-xs text-neutral-500">Latest transactions from your storefront</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 border-y border-neutral-200">
                    <tr>
                      <th className="py-2.5 px-3">Order #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Delivery Location</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3">Order Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {bizOrders.slice(0, 5).map(o => (
                      <tr key={o.id} className="hover:bg-neutral-50/60">
                        <td className="py-3 px-3 font-mono font-bold text-neutral-900">
                          {o.order_number}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-neutral-800">{o.customer_name}</p>
                          <p className="text-[11px] text-neutral-500">{o.customer_phone}</p>
                        </td>
                        <td className="py-3 px-3 text-neutral-600 truncate max-w-[150px]">
                          {o.delivery_location}
                        </td>
                        <td className="py-3 px-3 font-bold text-neutral-900">
                          KSh {o.total.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.payment_status === 'successful'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {o.payment_status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="capitalize font-medium text-neutral-700">
                            {o.order_status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setActiveTab('orders')}
                            className="text-xs font-bold text-emerald-700 hover:underline"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: PRODUCT MANAGEMENT
        ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                  Product Inventory
                </h1>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Manage your catalog, prices in KSh, stock quantities, and availability.
                </p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price (KSh)</th>
                      <th className="py-3 px-4">Stock Status</th>
                      <th className="py-3 px-4">Visibility</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {bizProducts.map(product => {
                      const isOutOfStock = product.stock_quantity <= 0;
                      const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

                      return (
                        <tr key={product.id} className="hover:bg-neutral-50/60">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
                              />
                              <div>
                                <h4 className="font-bold text-neutral-900">{product.name}</h4>
                                <p className="text-[11px] text-neutral-500 line-clamp-1 max-w-xs">
                                  {product.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-neutral-600">{product.category}</td>

                          <td className="py-3 px-4">
                            <div className="font-extrabold text-neutral-900">
                              KSh {product.price.toLocaleString()}
                            </div>
                            {product.sale_price && (
                              <div className="text-[10px] text-emerald-700 font-bold">
                                Sale: KSh {product.sale_price.toLocaleString()}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                                <AlertTriangle className="w-3 h-3" />
                                Out of stock (0)
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                Low stock ({product.stock_quantity})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                In stock ({product.stock_quantity})
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => updateProduct(product.id, { is_active: !product.is_active })}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                product.is_active
                                  ? 'bg-neutral-900 text-white'
                                  : 'bg-neutral-200 text-neutral-600'
                              }`}
                            >
                              {product.is_active ? 'Active' : 'Hidden'}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditProduct(product)}
                              className="p-1 text-neutral-600 hover:text-emerald-700 transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4 inline" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${product.name}"?`)) {
                                  deleteProduct(product.id);
                                }
                              }}
                              className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: ORDERS MANAGEMENT
        ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                  Orders Management
                </h1>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Process orders, update delivery milestones, and view customer contacts.
                </p>
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={orderFilter}
                  onChange={e => setOrderFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-neutral-300 bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="ready">Ready</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center">
                  <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-neutral-800">No orders match filter</p>
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-extrabold text-base text-neutral-900">
                          #{order.order_number}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            order.payment_status === 'successful'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          M-Pesa: {order.payment_status.toUpperCase()}
                        </span>
                        {order.hashback_reference && (
                          <span className="font-mono text-[11px] text-neutral-500">
                            Ref: {order.hashback_reference}
                          </span>
                        )}
                      </div>

                      {/* Status select dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500 font-medium">Status:</span>
                        <select
                          value={order.order_status}
                          onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="px-3 py-1 text-xs font-bold rounded-lg border border-neutral-300 bg-neutral-50 focus:border-emerald-600"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="processing">Processing</option>
                          <option value="ready">Ready</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer & Delivery Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-neutral-400 font-medium uppercase text-[10px]">
                          Customer Contact
                        </p>
                        <p className="font-bold text-neutral-900 mt-1">{order.customer_name}</p>
                        <p className="text-neutral-600">{order.customer_phone}</p>
                        {order.customer_email && (
                          <p className="text-neutral-500">{order.customer_email}</p>
                        )}
                        <button
                          onClick={() => {
                            const clean = order.customer_phone.replace(/[^0-9]/g, '');
                            const formatted = clean.startsWith('0') ? '254' + clean.substring(1) : clean;
                            window.open(`https://wa.me/${formatted}?text=Hello%20${order.customer_name},%20regarding%20Order%20%23${order.order_number}`, '_blank');
                          }}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Customer</span>
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-neutral-400 font-medium uppercase text-[10px]">
                            Delivery Method & Destination
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              order.delivery_type === 'pickup'
                                ? 'bg-purple-100 text-purple-800'
                                : order.delivery_fee_status === 'pending_quote'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {order.delivery_type === 'pickup'
                              ? 'In-Store Pickup'
                              : order.delivery_fee_status === 'pending_quote'
                              ? 'Awaiting Distance Quote'
                              : 'Distance Quoted'}
                          </span>
                        </div>
                        <p className="font-bold text-neutral-900 mt-1">{order.delivery_location}</p>
                        <p className="text-neutral-600">{order.delivery_address}</p>
                        {order.delivery_notes && (
                          <p className="text-amber-700 mt-1 italic">
                            &quot;{order.delivery_notes}&quot;
                          </p>
                        )}
                        {order.delivery_type !== 'pickup' && (
                          <div className="mt-2 text-[11px] text-neutral-500 bg-neutral-100 p-1.5 rounded-lg">
                            <span className="font-semibold text-neutral-700">Distance Guide:</span> Seller calculates courier fee based on customer&apos;s estate.
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-neutral-400 font-medium uppercase text-[10px]">
                            Order Financials
                          </p>
                          {order.delivery_type !== 'pickup' && editingFeeOrderId !== order.id && (
                            <button
                              onClick={() => {
                                setEditingFeeOrderId(order.id);
                                setCustomFeeInput(order.delivery_fee.toString());
                              }}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline"
                            >
                              Insert Delivery Fee
                            </button>
                          )}
                        </div>

                        <div className="mt-1 space-y-1">
                          <p className="text-neutral-600">
                            Subtotal: KSh {order.subtotal.toLocaleString()}
                          </p>

                          {/* Interactive Delivery Fee insertion by Seller */}
                          {editingFeeOrderId === order.id ? (
                            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 mt-1">
                              <label className="block text-[11px] font-bold text-emerald-900">
                                Enter Delivery Fee for Distance (KSh):
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  value={customFeeInput}
                                  onChange={e => setCustomFeeInput(e.target.value)}
                                  placeholder="e.g. 250"
                                  className="w-24 px-2 py-1 text-xs font-bold rounded-lg border border-emerald-300 bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const feeNum = parseFloat(customFeeInput) || 0;
                                    updateOrderDeliveryFee(order.id, feeNum);
                                    setEditingFeeOrderId(null);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  Save Fee
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingFeeOrderId(null)}
                                  className="px-2 py-1 text-[11px] text-neutral-500 hover:text-neutral-700"
                                >
                                  Cancel
                                </button>
                              </div>
                              {/* Quick distance fee presets */}
                              <div className="flex flex-wrap gap-1 pt-1">
                                {[
                                  { label: 'CBD (150)', val: 150 },
                                  { label: 'Mid-zone (250)', val: 250 },
                                  { label: 'Outer (350)', val: 350 },
                                  { label: 'Upcountry (500)', val: 500 },
                                ].map(preset => (
                                  <button
                                    key={preset.val}
                                    type="button"
                                    onClick={() => setCustomFeeInput(preset.val.toString())}
                                    className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold hover:bg-emerald-200"
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-neutral-600">
                              <span>Delivery Fee:</span>
                              <span className="font-semibold text-neutral-800">
                                {order.delivery_type === 'pickup'
                                  ? 'KSh 0 (Free Pickup)'
                                  : `KSh ${order.delivery_fee.toLocaleString()}`}
                              </span>
                            </div>
                          )}

                          <p className="font-extrabold text-neutral-900 text-sm pt-1 border-t border-neutral-100">
                            Total Payable: KSh {order.total.toLocaleString()}
                          </p>

                          {/* Dispatch Distance Quote to Customer via WhatsApp */}
                          {order.delivery_type !== 'pickup' && (
                            <button
                              onClick={() => {
                                const clean = order.customer_phone.replace(/[^0-9]/g, '');
                                const formatted = clean.startsWith('0') ? '254' + clean.substring(1) : clean;
                                const msg = encodeURIComponent(
                                  `Habari ${order.customer_name}! Regarding Order #${order.order_number} at ${myBusiness?.name || 'Shop'}: Your delivery fee to ${order.delivery_location} is KSh ${order.delivery_fee.toLocaleString()}. Total payable is KSh ${order.total.toLocaleString()}. Please proceed to complete payment via M-Pesa.`
                                );
                                window.open(`https://wa.me/${formatted}?text=${msg}`, '_blank');
                              }}
                              className="mt-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                            >
                              <MessageCircle className="w-3 h-3 text-blue-600" />
                              <span>Send Delivery Quote on WhatsApp</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Items Table */}
                    <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-8 h-8 rounded-md object-cover border border-neutral-200"
                              />
                              <span className="font-medium text-neutral-800">
                                {item.product_name} × {item.quantity}
                              </span>
                            </div>
                            <span className="font-bold text-neutral-900">
                              KSh {item.total.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: CUSTOMERS CRM
        ========================================================================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                Customer Management
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Directory of customers who ordered from {myBusiness?.name}.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Orders Placed</th>
                    <th className="py-3 px-4">Total Amount Spent</th>
                    <th className="py-3 px-4">Last Order Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {bizCustomers.map(cust => (
                    <tr key={cust.id} className="hover:bg-neutral-50/60">
                      <td className="py-3 px-4 font-bold text-neutral-900">{cust.name}</td>
                      <td className="py-3 px-4 text-neutral-600 font-mono">{cust.phone}</td>
                      <td className="py-3 px-4 font-semibold text-neutral-800">
                        {cust.orders_count} orders
                      </td>
                      <td className="py-3 px-4 font-extrabold text-emerald-700">
                        KSh {cust.total_spent.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
                        {new Date(cust.last_order_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cust.status === 'vip'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {cust.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            const clean = cust.phone.replace(/[^0-9]/g, '');
                            const formatted = clean.startsWith('0') ? '254' + clean.substring(1) : clean;
                            window.open(`https://wa.me/${formatted}`, '_blank');
                          }}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: ANALYTICS
        ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                Sales & Store Analytics
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Conversion metrics and shopping behavior breakdown.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
                <p className="text-xs font-medium text-neutral-500">Average Order Value</p>
                <p className="text-2xl font-extrabold text-neutral-900 mt-1">
                  KSh{' '}
                  {totalOrdersCount > 0
                    ? Math.round(totalSales / totalOrdersCount).toLocaleString()
                    : '0'}
                </p>
                <p className="text-[11px] text-emerald-600 mt-2 font-semibold">
                  +12% vs last month
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
                <p className="text-xs font-medium text-neutral-500">Storefront Visitors</p>
                <p className="text-2xl font-extrabold text-neutral-900 mt-1">1,420</p>
                <p className="text-[11px] text-neutral-400 mt-2">78% via WhatsApp links</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
                <p className="text-xs font-medium text-neutral-500">Checkout Conversion</p>
                <p className="text-2xl font-extrabold text-neutral-900 mt-1">3.8%</p>
                <p className="text-[11px] text-emerald-600 mt-2 font-semibold">
                  High completion rate
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: SHOP SETTINGS
        ========================================================================= */}
        {activeTab === 'settings' && myBusiness && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                Shop Settings
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Configure your public branding, WhatsApp number, and delivery rates.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Shop Name
                </label>
                <input
                  type="text"
                  value={myBusiness.name}
                  onChange={e => updateBusiness(myBusiness.id, { name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Shop Slug URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={myBusiness.slug}
                    onChange={e => updateBusiness(myBusiness.id, { slug: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-neutral-300"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getShopUrl(myBusiness.slug));
                      showToast('Shop link copied!');
                    }}
                    className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl whitespace-nowrap"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  County (47 Kenyan Counties) *
                </label>
                <select
                  value={myBusiness.county || selectedCounty}
                  onChange={e => {
                    const newCounty = e.target.value;
                    setSelectedCounty(newCounty);
                    updateBusiness(myBusiness.id, {
                      county: newCounty,
                      location: `${exactLocation || myBusiness.exact_location || myBusiness.location || ''}, ${newCounty} County`.replace(/^, /, ''),
                    });
                  }}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                >
                  {KENYA_COUNTIES.map(c => (
                    <option key={c.code} value={c.name}>
                      {c.name} County (Code {c.code}) - {c.majorTowns[0]}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Enables customers anywhere across all 47 counties to discover your shop by county and town.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Exact Location / Building / Street *
                </label>
                <input
                  type="text"
                  value={myBusiness.exact_location || exactLocation}
                  onChange={e => {
                    const newLoc = e.target.value;
                    setExactLocation(newLoc);
                    updateBusiness(myBusiness.id, {
                      exact_location: newLoc,
                      location: `${newLoc}, ${myBusiness.county || selectedCounty} County`,
                    });
                  }}
                  placeholder="e.g. Kimathi House, 2nd Floor, Room 14, Kimathi Street"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Specific street, shopping mall, floor, or room for local buyers to find you.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Delivery Fee (KSh)
                </label>
                <input
                  type="number"
                  value={myBusiness.delivery_fee}
                  onChange={e => updateBusiness(myBusiness.id, { delivery_fee: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 7: PAYMENTS (HASHBACK)
        ========================================================================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                M-Pesa Direct Crediting & Payouts
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Connect your business settlement account so buyer payments credit directly to you.
              </p>
            </div>

            {/* Direct Merchant Settlement Configuration Card */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900">
                      Seller Account Crediting (Direct Settlement)
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Customer payments route directly to your business account to prevent website middleman holding.
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Direct Crediting Active</span>
                </span>
              </div>

              {/* Exclusive Merchant Control Banner */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900">
                    Exclusive Merchant Control
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Only you as the authenticated seller can configure or change your shop&apos;s payment methods, Till number, Paybill, and Pochi details here. Shoppers on your store only receive locked, read-only payment credentials.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSettlement} className="space-y-6">
                {/* Method Selector with multi-selection support */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-800">
                        Select Payment Methods Accepted by Your Shop:
                      </label>
                      <p className="text-[11px] text-neutral-500">
                        You can enable Till, Paybill, Pochi la Biashara, or all three simultaneously.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleEnableAllMethods}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl transition-colors self-start sm:self-auto flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Enable All 3 Methods</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Till Card */}
                    <div
                      onClick={() => togglePaymentMethod('till')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        enabledMethods.includes('till')
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Store className={`w-4 h-4 ${enabledMethods.includes('till') ? 'text-emerald-600' : 'text-neutral-400'}`} />
                          <span className="text-xs font-extrabold text-neutral-900">Buy Goods Till</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={enabledMethods.includes('till')}
                          onChange={() => {}}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Safaricom Buy Goods Till for in-store &amp; online merchant checkout.
                      </p>
                    </div>

                    {/* Paybill Card */}
                    <div
                      onClick={() => togglePaymentMethod('paybill')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        enabledMethods.includes('paybill')
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Building2 className={`w-4 h-4 ${enabledMethods.includes('paybill') ? 'text-emerald-600' : 'text-neutral-400'}`} />
                          <span className="text-xs font-extrabold text-neutral-900">Paybill &amp; Account</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={enabledMethods.includes('paybill')}
                          onChange={() => {}}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Business Paybill with unique customer account reference.
                      </p>
                    </div>

                    {/* Pochi Card */}
                    <div
                      onClick={() => togglePaymentMethod('pochi')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        enabledMethods.includes('pochi')
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <PhoneCall className={`w-4 h-4 ${enabledMethods.includes('pochi') ? 'text-emerald-600' : 'text-neutral-400'}`} />
                          <span className="text-xs font-extrabold text-neutral-900">Pochi la Biashara</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={enabledMethods.includes('pochi')}
                          onChange={() => {}}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Direct merchant mobile line separated from personal M-Pesa.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Configuration Input Panels for each enabled method */}
                <div className="space-y-4">
                  {/* Till Inputs */}
                  {enabledMethods.includes('till') && (
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                        <Store className="w-4 h-4 text-emerald-600" />
                        <span>Buy Goods Till Details</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                            Buy Goods Till Number *
                          </label>
                          <input
                            type="text"
                            required
                            value={tillNumber}
                            onChange={e => setTillNumber(e.target.value)}
                            placeholder="e.g. 5928341"
                            className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-neutral-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                            Registered Store / Business Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={storeName}
                            onChange={e => setStoreName(e.target.value)}
                            placeholder="e.g. John's Shoes CBD"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Paybill Inputs */}
                  {enabledMethods.includes('paybill') && (
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span>Paybill Details</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                            Safaricom Paybill Business Number *
                          </label>
                          <input
                            type="text"
                            required
                            value={paybillNumber}
                            onChange={e => setPaybillNumber(e.target.value)}
                            placeholder="e.g. 400200"
                            className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-neutral-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                            Account Number / Reference Format *
                          </label>
                          <input
                            type="text"
                            required
                            value={paybillAccount}
                            onChange={e => setPaybillAccount(e.target.value)}
                            placeholder="e.g. JOHNSHOES or Order Number"
                            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pochi Inputs */}
                  {enabledMethods.includes('pochi') && (
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                        <PhoneCall className="w-4 h-4 text-amber-600" />
                        <span>Pochi la Biashara Details</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                            Pochi la Biashara Registered Phone *
                          </label>
                          <input
                            type="tel"
                            required
                            value={pochiPhone}
                            onChange={e => setPochiPhone(e.target.value)}
                            placeholder="e.g. 0712345678"
                            className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-neutral-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                            Registered Merchant Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={pochiName}
                            onChange={e => setPochiName(e.target.value)}
                            placeholder="e.g. John Mwangi"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPayoutEnabled}
                      onChange={e => setAutoPayoutEnabled(e.target.checked)}
                      className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-neutral-700 font-medium">
                      Enable instant auto-settlement on M-Pesa PIN confirmation
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSavingSettlement}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    {isSavingSettlement ? 'Verifying & Saving...' : 'Save Settlement Account'}
                  </button>
                </div>
              </form>
            </div>

            <div>
              <h2 className="text-sm font-bold text-neutral-900 mb-2">
                Recent Gateway Transactions & Settlement Logs
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Gateway Tx ID</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">M-Pesa Phone</th>
                    <th className="py-3 px-4">Gateway</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {bizPayments.map(p => (
                    <tr key={p.id} className="hover:bg-neutral-50/60 font-mono">
                      <td className="py-3 px-4 font-bold text-neutral-900">
                        {p.gateway_transaction_id}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-neutral-900">
                        KSh {p.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">{p.phone_number}</td>
                      <td className="py-3 px-4 text-neutral-500 capitalize">{p.gateway}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-400">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 8: SUBSCRIPTION
        ========================================================================= */}
        {activeTab === 'subscription' && myBusiness && (
          <div className="space-y-8">
            {/* Header & Plan Status Banner */}
            <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 text-white rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Active Store Subscription</span>
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {myBusiness.name} &bull; {myBusiness.subscription_plan_id.replace('plan_', '').toUpperCase()} PLAN
                  </h1>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                    Upgrade anytime to expand your product catalog and unlock automated Hashback M-Pesa payment features.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-right shrink-0">
                  <span className="text-[11px] text-neutral-400 block font-medium">Catalog Usage</span>
                  <div className="text-xl font-black text-white mt-0.5">
                    {bizProducts.length} <span className="text-xs text-neutral-400 font-normal">products uploaded</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-end gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Lipa na M-Pesa Enabled</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 30-Day Free Trial Information Card */}
            <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                    30D
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-neutral-900">
                      1st Month Free Trial &bull; Day {trialInfo.daysElapsed} of 30
                    </h2>
                    <p className="text-xs text-neutral-500">
                      {trialInfo.daysRemaining > 0
                        ? `${trialInfo.daysRemaining} days remaining until subscription billing starts on ${trialInfo.trialEndDateFormatted}`
                        : `Your 30-day free trial period has concluded on ${trialInfo.trialEndDateFormatted}`}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 self-start sm:self-auto">
                  {trialInfo.daysRemaining > 0 ? 'Free Month Active' : 'Subscription Due'}
                </span>
              </div>

              {/* Day progress indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-neutral-600 font-medium">
                  <span>Day 1: Shop Created</span>
                  <span className="font-bold text-emerald-800">
                    Day {trialInfo.daysElapsed} of 30 ({trialInfo.daysRemaining} free days left)
                  </span>
                  <span>Day 30: Subscription Starts</span>
                </div>
                <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, trialInfo.percentComplete)}%` }}
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  All shops get 30 full days without platform charge. You can select your ongoing subscription plan below at any point before or on Day 30.
                </p>
              </div>
            </div>

            {/* Subscription Plans Grid */}
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-neutral-900">Choose or Switch Your Plan</h2>
                <p className="text-xs text-neutral-500">
                  Select a plan below to pay securely via Safaricom M-Pesa STK Push or Paybill 400200.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => {
                  const isCurrent = myBusiness.subscription_plan_id === plan.id;

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-3xl p-6 sm:p-7 border flex flex-col justify-between transition-all relative ${
                        isCurrent
                          ? 'bg-neutral-900 text-white border-emerald-500 shadow-lg ring-2 ring-emerald-500/20'
                          : 'bg-white text-neutral-900 border-neutral-200 shadow-xs hover:border-emerald-300'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                          Most Popular
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-extrabold">{plan.name}</h3>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-neutral-950 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Current Plan</span>
                            </span>
                          )}
                        </div>

                        <p className={`text-xs mt-1.5 ${isCurrent ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {plan.description}
                        </p>

                        <div className="mt-5 pb-5 border-b border-neutral-200/20">
                          <span className="text-3xl font-black">
                            KSh {plan.price.toLocaleString()}
                          </span>
                          <span className={`text-xs ml-1 ${isCurrent ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            /month
                          </span>
                        </div>

                        <ul className="mt-5 space-y-2.5 text-xs">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <CheckCircle2
                                className={`w-4 h-4 shrink-0 mt-0.5 ${
                                  isCurrent ? 'text-emerald-400' : 'text-emerald-600'
                                }`}
                              />
                              <span className={isCurrent ? 'text-neutral-300' : 'text-neutral-700'}>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        <button
                          onClick={() => {
                            setSelectedPlanForPayment(plan);
                            setIsSubscriptionModalOpen(true);
                          }}
                          disabled={isCurrent}
                          className={`w-full py-3 rounded-2xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                            isCurrent
                              ? 'bg-neutral-800 text-neutral-500 cursor-default border border-neutral-700'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Active Current Plan</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>
                                {plan.price === 0
                                  ? 'Switch to Free (KSh 0)'
                                  : `Upgrade & Pay (KSh ${plan.price.toLocaleString()})`}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* How Subscription Payments Work Information Box */}
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    How Subscription Payments Work in Kenya
                  </h3>
                  <p className="text-xs text-neutral-500">
                    All upgrades are processed transparently in Kenya Shillings (KSh) through Hashback M-Pesa Gateway.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900">Instant M-Pesa STK Push</h4>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Click &quot;Upgrade &amp; Pay&quot; to receive a direct Lipa na M-Pesa PIN prompt on your phone screen. Enter your PIN to approve.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900">Manual Paybill 400200</h4>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Alternatively, pay via M-Pesa Paybill <strong>400200</strong> using account <strong>SUB-{myBusiness.slug.toUpperCase()}</strong> and paste your SMS code.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900">Instant Activation &amp; Receipt</h4>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Your store limits upgrade instantly upon Safaricom verification, and an official printable tax invoice is created.
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Payment Receipts History */}
            {payments.filter(p => p.business_id === myBusiness.id && (p.order_id.startsWith('sub-') || p.callback_data?.type === 'subscription_payment')).length > 0 && (
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Subscription Payment Receipts</h3>
                    <p className="text-xs text-neutral-500">History of your M-Pesa subscription renewals and receipts.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                      <tr>
                        <th className="py-2.5 px-3">Receipt Code</th>
                        <th className="py-2.5 px-3">Plan</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">Gateway</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-mono">
                      {payments
                        .filter(p => p.business_id === myBusiness.id && (p.order_id.startsWith('sub-') || p.callback_data?.type === 'subscription_payment'))
                        .map(p => (
                          <tr key={p.id} className="hover:bg-neutral-50/50">
                            <td className="py-2.5 px-3 font-bold text-neutral-900">{p.gateway_transaction_id}</td>
                            <td className="py-2.5 px-3 font-sans font-semibold text-neutral-800">{p.callback_data?.plan_name || 'Plan'}</td>
                            <td className="py-2.5 px-3 font-bold text-neutral-950">KSh {p.amount.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-neutral-600">{p.phone_number}</td>
                            <td className="py-2.5 px-3 text-neutral-500 capitalize">{p.gateway}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 font-sans">
                                {p.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-neutral-400 text-[11px]">{new Date(p.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 9: PROFILE
        ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                Owner Profile
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">Account credentials and contact.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-3 text-xs">
              <div>
                <span className="text-neutral-400 block font-medium">Business Email:</span>
                <span className="font-bold text-neutral-900">{myBusiness?.email}</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-medium">Phone Number:</span>
                <span className="font-bold text-neutral-900">{myBusiness?.phone}</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-medium">Location:</span>
                <span className="font-bold text-neutral-900">{myBusiness?.location}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in my-8">
            <h3 className="text-base font-bold text-neutral-900 mb-4">
              {editingProductId ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Leather Oxford Shoes"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Regular Price (KSh) *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Sale Price (Optional)
                  </label>
                  <input
                    type="number"
                    value={productForm.sale_price}
                    onChange={e => setProductForm({ ...productForm, sale_price: e.target.value })}
                    placeholder="e.g. 1999"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.stock_quantity}
                    onChange={e =>
                      setProductForm({ ...productForm, stock_quantity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={productForm.image_url}
                  onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_active}
                    onChange={e => setProductForm({ ...productForm, is_active: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Active for sale</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={e => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Featured product</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Save Product
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Subscription Payment & M-Pesa Checkout Modal */}
      <SubscriptionPaymentModal
        plan={selectedPlanForPayment}
        isOpen={isSubscriptionModalOpen}
        onClose={() => {
          setIsSubscriptionModalOpen(false);
          setSelectedPlanForPayment(null);
        }}
      />
      {/* Store Link & QR Code Modal */}
      {myBusiness && (
        <ShopLinkModal
          isOpen={isShopLinkModalOpen}
          onClose={() => setIsShopLinkModalOpen(false)}
          business={myBusiness}
        />
      )}
    </div>
  );
};
