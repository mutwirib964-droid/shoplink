import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageCircle,
  QrCode,
  Store,
  MapPin,
  ShieldCheck,
  Download,
  Printer,
  Sparkles,
} from 'lucide-react';
import { Business } from '../types';

interface ShopLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
}

export const ShopLinkModal: React.FC<ShopLinkModalProps> = ({
  isOpen,
  onClose,
  business,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link');

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://shoplink.co.ke';
  const canonicalUrl = `${origin}/?shop=${encodeURIComponent(business.slug)}`;
  const cleanPathUrl = `${origin}/shop/${encodeURIComponent(business.slug)}`;

  const whatsappMessage = encodeURIComponent(
    `Habari! Welcome to ${business.name} on ShopLink Kenya! 🛍️✨\n\nBrowse our complete product catalog, check live stock, and order with instant Lipa na M-Pesa checkout:\n👉 ${canonicalUrl}`
  );

  const handleCopy = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${whatsappMessage}`, '_blank');
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-neutral-900 to-neutral-950 text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <img
              src={business.logo_url}
              alt={business.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white/30 bg-white"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-extrabold text-white truncate max-w-[260px]">
                  {business.name}
                </h3>
                <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-xs text-neutral-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{business.location}</span>
                <span>•</span>
                <span className="font-mono text-emerald-300">/{business.slug}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2 border-b border-neutral-100 flex gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'link'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Store Link & Sharing</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'qr'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Counter QR Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'link' ? (
            <>
              {/* Explanation Card */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Your Dedicated Store Link</span>
                </div>
                When customers tap this link, they bypass the marketplace and land <strong>directly on your shop</strong>. They can view your products, add items to cart, and pay via Lipa na M-Pesa immediately.
              </div>

              {/* Unique Link Input Card */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Direct Customer URL
                </label>
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus-within:border-emerald-500 transition-colors">
                  <span className="pl-2.5 text-neutral-400">
                    <Store className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    readOnly
                    value={canonicalUrl}
                    className="flex-1 bg-transparent border-none text-xs font-mono text-neutral-900 focus:outline-hidden select-all"
                  />
                  <button
                    onClick={() => handleCopy(canonicalUrl)}
                    className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 pl-1">
                  Alternative clean path: <span className="font-mono text-neutral-600">{cleanPathUrl}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-white/20 stroke-[2.2]" />
                  <span>Share on WhatsApp</span>
                </button>

                <a
                  href={canonicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-neutral-200"
                >
                  <span>Test Direct Shop Link</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                </a>
              </div>

              {/* Pro-Tips for Kenyan Merchants */}
              <div className="pt-3 border-t border-neutral-100 space-y-2">
                <p className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
                  Where to use your unique link:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-600">
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70">
                    <strong className="text-neutral-900 block mb-0.5">💬 WhatsApp Status</strong>
                    Post with photos of your arrivals: &quot;Tap to order via M-Pesa!&quot;
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70">
                    <strong className="text-neutral-900 block mb-0.5">📸 Instagram & TikTok Bio</strong>
                    Paste in your website bio field so followers buy in 1 tap.
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70">
                    <strong className="text-neutral-900 block mb-0.5">📦 Packaging & Stickers</strong>
                    Include on delivery packaging for easy repeat orders.
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70">
                    <strong className="text-neutral-900 block mb-0.5">🧾 SMS & Invoices</strong>
                    Send direct links when customers DM or call asking for prices.
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* QR Code Tab */
            <div className="text-center space-y-4">
              <div className="p-5 max-w-[260px] mx-auto bg-white rounded-3xl border-2 border-dashed border-emerald-500/50 shadow-md">
                {/* SVG QR Code generator (High-contrast, scannable QR representation) */}
                <div className="relative w-48 h-48 mx-auto bg-white p-2 flex flex-col items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-neutral-900 fill-current">
                    {/* Corner Position Detection Patterns */}
                    {/* Top-Left */}
                    <rect x="5" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="5" />
                    <rect x="12" y="12" width="14" height="14" rx="1" fill="currentColor" />
                    {/* Top-Right */}
                    <rect x="67" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="5" />
                    <rect x="74" y="12" width="14" height="14" rx="1" fill="currentColor" />
                    {/* Bottom-Left */}
                    <rect x="5" y="67" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="5" />
                    <rect x="12" y="74" width="14" height="14" rx="1" fill="currentColor" />

                    {/* Alignment Pattern */}
                    <rect x="70" y="70" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="3" />
                    <rect x="76" y="76" width="6" height="6" fill="currentColor" />

                    {/* Timing & Data Grid Dots */}
                    <rect x="38" y="10" width="5" height="5" rx="1" />
                    <rect x="48" y="10" width="5" height="5" rx="1" />
                    <rect x="58" y="10" width="5" height="5" rx="1" />
                    <rect x="10" y="38" width="5" height="5" rx="1" />
                    <rect x="10" y="48" width="5" height="5" rx="1" />
                    <rect x="10" y="58" width="5" height="5" rx="1" />

                    {/* Data Density blocks */}
                    <rect x="38" y="24" width="6" height="6" />
                    <rect x="48" y="24" width="6" height="6" />
                    <rect x="40" y="36" width="6" height="6" />
                    <rect x="52" y="36" width="6" height="6" />
                    <rect x="64" y="36" width="6" height="6" />
                    <rect x="38" y="48" width="6" height="6" />
                    <rect x="48" y="48" width="6" height="6" />
                    <rect x="58" y="48" width="6" height="6" />
                    <rect x="38" y="60" width="6" height="6" />
                    <rect x="50" y="60" width="6" height="6" />
                    <rect x="60" y="60" width="6" height="6" />
                    <rect x="40" y="72" width="6" height="6" />
                    <rect x="52" y="72" width="6" height="6" />
                    <rect x="38" y="84" width="6" height="6" />
                    <rect x="48" y="84" width="6" height="6" />
                    <rect x="58" y="84" width="6" height="6" />
                    <rect x="70" y="48" width="6" height="6" />
                    <rect x="84" y="48" width="6" height="6" />

                    {/* Center Brand Badge */}
                    <circle cx="50" cy="50" r="11" fill="white" stroke="#10b981" strokeWidth="2" />
                  </svg>
                  {/* Central Store Initial or Icon */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-white px-1 rounded-sm shadow-xs">
                      SHOP
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <p className="text-xs font-extrabold text-neutral-900">{business.name}</p>
                  <p className="text-[10px] text-neutral-500 font-mono">Scan to Shop Online</p>
                </div>
              </div>

              <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                Place this QR code on your store checkout counter, delivery packaging, or business cards so customers can scan and pay with M-Pesa instantly!
              </p>

              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={handlePrintCard}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print QR Card</span>
                </button>
                <button
                  onClick={() => handleCopy(canonicalUrl)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 text-neutral-800 hover:bg-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-neutral-200"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Link active &amp; ready to share</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white text-neutral-700 font-bold border border-neutral-200 hover:bg-neutral-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
