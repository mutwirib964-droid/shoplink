import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Smartphone,
  CreditCard,
  Package,
  Users,
  BarChart3,
  Share2,
  ChevronDown,
  Store,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Zap,
  MessageCircle,
  Phone,
  Headphones,
  ShoppingBag,
  Truck,
  Building2,
} from 'lucide-react';
import { ASSISTANCE_CONFIG, buildWhatsAppUrl } from '../lib/assistanceConfig';

export const LandingPage: React.FC = () => {
  const { user, navigateTo, businesses } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does shopping and M-Pesa payment work on ShopLink?',
      a: 'When you find items you like from any Kenyan store, add them to your cart and proceed to checkout. Enter your phone number and delivery location. An instant M-Pesa STK Push prompt will appear on your phone asking for your M-Pesa PIN. Once entered, payment is settled directly to the business owner.',
    },
    {
      q: 'How is the delivery fee calculated?',
      a: 'Because delivery distances vary across Kenyan estates and towns, delivery fees are calculated and confirmed by the seller based on your exact location. You can also choose free in-store pickup to collect your order directly from the seller\'s shop without delivery fees.',
    },
    {
      q: 'Does my payment go straight to the business owner?',
      a: 'Yes! All payments are processed through Hashback and credited directly to the verified business owner\'s account. You receive an immediate M-Pesa transaction reference and payment receipt on your screen.',
    },
    {
      q: 'Do I need to download an app or create an account to buy?',
      a: 'No app download is needed! You can browse shops, add items to cart, and checkout seamlessly in any mobile or desktop browser. You can also sign in with your phone number anytime to view your past orders and receipts.',
    },
    {
      q: 'How can I track the status of my order?',
      a: 'You can check your order status anytime by clicking "My Orders" in the navigation bar. You will see real-time updates as the seller prepares, packages, and dispatches your order with rider tracking details.',
    },
    {
      q: 'Can I chat directly with the seller before ordering?',
      a: 'Yes! Every store profile and product listing has a direct "Chat on WhatsApp" button so you can ask about sizes, colors, availability, or special requests directly with the shop owner.',
    },
  ];

  return (
    <div className="bg-neutral-50 min-h-screen text-neutral-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-24 border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kenya&apos;s Verified Online Stores & Local Businesses</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-tight">
              Discover & Shop Directly from{' '}
              <span className="text-emerald-600 underline decoration-emerald-200 decoration-wavy">
                Kenyan Stores
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-neutral-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Find authentic footwear, fashion, electronics, and essentials from local businesses across Nairobi and Kenya. Pay directly via instant M-Pesa STK push.
            </p>

            {/* Main Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={() => navigateTo('marketplace')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Kenyan Stores</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigateTo('shop', 'john-shoes')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-neutral-100 text-neutral-800 font-bold text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 border border-neutral-200"
              >
                <span>View John&apos;s Shoes Demo</span>
                <ExternalLink className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Discreet merchant link - only visible to unauthenticated visitors */}
            {!user && (
              <div className="mt-4">
                <button
                  onClick={() => navigateTo('business-register')}
                  className="text-xs text-neutral-500 hover:text-emerald-700 font-medium underline inline-flex items-center gap-1"
                >
                  <span>Are you a Kenyan shop owner? Register your store</span>
                </button>
              </div>
            )}

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct M-Pesa STK Push</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Distance-Based Delivery or Free Pickup</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Business Owners</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Store Preview Showcase */}
          <div className="mt-12 max-w-4xl mx-auto rounded-2xl border border-neutral-200 bg-neutral-900 p-2 sm:p-4 shadow-xl">
            <div className="rounded-xl bg-neutral-800 overflow-hidden border border-neutral-700">
              {/* Browser chrome bar */}
              <div className="bg-neutral-900 px-4 py-2.5 flex items-center justify-between border-b border-neutral-700 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="px-3 py-1 bg-neutral-800 rounded-md text-[11px] font-mono text-neutral-300">
                  shoplink.co.ke/shop/john-shoes
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Verified Store
                </div>
              </div>

              {/* Store Preview */}
              <div className="bg-white p-6 text-left">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=120&auto=format&fit=crop&q=80"
                      alt="John's Shoes"
                      className="w-14 h-14 rounded-xl object-cover border border-neutral-200 shadow-xs"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900">John&apos;s Shoes Nairobi</h3>
                      <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        Imenti House, Nairobi CBD • Island & Doorstep Courier
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigateTo('shop', 'john-shoes')}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Browse Catalog
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                    <p className="text-neutral-500 font-medium">Urban High-Tops</p>
                    <p className="text-base font-bold text-neutral-900 mt-0.5">KSh 2,999</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      In Stock • Instant Checkout
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                    <p className="text-neutral-500 font-medium">Delivery Calculation</p>
                    <p className="text-base font-bold text-neutral-900 mt-0.5">Distance-Based</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Courier or Free Shop Pickup
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                    <p className="text-neutral-500 font-medium">Payment Settlement</p>
                    <p className="text-base font-bold text-emerald-700 mt-0.5">M-Pesa Direct</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Credited to Business Owner
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What ShopLink Entitles: Core Platform Pillars */}
      <section className="py-16 sm:py-20 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              What ShopLink Entitles
            </h2>
            <h3 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              A Direct Bridge Between Kenyan Buyers & Local Sellers
            </h3>
            <p className="mt-3 text-neutral-600 text-sm sm:text-base">
              Clear transactions, transparent delivery rates, and genuine verified Kenyan businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-neutral-900">Verified Stores</h4>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                Browse legitimate shops with authentic inventories, physical Kenyan locations, and verified owner credentials.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-neutral-900">Direct Owner Payment</h4>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                Funds are paid via Hashback directly into the business owner&apos;s verified account, eliminating middleman complaints.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-neutral-900">Distance Delivery</h4>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                Delivery fees are calculated fairly based on rider distance to your estate, or select free pickup from the physical shop.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-neutral-900">Live Order Tracking</h4>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                Track your order through pending, paid, packed, and dispatched stages without needing complex accounts or app downloads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Kenyan Stores */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              Kenyan Storefronts
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              Explore Popular Shops
            </h3>
          </div>
          <button
            onClick={() => navigateTo('marketplace')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All Stores</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map(biz => (
            <div
              key={biz.id}
              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div>
                <div className="h-32 bg-neutral-100 relative overflow-hidden">
                  <img
                    src={biz.banner_url || biz.logo_url}
                    alt={biz.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-800 shadow-xs">
                    {biz.category}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={biz.logo_url}
                      alt={biz.name}
                      className="w-12 h-12 rounded-xl object-cover border border-neutral-200"
                    />
                    <div>
                      <h4 className="font-bold text-neutral-900 text-base group-hover:text-emerald-700 transition-colors">
                        {biz.name}
                      </h4>
                      <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        {biz.location}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {biz.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-neutral-500">
                  /shop/{biz.slug}
                </span>
                <button
                  onClick={() => navigateTo('shop', biz.slug)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                >
                  <span>Visit Store</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How Shopping Works: 4 Simple Steps */}
      <section className="py-16 sm:py-20 bg-white border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              Simple & Transparent
            </h2>
            <h3 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              How Ordering Works on ShopLink
            </h3>
            <p className="mt-3 text-neutral-600 text-sm">
              Four quick steps from product selection to your doorstep.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Browse Stores & Cart',
                desc: 'Find items from authentic Kenyan sellers and add your preferred sizes or colors to cart.',
              },
              {
                step: '2',
                title: 'Choose Delivery or Pickup',
                desc: 'Select doorstep rider delivery to your estate or free in-store collection at the seller\'s shop.',
              },
              {
                step: '3',
                title: 'Instant M-Pesa PIN',
                desc: 'Confirm payment directly on your phone screen via Hashback STK push. No manual typing errors.',
              },
              {
                step: '4',
                title: 'Direct Credit & Dispatch',
                desc: 'The seller is credited immediately, prepares your order, and dispatches via rider with real-time updates.',
              },
            ].map(item => (
              <div
                key={item.step}
                className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 shadow-xs relative"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                  {item.step}
                </div>
                <h4 className="text-base font-bold text-neutral-900">{item.title}</h4>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
            Clear Answers
          </h2>
          <h3 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full text-left px-5 py-4 flex items-center justify-between text-sm font-bold text-neutral-900 hover:bg-neutral-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-5 pb-4 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Live WhatsApp Assistance Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-neutral-900 to-neutral-950 text-white border border-emerald-800/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <Headphones className="w-3.5 h-3.5" />
              <span>Official Kenyan Support Desk • Active Now</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Have Questions? Chat Directly on WhatsApp
            </h3>
            <p className="text-neutral-300 text-xs sm:text-sm max-w-xl">
              Need assistance with an order, courier delivery distance, or checking store details? Our support desk is available on WhatsApp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href={buildWhatsAppUrl('Hello ShopLink Support, I have a question about shopping and orders.')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all group"
            >
              <MessageCircle className="w-4 h-4 fill-neutral-950/20 stroke-[2.5]" />
              <span>Chat on WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Clean Shopper-Centric Call to Action */}
      <section className="bg-emerald-700 text-white py-14 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start Exploring Kenyan Stores
          </h2>
          <p className="mt-3 text-emerald-100 text-sm sm:text-base max-w-xl mx-auto">
            Support Kenyan businesses and shop with confidence using instant M-Pesa payments and direct seller fulfillment.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => navigateTo('marketplace')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-emerald-800 font-extrabold text-sm hover:bg-emerald-50 transition-all shadow-md"
            >
              Browse Public Stores
            </button>
            <button
              onClick={() => navigateTo('shop', 'john-shoes')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-800 text-white font-bold text-sm hover:bg-emerald-900 transition-colors border border-emerald-600"
            >
              Visit John&apos;s Shoes
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
