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
  Eye,
  EyeOff,
  Copy,
  Check,
  Database,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SUPABASE_SETUP_SQL } from '../lib/supabaseSql';
import { supabaseUrl } from '../lib/supabase';
import { SUPERADMIN_IDENTITY } from '../lib/adminAuth';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    authModalMode,
    setAuthModalMode,
    loginWithPassword,
    registerWithPassword,
    navigateTo,
    businesses,
    isSupabaseConfigured,
    showToast,
  } = useApp();

  // Mode: 'signin' | 'signup'
  const mode = authModalMode;
  const setMode = setAuthModalMode;

  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState('john@shoeske.com');
  const [signInPassword, setSignInPassword] = useState('demo123');

  // Sign Up inputs
  const [signUpRole, setSignUpRole] = useState<'customer' | 'business_owner'>('customer');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSqlDrawer, setShowSqlDrawer] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    showToast('Supabase SQL copied to clipboard! Paste in your Supabase SQL Editor.');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const targetRole = authModalTab === 'admin' ? 'admin' : authModalTab === 'customer' ? 'customer' : 'business_owner';
      const result = await loginWithPassword(signInEmail, signInPassword, targetRole, true);

      if (!result.success) {
        setErrorMessage(result.error || 'Invalid credentials. Please verify your email/password.');
        return;
      }

      closeAuthModal();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPhone.trim()) {
      setErrorMessage('Please fill in your name, email, and phone number.');
      return;
    }

    if (!signUpPassword || signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerWithPassword(
        signUpName.trim(),
        signUpEmail.trim().toLowerCase(),
        signUpPhone.trim(),
        signUpRole,
        signUpPassword
      );

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to create account.');
        return;
      }

      closeAuthModal();

      if (signUpRole === 'business_owner') {
        navigateTo('business-register');
      } else {
        navigateTo('marketplace');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={e => {
        if ((e.target as HTMLElement).id === 'auth-modal-backdrop') {
          closeAuthModal();
        }
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative px-6 pt-5 pb-3 border-b border-neutral-100 bg-neutral-50/70 shrink-0">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
              S
            </div>
            <div>
              <span className="font-extrabold text-neutral-900 text-base sm:text-lg tracking-tight">
                {mode === 'signup' ? 'Create Your Account' : 'Sign In to ShopLink'}
              </span>
              <p className="text-[11px] text-neutral-500">
                {mode === 'signup'
                  ? 'Sign up to shop or start selling across Kenya'
                  : 'Access your account or store'}
              </p>
            </div>
          </div>

          {/* Mode Switcher: Sign In vs Create Account */}
          <div className="mt-3 grid grid-cols-2 p-1 bg-neutral-200/70 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start justify-between gap-2">
              <div className="flex-1">
                <span>{errorMessage}</span>
                {errorMessage.toLowerCase().includes('sign in') && mode === 'signup' && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSignInEmail(signUpEmail);
                        setMode('signin');
                        setErrorMessage(null);
                      }}
                      className="inline-flex items-center gap-1 font-bold text-blue-700 underline text-xs hover:text-blue-800 cursor-pointer"
                    >
                      Click here to switch to Sign In
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-600 text-base font-bold leading-none px-1"
                aria-label="Dismiss error"
              >
                &times;
              </button>
            </div>
          )}

          {/* ============================================================= */}
          {/* SIGN UP FLOW */}
          {/* ============================================================= */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  I want to use ShopLink as:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSignUpRole('customer')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      signUpRole === 'customer'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className={`w-4 h-4 ${signUpRole === 'customer' ? 'text-blue-600' : 'text-neutral-500'}`} />
                      <span className="text-xs font-extrabold text-neutral-900">Shopper</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1 leading-snug">
                      Browse stores, place orders, and pay directly via M-Pesa.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignUpRole('business_owner')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      signUpRole === 'business_owner'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Store className={`w-4 h-4 ${signUpRole === 'business_owner' ? 'text-emerald-600' : 'text-neutral-500'}`} />
                      <span className="text-xs font-extrabold text-neutral-900">Shop Owner</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1 leading-snug">
                      Post products, set delivery fees, and receive direct payments.
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={e => setSignUpName(e.target.value)}
                    placeholder={signUpRole === 'customer' ? 'e.g. David Mwangi' : 'e.g. Mary Wanjiku'}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={e => setSignUpEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Phone Number (M-Pesa registered) *
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={signUpPhone}
                    onChange={e => setSignUpPhone(e.target.value)}
                    placeholder="e.g. 0712345678"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={signUpPassword}
                    onChange={e => setSignUpPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                  signUpRole === 'customer'
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span>{isLoading ? 'Creating Account...' : signUpRole === 'customer' ? 'Create Shopper Account' : 'Create Merchant Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-[11px] text-neutral-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </form>
          )}

          {/* ============================================================= */}
          {/* SIGN IN FLOW */}
          {/* ============================================================= */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Profile Tabs */}
              <div className="grid grid-cols-3 p-1 bg-neutral-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('merchant');
                    setSignInEmail('john@shoeske.com');
                    setSignInPassword('demo123');
                  }}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
                    authModalTab === 'merchant'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Shop Owner</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('customer');
                    setSignInEmail('customer@gmail.com');
                    setSignInPassword('demo123');
                  }}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
                    authModalTab === 'customer'
                      ? 'bg-white text-blue-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Shopper</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('admin');
                    setSignInEmail(SUPERADMIN_IDENTITY.EMAIL);
                    setSignInPassword('');
                  }}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
                    authModalTab === 'admin'
                      ? 'bg-white text-purple-950 shadow-xs ring-1 ring-purple-300'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>SuperAdmin</span>
                </button>
              </div>

              {authModalTab === 'admin' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-purple-900 font-bold">
                    <span>Sole SuperAdmin Authorization</span>
                    <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-mono">UID RESTRICTED</span>
                  </div>
                  <p className="text-purple-700 text-[11px] leading-relaxed">
                    Reserved exclusively for <strong>{SUPERADMIN_IDENTITY.FULL_NAME}</strong> ({SUPERADMIN_IDENTITY.EMAIL}). Only this account UID can access the platform administrative console.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {authModalTab === 'admin'
                    ? 'SuperAdmin Email *'
                    : authModalTab === 'merchant'
                    ? 'Shop Email or Phone *'
                    : 'Shopper Email or Phone *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                    placeholder={
                      authModalTab === 'admin'
                        ? SUPERADMIN_IDENTITY.EMAIL
                        : authModalTab === 'merchant'
                        ? 'e.g. john@shoeske.com'
                        : 'e.g. 0711445566 or email'
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Select demo stores for fast testing */}
              {authModalTab === 'merchant' && (
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Quick test stores:
                  </label>
                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                    {businesses.slice(0, 3).map(biz => (
                      <button
                        type="button"
                        key={biz.id}
                        onClick={() => {
                          setSignInEmail(biz.email);
                          setSignInPassword('demo123');
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs border flex items-center justify-between transition-colors ${
                          signInEmail === biz.email
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
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-colors ${
                  authModalTab === 'admin'
                    ? 'bg-purple-700 hover:bg-purple-800 shadow-purple-700/20'
                    : authModalTab === 'customer'
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span>
                  {isLoading
                    ? 'Authenticating...'
                    : authModalTab === 'admin'
                    ? 'Authenticate SuperAdmin Console'
                    : authModalTab === 'customer'
                    ? 'Sign In & View My Orders'
                    : 'Sign In to Shop Dashboard'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-neutral-600">
                  Don&apos;t have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    Create one now
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ============================================================= */}
          {/* SUPABASE SQL & DATABASE HELPER DRAWER */}
          {/* ============================================================= */}
          <div className="pt-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setShowSqlDrawer(!showSqlDrawer)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 py-1"
            >
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supabase Database & SQL Status</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isSupabaseConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isSupabaseConfigured ? 'Connected' : 'SQL Ready'}
                </span>
              </div>
              {showSqlDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showSqlDrawer && (
              <div className="mt-2.5 p-3 rounded-xl bg-neutral-900 text-neutral-200 text-xs space-y-3">
                <div className="p-2 rounded-lg bg-neutral-800/80 border border-neutral-700 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Connected Project:</span>
                    <span className="font-mono font-bold text-emerald-400 text-[10px]">
                      {supabaseUrl ? new URL(supabaseUrl).hostname : 'None'}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-neutral-700 text-[10px] text-neutral-300 space-y-1">
                    <p className="font-semibold text-white">Where to find user accounts in Supabase:</p>
                    <p className="text-neutral-300">
                      &bull; <strong className="text-emerald-300">Authentication &gt; Users:</strong> Shows all login credentials, emails, and user UUIDs.
                    </p>
                    <p className="text-neutral-300">
                      &bull; <strong className="text-emerald-300">Table Editor &gt; profiles:</strong> Shows shopper/seller names, phone numbers, and roles.
                    </p>
                    <p className="text-neutral-400 italic">
                      Note: Click the &ldquo;Refresh&rdquo; button in your Supabase dashboard to show recent signups.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-[11px]">PostgreSQL Tables & RLS</span>
                    <p className="text-[10px] text-neutral-400">
                      profiles, businesses, products, orders with public browsing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    {copiedSql ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL'}</span>
                  </button>
                </div>
                <pre className="p-2 bg-neutral-950 rounded-lg text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-24">
                  {SUPABASE_SETUP_SQL.slice(0, 380)}...
                </pre>
                <p className="text-[10px] text-neutral-400">
                  Run this in Supabase SQL Editor. Products posted will be instantly visible to all shoppers.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
