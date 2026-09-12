import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Store,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Smartphone,
  Mail,
  User,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    navigateTo,
    businesses,
  } = useApp();

  const [merchantInput, setMerchantInput] = useState('john@shoeske.com');
  const [customerPhone, setCustomerPhone] = useState('0711445566');
  const [customerName, setCustomerName] = useState('David Mwangi');
  const [adminEmail, setAdminEmail] = useState('admin@shoplink.co.ke');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleMerchantLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(merchantInput, 'business_owner', true);
    closeAuthModal();
  };

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(customerPhone, 'customer', true);
    closeAuthModal();
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    if (!adminPassword || adminPassword.length < 4) {
      setAdminError('Please enter valid administrator credentials.');
      return;
    }
    login(adminEmail, 'admin', true);
    closeAuthModal();
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={e => {
        if ((e.target as HTMLElement).id === 'auth-modal-backdrop') {
          closeAuthModal();
        }
      }}
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-neutral-100 bg-neutral-50/50">
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
              S
            </div>
            <span className="font-extrabold text-neutral-900 text-lg tracking-tight">
              Sign In to ShopLink
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Access your account based on your profile
          </p>

          {/* Profile Tabs */}
          <div className="mt-4 grid grid-cols-2 p-1 bg-neutral-200/60 rounded-xl text-xs font-bold">
            <button
              onClick={() => setAuthModalTab('merchant')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                authModalTab === 'merchant'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Shop Owner</span>
            </button>
            <button
              onClick={() => setAuthModalTab('customer')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                authModalTab === 'customer'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
              <span>Shopper</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {authModalTab === 'merchant' && (
            <form onSubmit={handleMerchantLogin} className="space-y-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-2">
                  Merchant Account
                </span>
                <h3 className="text-sm font-extrabold text-neutral-900">
                  Manage Your Online Shop
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Directs you immediately to your store dashboard, inventory, and M-Pesa sales.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Registered Shop Email or Phone *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={merchantInput}
                    onChange={e => setMerchantInput(e.target.value)}
                    placeholder="e.g. john@shoeske.com or 0712345678"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Quick Select demo stores for convenience */}
              <div>
                <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Or select your registered store:
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {businesses.slice(0, 3).map(biz => (
                    <button
                      type="button"
                      key={biz.id}
                      onClick={() => setMerchantInput(biz.email)}
                      className={`w-full text-left p-2 rounded-xl text-xs border flex items-center justify-between transition-colors ${
                        merchantInput === biz.email
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={biz.logo_url}
                          alt={biz.name}
                          className="w-5 h-5 rounded-md object-cover border border-neutral-200"
                        />
                        <span className="truncate">{biz.name}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {biz.email}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-colors"
              >
                <span>Sign In to Shop Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-neutral-100 text-center">
                <p className="text-xs text-neutral-600">
                  Don&apos;t have an online shop yet?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeAuthModal();
                    navigateTo('business-register');
                  }}
                  className="mt-1.5 font-bold text-xs text-emerald-700 hover:text-emerald-800 underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Your Shop in 2 Minutes</span>
                </button>
              </div>
            </form>
          )}

          {authModalTab === 'customer' && (
            <form onSubmit={handleCustomerLogin} className="space-y-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200 mb-2">
                  Shopper Profile
                </span>
                <h3 className="text-sm font-extrabold text-neutral-900">
                  Track Your Orders & Deliveries
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Directs you immediately to your customer order history and M-Pesa payment receipts.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Customer Mobile Number (M-Pesa) *
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="0711445566"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="David Mwangi"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-colors"
              >
                <span>Sign In & View My Orders</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-neutral-100 text-center">
                <p className="text-xs text-neutral-600">
                  Want to browse Kenyan stores first?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeAuthModal();
                    navigateTo('marketplace');
                  }}
                  className="mt-1.5 font-bold text-xs text-blue-700 hover:text-blue-800 underline inline-flex items-center gap-1"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Browse Public Stores</span>
                </button>
              </div>
            </form>
          )}

          {authModalTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[11px] font-bold border border-purple-200 mb-2">
                  System Administration
                </span>
                <h3 className="text-sm font-extrabold text-neutral-900">
                  Platform Admin Console
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Restricted to ShopLink system operators.
                </p>
              </div>

              {adminError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {adminError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Admin Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Admin Security PIN / Key *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password (e.g. admin123)"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Access Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Discreet Admin link for developers / admins only */}
          {authModalTab !== 'admin' && (
            <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-center">
              <button
                type="button"
                onClick={() => setAuthModalTab('admin')}
                className="text-[10px] text-neutral-400 hover:text-neutral-700 flex items-center gap-1 transition-colors"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Platform Administrator Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
