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
  ShieldAlert,
  Zap,
  MessageCircle,
  Phone,
  Headphones,
} from 'lucide-react';
import { ASSISTANCE_CONFIG, buildWhatsAppUrl, buildTelUrl } from '../lib/assistanceConfig';

export const LandingPage: React.FC = () => {
  const { user, navigateTo, businesses, plans } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I get help or speak with a live support agent?',
      a: 'Our official ShopLink Kenya support desk is available directly on WhatsApp. You can click any "Chat on WhatsApp" button or open the floating support widget at the bottom right corner of the screen to start chatting with our team on WhatsApp immediately anytime!',
    },
    {
      q: 'How does M-Pesa payment work through Hashback?',
      a: 'When a customer checks out, an instant STK Push prompt appears on their phone requesting their M-Pesa PIN. Once entered, Hashback securely processes the transaction and alerts your shop backend via a webhook. The order is automatically marked as PAID, product stock is decremented, and both you and the customer receive real-time confirmation.',
    },
    {
      q: 'How fast can I set up my Kenyan online shop?',
      a: 'Less than 2 minutes! Enter your business name, location, and phone number. We automatically generate your custom URL (e.g., shoplink.co.ke/shop/johns-shoes). You can start adding products and sharing your link immediately on WhatsApp.',
    },
    {
      q: 'Do customers need to download an app to buy from me?',
      a: 'No! Customers simply open your shop link in any mobile browser (Safari, Chrome, WhatsApp in-app browser), browse products, add items to their cart, and pay via M-Pesa with zero friction.',
    },
    {
      q: 'How do subscriptions work?',
      a: 'You can start for FREE with up to 10 products. When your sales scale, upgrade to the BUSINESS plan for only KSh 999/month (up to 100 products and full analytics) or the PRO plan for KSh 1,999/month (unlimited products and priority marketing). Subscriptions are charged conveniently via M-Pesa.',
    },
    {
      q: 'How does WhatsApp integration work?',
      a: 'You get one-click buttons to share your shop link or specific products directly to WhatsApp chats and Status. Customers also have a dedicated "Contact on WhatsApp" button on your storefront so they can chat with you directly regarding custom orders or delivery directions.',
    },
    {
      q: 'How do I handle deliveries in Nairobi and across Kenya?',
      a: 'You can configure your standard delivery fee in your Shop Settings (e.g. KSh 200 within Nairobi). Customers enter their delivery town, estate, and doorstep instructions during checkout.',
    },
  ];

  return (
    <div className="bg-neutral-50 min-h-screen text-neutral-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Built for Kenyan WhatsApp & Instagram Sellers</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-tight sm:leading-none">
              Turn Your WhatsApp Business Into an{' '}
              <span className="text-emerald-600 underline decoration-emerald-200 decoration-wavy">
                Online Shop
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-neutral-600 font-normal leading-relaxed">
              Create your online store, showcase your products, receive orders and
              accept M-Pesa payments — all in one place.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={() => navigateTo('business-register')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <span>Create Your Shop</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateTo('shop', 'john-shoes')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-neutral-100 text-neutral-800 font-bold text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 border border-neutral-200"
              >
                <span>View Demo Store</span>
                <ExternalLink className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Micro badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Instant M-Pesa STK Push</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>No Coding Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Setup Fees</span>
              </div>
            </div>
          </div>

          {/* Interactive Preview Card (Mocking the Storefront Header on Mobile) */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-neutral-200 bg-neutral-900 p-2 sm:p-4 shadow-xl">
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
                  Live Store
                </div>
              </div>

              {/* Sample Store Preview inside mockup */}
              <div className="bg-white p-6 text-left">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=120&auto=format&fit=crop&q=80"
                      alt="John's Shoes"
                      className="w-14 h-14 rounded-xl object-cover border border-neutral-200 shadow-xs"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900">John&apos;s Shoes</h3>
                      <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        Nairobi CBD, Imenti House • Delivery across Kenya
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateTo('shop', 'john-shoes')}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Browse Store Catalog
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                    <p className="text-xs text-neutral-500 font-medium">Urban High-Tops</p>
                    <p className="text-base font-bold text-neutral-900 mt-1">KSh 2,999</p>
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      14 In Stock
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                    <p className="text-xs text-neutral-500 font-medium">Chelsea Leather Boots</p>
                    <p className="text-base font-bold text-neutral-900 mt-1">KSh 4,950</p>
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      6 In Stock
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                    <p className="text-xs text-neutral-500 font-medium">Payment Gateway</p>
                    <p className="text-base font-bold text-emerald-700 mt-1">Hashback M-Pesa</p>
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Instant STK Push
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section (6 Steps) */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
            Seamless Onboarding
          </h2>
          <h3 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            How ShopLink Kenya Works
          </h3>
          <p className="mt-3 text-neutral-600 text-sm sm:text-base">
            From setup to your first M-Pesa payment in 6 straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              title: 'Create Your Account',
              desc: 'Sign up with your name, phone number, and email. Instant setup without bureaucratic hurdles.',
            },
            {
              step: '2',
              title: 'Create Your Shop',
              desc: 'Choose your shop name, description, location, and get a unique link (e.g. /shop/johns-shoes).',
            },
            {
              step: '3',
              title: 'Add Your Products',
              desc: 'Upload product photos, set prices in KSh, write descriptions, and enter your starting stock.',
            },
            {
              step: '4',
              title: 'Share Your Shop Link',
              desc: 'Paste your shop link on WhatsApp Status, Instagram Bio, TikTok, and Facebook groups.',
            },
            {
              step: '5',
              title: 'Receive Orders',
              desc: 'Customers browse, choose quantities, provide delivery address, and place orders smoothly.',
            },
            {
              step: '6',
              title: 'Get Paid Through M-Pesa',
              desc: 'Hashback triggers an instant STK prompt. Once PIN is entered, payment is logged and confirmed.',
            },
          ].map(item => (
            <div
              key={item.step}
              className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs hover:border-emerald-300 transition-all relative"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold text-base flex items-center justify-center mb-4 shadow-sm shadow-emerald-600/20">
                {item.step}
              </div>
              <h4 className="text-lg font-bold text-neutral-900">{item.title}</h4>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-white border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              Everything You Need
            </h2>
            <h3 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              Built for Modern Kenyan Commerce
            </h3>
            <p className="mt-3 text-neutral-600 text-sm sm:text-base">
              Say goodbye to losing customers in endless WhatsApp back-and-forth messages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Store className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900">Online Storefront</h4>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                A dedicated, high-speed mobile catalog for your brand. Customers can browse, search by category, and view real-time stock.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900">M-Pesa Payments via Hashback</h4>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Seamless STK push requests. Secure webhook verification ensures you only dispatch orders after verified M-Pesa settlement.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900">Product & Stock Management</h4>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Easily set regular and sale prices in KSh. Inventory automatically decrements when paid to prevent overselling.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900">Customer CRM & History</h4>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Build your buyer database. View repeat customers, total spent, order frequencies, and reach out directly on WhatsApp.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900">Live Sales Analytics</h4>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Track today&apos;s sales, this month&apos;s revenue, best-selling items, and conversion patterns in clean graphical dashboards.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900">WhatsApp & Social Sharing</h4>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Generate pre-formatted WhatsApp status promotions and product links to turn viewers into immediate buyers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Kenyan Shops Showcase */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              Live Showcase
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              Shops Thriving on ShopLink Kenya
            </h3>
          </div>
          <button
            onClick={() => navigateTo('marketplace')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Explore All Kenyan Stores</span>
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

      {/* Pricing Section */}
      <section className="py-16 sm:py-24 bg-white border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              Transparent Pricing
            </h2>
            <h3 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              Affordable Plans to Scale Your Business
            </h3>
            <p className="mt-3 text-neutral-600 text-sm sm:text-base">
              Start for free, upgrade when you need higher catalog limits and advanced CRM.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`rounded-2xl p-8 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-neutral-900 text-white border-2 border-emerald-500 shadow-xl relative'
                    : 'bg-neutral-50 border border-neutral-200 text-neutral-900'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-neutral-900 text-[11px] font-extrabold uppercase tracking-wider rounded-full shadow-xs">
                    Most Popular in Kenya
                  </div>
                )}

                <div>
                  <h4 className="text-xl font-bold">{plan.name}</h4>
                  <p
                    className={`text-xs mt-1 ${
                      plan.popular ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold">
                      KSh {plan.price.toLocaleString()}
                    </span>
                    <span
                      className={`text-xs ${
                        plan.popular ? 'text-neutral-400' : 'text-neutral-500'
                      }`}
                    >
                      /month
                    </span>
                  </div>

                  <div className="my-6 border-t border-neutral-200/20" />

                  <ul className="space-y-3 text-xs">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            plan.popular ? 'text-emerald-400' : 'text-emerald-600'
                          }`}
                        />
                        <span className={plan.popular ? 'text-neutral-200' : 'text-neutral-700'}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => {
                      if (user?.role === 'business_owner') {
                        navigateTo('dashboard');
                      } else {
                        navigateTo('business-register');
                      }
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-colors ${
                      plan.popular
                        ? 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
                        : 'bg-neutral-900 text-white hover:bg-neutral-800'
                    }`}
                  >
                    {user?.role === 'business_owner'
                      ? `Switch / Upgrade to ${plan.name}`
                      : plan.price === 0
                      ? 'Start Free'
                      : `Choose ${plan.name}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
            Got Questions?
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

        {/* Live WhatsApp & AI Assistance Banner */}
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
              Need help creating your online store, getting your direct shop link, configuring Hashback M-Pesa STK push, or tracking an order? Our support team is ready on WhatsApp.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Dedicated Live Support Desk via WhatsApp</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href={buildWhatsAppUrl('Hello ShopLink Agent, I want to inquire about setting up my store.')}
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

      {/* Strong Final CTA */}
      <section className="bg-emerald-700 text-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start Selling Online Today
          </h2>
          <p className="mt-4 text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto">
            Join Kenyan entrepreneurs turning casual WhatsApp chat inquiries into paid, tracked M-Pesa orders.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigateTo('business-register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-emerald-800 font-extrabold text-sm hover:bg-emerald-50 transition-all shadow-lg"
            >
              Create Your Shop Now
            </button>
            <button
              onClick={() => navigateTo('shop', 'john-shoes')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-800 text-white font-bold text-sm hover:bg-emerald-900 transition-colors border border-emerald-600"
            >
              Explore John&apos;s Shoes Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
