import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  Store,
  LayoutDashboard,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  MessageCircle,
  LogIn,
  Package,
  Sparkles,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { ASSISTANCE_CONFIG, buildWhatsAppUrl } from '../lib/assistanceConfig';

export const Navbar: React.FC = () => {
  const {
    user,
    logout,
    openAuthModal,
    currentRoute,
    navigateTo,
    cart,
    setIsCartOpen,
    myBusiness,
  } = useApp();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigateTo('landing')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/20 transition-transform group-hover:scale-105">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-neutral-900">
                    ShopLink
                  </span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    KENYA
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 hidden sm:block">
                  M-Pesa Powered Online Stores
                </p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigateTo('landing')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentRoute === 'landing'
                    ? 'text-emerald-700 bg-emerald-50 font-bold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => navigateTo('marketplace')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentRoute === 'marketplace'
                    ? 'text-emerald-700 bg-emerald-50 font-bold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                Explore Shops
              </button>
              <button
                onClick={() => navigateTo('shop', 'john-shoes')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentRoute === 'shop'
                    ? 'text-emerald-700 bg-emerald-50 font-bold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                Demo Store
              </button>

              {/* Conditional routes based solely on authenticated profile */}
              {user?.role === 'business_owner' && (
                <button
                  onClick={() => navigateTo('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentRoute === 'dashboard'
                      ? 'text-emerald-700 bg-emerald-50 font-bold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                  <span>Dashboard</span>
                </button>
              )}

              {user?.role === 'customer' && (
                <button
                  onClick={() => navigateTo('customer-orders')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentRoute === 'customer-orders'
                      ? 'text-blue-700 bg-blue-50 font-bold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>My Orders</span>
                </button>
              )}

              {user?.role === 'admin' && (
                <button
                  onClick={() => navigateTo('admin')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentRoute === 'admin'
                      ? 'text-purple-700 bg-purple-50 font-bold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Admin Panel</span>
                </button>
              )}
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WhatsApp Assistance Helpline */}
            <a
              href={buildWhatsAppUrl('Hello ShopLink Support Desk, I need assistance.')}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
              title="Official WhatsApp Assistance Helpline"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Support</span>
            </a>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors text-left"
                >
                  <div
                    className={`w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center ${
                      user.role === 'admin'
                        ? 'bg-purple-700'
                        : user.role === 'business_owner'
                        ? 'bg-emerald-600'
                        : 'bg-blue-600'
                    }`}
                  >
                    {getInitials(user.full_name)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-neutral-900 leading-tight">
                      {user.full_name}
                    </p>
                    <p className="text-[10px] text-neutral-500 font-medium capitalize">
                      {user.role === 'business_owner'
                        ? 'Shop Owner'
                        : user.role === 'customer'
                        ? 'Shopper'
                        : 'Administrator'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-0.5" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    {/* User Profile Card */}
                    <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
                      <p className="text-xs font-extrabold text-neutral-900">
                        {user.full_name}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                        {user.email || user.phone}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize">
                        {user.role === 'business_owner' && (
                          <span className="bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1">
                            <Store className="w-3 h-3 text-emerald-600" />
                            <span>Store Owner</span>
                          </span>
                        )}
                        {user.role === 'customer' && (
                          <span className="bg-blue-50 text-blue-800 border-blue-200 flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3 text-blue-600" />
                            <span>Shopper</span>
                          </span>
                        )}
                        {user.role === 'admin' && (
                          <span className="bg-purple-50 text-purple-800 border-purple-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-purple-600" />
                            <span>Platform Admin</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Links strictly for their role */}
                    <div className="py-1">
                      {user.role === 'business_owner' && (
                        <>
                          <button
                            onClick={() => {
                              navigateTo('dashboard');
                              setProfileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 font-medium"
                          >
                            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                            <span>My Shop Dashboard</span>
                          </button>
                          <button
                            onClick={() => {
                              navigateTo('shop', myBusiness?.slug || 'john-shoes');
                              setProfileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 font-medium"
                          >
                            <Store className="w-4 h-4 text-neutral-500" />
                            <span>View My Live Storefront</span>
                          </button>
                        </>
                      )}

                      {user.role === 'customer' && (
                        <>
                          <button
                            onClick={() => {
                              navigateTo('customer-orders');
                              setProfileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 font-medium"
                          >
                            <Package className="w-4 h-4 text-blue-600" />
                            <span>My Orders & Deliveries</span>
                          </button>
                          <button
                            onClick={() => {
                              navigateTo('marketplace');
                              setProfileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 font-medium"
                          >
                            <ShoppingBag className="w-4 h-4 text-neutral-500" />
                            <span>Browse Kenyan Stores</span>
                          </button>
                        </>
                      )}

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            navigateTo('admin');
                            setProfileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-purple-700 hover:bg-purple-50 flex items-center gap-2.5 font-bold"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Admin Control Console</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-neutral-100 pt-1 mt-1">
                      <button
                        onClick={() => {
                          logout();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Signed out / Visitor State */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openAuthModal('merchant', 'signin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => openAuthModal('customer', 'signup')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold transition-colors shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            )}

            {/* Role-adaptive CTA: Business owners see Dashboard, Shoppers see My Orders, Visitors see Explore Shops */}
            {user?.role === 'business_owner' ? (
              <button
                onClick={() => navigateTo('dashboard')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            ) : user?.role === 'customer' ? (
              <button
                onClick={() => navigateTo('customer-orders')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Package className="w-3.5 h-3.5" />
                <span>My Orders</span>
              </button>
            ) : (
              <button
                onClick={() => navigateTo('marketplace')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Explore Shops</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-5 space-y-3">
          {user ? (
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-neutral-900">{user.full_name}</p>
                <p className="text-[11px] text-neutral-500 capitalize">
                  {user.role === 'business_owner'
                    ? 'Store Owner'
                    : user.role === 'customer'
                    ? 'Shopper'
                    : 'Admin'}
                </p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-600 font-bold px-2.5 py-1 rounded-lg hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  openAuthModal('merchant', 'signin');
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-800 text-center hover:bg-neutral-50"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  openAuthModal('customer', 'signup');
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold text-center shadow-xs hover:bg-neutral-800"
              >
                Create Account
              </button>
            </div>
          )}

          <div className="space-y-1 pt-1">
            <button
              onClick={() => {
                navigateTo('landing');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Home
            </button>
            <button
              onClick={() => {
                navigateTo('marketplace');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Explore Kenyan Shops
            </button>
            <button
              onClick={() => {
                navigateTo('shop', 'john-shoes');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Demo Store (John&apos;s Shoes)
            </button>

            {user?.role === 'business_owner' && (
              <button
                onClick={() => {
                  navigateTo('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>My Shop Dashboard</span>
              </button>
            )}

            {user?.role === 'customer' && (
              <button
                onClick={() => {
                  navigateTo('customer-orders');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 flex items-center gap-2"
              >
                <Package className="w-4 h-4 text-blue-600" />
                <span>My Orders & Deliveries</span>
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  navigateTo('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-purple-700 bg-purple-50 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Platform Admin Console</span>
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-neutral-200">
            <a
              href={buildWhatsAppUrl('Hello ShopLink Support Desk, I need help.')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Assistance</span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <span>Chat Online</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
