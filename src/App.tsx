/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Marketplace } from './components/Marketplace';
import { ShopView } from './components/ShopView';
import { BusinessDashboard } from './components/BusinessDashboard';
import { BusinessRegister } from './components/BusinessRegister';
import { AdminPanel } from './components/AdminPanel';
import { CustomerOrders } from './components/CustomerOrders';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppAssistanceWidget } from './components/WhatsAppAssistanceWidget';
import { AuthModal } from './components/AuthModal';
import { Check, ShieldCheck, Heart, MessageCircle, Phone } from 'lucide-react';
import { ASSISTANCE_CONFIG, buildWhatsAppUrl } from './lib/assistanceConfig';

const AppContent: React.FC = () => {
  const { currentRoute, toastMessage } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Global Navigation */}
      <Navbar />

      {/* Dynamic View Router */}
      <div className="flex-1">
        {currentRoute === 'landing' && <LandingPage />}
        {currentRoute === 'marketplace' && <Marketplace />}
        {currentRoute === 'shop' && <ShopView />}
        {currentRoute === 'dashboard' && <BusinessDashboard />}
        {(currentRoute === 'create-shop' || currentRoute === 'business-register') && <BusinessRegister />}
        {currentRoute === 'admin' && <AdminPanel />}
        {currentRoute === 'customer-orders' && <CustomerOrders />}
      </div>

      {/* Global Shopping Cart Slide-over */}
      <CartDrawer />

      {/* Global User Authentication Modal (Shop Owner / Shopper / Admin) */}
      <AuthModal />

      {/* Global WhatsApp & AI Assistance Floating Desk */}
      <WhatsAppAssistanceWidget />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-neutral-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-neutral-800 text-xs font-semibold">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Global Footer (shown on landing, marketplace, customer-orders) */}
      {['landing', 'marketplace', 'customer-orders'].includes(currentRoute) && (
        <footer className="bg-neutral-900 text-neutral-400 py-12 border-t border-neutral-800 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500 text-neutral-950 font-black flex items-center justify-center text-xs">
                  S
                </div>
                <span className="font-extrabold text-white text-sm">
                  ShopLink <span className="text-emerald-400 font-normal">Kenya</span>
                </span>
                <span className="text-neutral-500 text-[11px] ml-2">
                  • Empowering Kenyan Small & Medium Businesses
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-neutral-400">
                <a
                  href={buildWhatsAppUrl('Hello ShopLink Support Desk, I need assistance with my store or order.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Assistance</span>
                </a>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hashback M-Pesa Certified</span>
                </span>
                <span>•</span>
                <span>Nairobi, Kenya</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500">
              <p>© {new Date().getFullYear()} ShopLink Kenya SaaS Ltd. All rights reserved.</p>
              <div className="mt-2 sm:mt-0 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  Built for Kenyan entrepreneurs selling on WhatsApp, Instagram & Retail.
                </span>
                <span>•</span>
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Chat with Support Agent on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
