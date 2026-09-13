import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  Smartphone,
  Mail,
  User,
  Image,
  CreditCard,
  Building2,
  Calendar,
  Check,
} from 'lucide-react';
import { KENYA_COUNTIES, KenyaCounty } from '../data/counties';
import { PaymentMethodChoice } from '../types';

const CATEGORIES = [
  'Shoes & Footwear',
  'Clothing & Fashion',
  'Electronics & Phones',
  'Beauty & Skincare',
  'Groceries & Fresh Food',
  'Home & Kitchen',
  'Jewelry & Watches',
  'Health & Wellness',
  'General Merchandise',
];

const PRESET_LOGOS = [
  { label: 'Shoes / Leather', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&auto=format&fit=crop&q=80' },
  { label: 'Fashion / Boutique', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=80' },
  { label: 'Fresh Organics', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&auto=format&fit=crop&q=80' },
  { label: 'Electronics', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80' },
  { label: 'Cosmetics', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80' },
];

export const BusinessRegister: React.FC = () => {
  const { createBusiness, register, navigateTo, businesses, user, myBusiness } = useApp();

  // Basic Business Details
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [description, setDescription] = useState('');
  
  // All 47 Counties & Exact Location
  const [selectedCounty, setSelectedCounty] = useState<string>('Nairobi');
  const [exactLocation, setExactLocation] = useState('Imenti House, 2nd Floor Shop 14, Tom Mboya St');
  const [category, setCategory] = useState('Clothing & Fashion');
  const [logoUrl, setLogoUrl] = useState(PRESET_LOGOS[0].url);
  const [deliveryFee, setDeliveryFee] = useState<number>(200);

  // Payment Methods (Can select Till, Paybill, Pochi, or ALL 3)
  const [enableTill, setEnableTill] = useState<boolean>(true);
  const [tillNumber, setTillNumber] = useState('5928341');
  const [tillStoreName, setTillStoreName] = useState('');

  const [enablePaybill, setEnablePaybill] = useState<boolean>(false);
  const [paybillNumber, setPaybillNumber] = useState('');
  const [paybillAccount, setPaybillAccount] = useState('');

  const [enablePochi, setEnablePochi] = useState<boolean>(false);
  const [pochiPhone, setPochiPhone] = useState(user?.phone || '');
  const [pochiOwnerName, setPochiOwnerName] = useState(user?.full_name || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find county metadata
  const currentCountyObj = KENYA_COUNTIES.find(c => c.name === selectedCounty);

  // If user already owns a business, offer direct navigation to their dashboard
  if (user?.role === 'business_owner' && myBusiness) {
    return (
      <div className="min-h-screen bg-neutral-50 py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-neutral-900">
            You Already Have an Active Store
          </h2>
          <p className="text-xs text-neutral-600 mt-2">
            Your store <strong className="text-neutral-900 font-bold">{myBusiness.name}</strong> is currently online and live on the ShopLink marketplace.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => navigateTo('dashboard')}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>Go to Shop Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateTo('shop', myBusiness.slug)}
              className="w-full py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-xs"
            >
              View Public Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Derive slug dynamically
  const generatedSlug = businessName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const isSlugTaken = businesses.some(b => b.slug === generatedSlug);

  const selectAllPaymentMethods = () => {
    setEnableTill(true);
    setEnablePaybill(true);
    setEnablePochi(true);
    if (!tillNumber) setTillNumber('5928341');
    if (!paybillNumber) setPaybillNumber('400200');
    if (!paybillAccount) setPaybillAccount(businessName ? businessName.toUpperCase().replace(/\s+/g, '') : 'STORE');
    if (!pochiPhone) setPochiPhone(phone || '0712345678');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessName.trim() || !ownerName.trim() || !phone.trim() || !email.trim()) {
      setError('Please fill in all required business and owner fields.');
      return;
    }

    if (!selectedCounty || !exactLocation.trim()) {
      setError('Please select a county and provide your exact shop address.');
      return;
    }

    // Payment method validation
    const enabledMethods: PaymentMethodChoice[] = [];
    if (enableTill) enabledMethods.push('till');
    if (enablePaybill) enabledMethods.push('paybill');
    if (enablePochi) enabledMethods.push('pochi');

    if (enabledMethods.length === 0) {
      setError('Please select at least one M-Pesa payment method (Till, Paybill, or Pochi la Biashara). You can also enable all three.');
      return;
    }

    if (enableTill && !tillNumber.trim()) {
      setError('Please enter your M-Pesa Till Number.');
      return;
    }

    if (enablePaybill && (!paybillNumber.trim() || !paybillAccount.trim())) {
      setError('Please enter both Paybill Number and Account Number.');
      return;
    }

    if (enablePochi && !pochiPhone.trim()) {
      setError('Please enter the registered Pochi la Biashara phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create or register user profile
      const newUser = await register(ownerName, email, phone, 'business_owner');

      // 2. Full combined location string
      const fullLocationString = `${exactLocation.trim()}, ${selectedCounty} County`;

      // 3. Construct settlement config
      const settlementConfig = {
        settlement_type: (enabledMethods.length > 1 ? 'multiple' : enabledMethods[0]) as any,
        enabled_methods: enabledMethods,
        till_number: enableTill ? tillNumber.trim() : undefined,
        store_name: tillStoreName.trim() || businessName.trim(),
        paybill_number: enablePaybill ? paybillNumber.trim() : undefined,
        paybill_account_number: enablePaybill ? paybillAccount.trim() : undefined,
        account_number_format: enablePaybill ? paybillAccount.trim() : undefined,
        pochi_phone: enablePochi ? pochiPhone.trim() : undefined,
        pochi_name: enablePochi ? (pochiOwnerName.trim() || ownerName.trim()) : undefined,
        mpesa_phone: pochiPhone.trim() || phone.trim(),
        auto_payout_enabled: true,
        verified: true,
      };

      // 4. Create business with 30-day trial automatically
      await createBusiness({
        owner_id: newUser.id,
        name: businessName,
        slug: generatedSlug || `shop-${Date.now()}`,
        description: description || `${businessName} provides quality products in ${selectedCounty} and across Kenya.`,
        phone,
        email,
        location: fullLocationString,
        county: selectedCounty,
        exact_location: exactLocation.trim(),
        category,
        logo_url: logoUrl || PRESET_LOGOS[0].url,
        is_featured: false,
        subscription_plan_id: 'plan_free',
        delivery_fee: deliveryFee,
        settlement: settlementConfig,
      });

      // 5. Navigate to owner dashboard
      navigateTo('dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register shop.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with 30-day Free Trial Guarantee */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-3 border border-emerald-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>1st Month Always Free (Day 1 to 30 Free Trial)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Create Your Online Kenyan Store
          </h1>
          <p className="mt-2 text-sm text-neutral-600 max-w-xl mx-auto">
            Sell in any of Kenya's 47 counties. Accept M-Pesa via Till, Paybill, or Pochi la Biashara. First 30 days are 100% free with zero card required.
          </p>

          {/* 30-Day Free Trial Visual Card */}
          <div className="mt-4 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 text-left flex items-start gap-3 max-w-xl mx-auto">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-xs">
              30d
            </div>
            <div className="text-xs">
              <p className="font-bold text-emerald-950">
                Full 30-Day Free Trial Starts on Registration Day
              </p>
              <p className="text-emerald-800 mt-0.5 leading-relaxed">
                Counted from Day 1 to Day 30 before your subscription activates. Enjoy unlimited product uploads, public storefront link, and direct M-Pesa customer checkouts completely free.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ========================================================= */}
            {/* Section 1: Business Identity & Category */}
            {/* ========================================================= */}
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>1. Store Identity & Category</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Store / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={e => {
                      setBusinessName(e.target.value);
                      if (!tillStoreName) setTillStoreName(e.target.value);
                    }}
                    placeholder="e.g. Kiprono Electronics or Mama Zawadi Boutique"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                {/* Auto URL Preview */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Public Web Link (Auto-Generated)
                  </label>
                  <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 font-mono">
                    <span className="text-neutral-400 select-none">
                      {typeof window !== 'undefined' ? window.location.origin : 'https://shoplink.co.ke'}/?shop=
                    </span>
                    <span className="font-bold text-emerald-700">
                      {generatedSlug || 'your-shop-name'}
                    </span>
                  </div>
                  {isSlugTaken && (
                    <p className="text-[11px] text-amber-600 mt-1 font-medium">
                      Note: An existing store uses this handle. A unique suffix will be added automatically.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Business Category *
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600 bg-white"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Estimated Base Delivery Fee (KSh)
                    </label>
                    <input
                      type="number"
                      value={deliveryFee}
                      onChange={e => setDeliveryFee(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      You can also insert exact custom fees per customer order based on distance.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Store Bio / Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. Authentic Kenyan apparel and accessories with same-day delivery."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* Section 2: All 47 Counties & Exact Physical Location */}
            {/* ========================================================= */}
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-100 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>2. County & Exact Physical Location</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  All 47 Counties Supported
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* County Selector */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    County in Kenya *
                  </label>
                  <select
                    value={selectedCounty}
                    onChange={e => setSelectedCounty(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600 bg-white font-medium text-neutral-800"
                  >
                    {KENYA_COUNTIES.map(c => (
                      <option key={c.code} value={c.name}>
                        {c.code} &bull; {c.name} County
                      </option>
                    ))}
                  </select>
                  {currentCountyObj && (
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Commercial hubs in {currentCountyObj.name}: {currentCountyObj.majorTowns.slice(0, 4).join(', ')}...
                    </p>
                  )}
                </div>

                {/* Exact Location */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Exact Shop Location (Town, Building, Street) *
                  </label>
                  <input
                    type="text"
                    required
                    value={exactLocation}
                    onChange={e => setExactLocation(e.target.value)}
                    placeholder="e.g. West End Mall 1st Flr, Kenyatta Ave or Nyali Centre"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Customers will be able to search and find your shop using this exact landmark.
                  </p>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* Section 3: Seller Payment Methods (Till, Paybill, Pochi, or ALL) */}
            {/* ========================================================= */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-neutral-100">
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>3. Accepted M-Pesa Payment Methods</span>
                </h3>
                <button
                  type="button"
                  onClick={selectAllPaymentMethods}
                  className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 transition-colors w-fit"
                >
                  &check; Accept All 3 Methods
                </button>
              </div>

              <p className="text-xs text-neutral-600 mb-4">
                Choose how customers pay you. You can select <strong>Buy Goods Till Number</strong>, <strong>Paybill with Account Number</strong>, <strong>Pochi la Biashara</strong>, or <strong>enable all three simultaneously</strong>!
              </p>

              <div className="space-y-3">
                {/* 1. BUY GOODS TILL */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    enableTill
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                      : 'border-neutral-200 bg-neutral-50/60 opacity-80'
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableTill}
                      onChange={e => setEnableTill(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900">
                          Option A: Safaricom Buy Goods Till Number
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Till No
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Customers pay directly through "Buy Goods and Services" without transaction fee.
                      </p>
                    </div>
                  </label>

                  {enableTill && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-emerald-200/60">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                          Till Number *
                        </label>
                        <input
                          type="text"
                          required={enableTill}
                          value={tillNumber}
                          onChange={e => setTillNumber(e.target.value)}
                          placeholder="e.g. 5928341"
                          className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-neutral-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                          Store Name Shown on Till
                        </label>
                        <input
                          type="text"
                          value={tillStoreName}
                          onChange={e => setTillStoreName(e.target.value)}
                          placeholder="e.g. John's Shoes CBD"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. PAYBILL (WITH ACCOUNT NUMBER) */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    enablePaybill
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                      : 'border-neutral-200 bg-neutral-50/60 opacity-80'
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enablePaybill}
                      onChange={e => setEnablePaybill(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900">
                          Option B: Safaricom Paybill (Paybill + Account Number)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          Paybill &amp; Acc
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Customers pay using your Paybill business number and custom account reference number.
                      </p>
                    </div>
                  </label>

                  {enablePaybill && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-emerald-200/60">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                          Paybill Number *
                        </label>
                        <input
                          type="text"
                          required={enablePaybill}
                          value={paybillNumber}
                          onChange={e => setPaybillNumber(e.target.value)}
                          placeholder="e.g. 400200 or 247247"
                          className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-neutral-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                          Account Number / Reference *
                        </label>
                        <input
                          type="text"
                          required={enablePaybill}
                          value={paybillAccount}
                          onChange={e => setPaybillAccount(e.target.value)}
                          placeholder="e.g. SHOESKE or Order Number"
                          className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-neutral-300 bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. POCHI LA BIASHARA */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    enablePochi
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                      : 'border-neutral-200 bg-neutral-50/60 opacity-80'
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enablePochi}
                      onChange={e => setEnablePochi(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900">
                          Option C: Pochi la Biashara (Direct Phone Number)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Pochi la Biashara
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Customers send funds directly to your Safaricom Pochi la Biashara business line.
                      </p>
                    </div>
                  </label>

                  {enablePochi && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-emerald-200/60">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                          Registered Pochi Phone Number *
                        </label>
                        <input
                          type="tel"
                          required={enablePochi}
                          value={pochiPhone}
                          onChange={e => setPochiPhone(e.target.value)}
                          placeholder="e.g. 0712345678"
                          className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-neutral-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                          Recipient / Business Name on Pochi
                        </label>
                        <input
                          type="text"
                          value={pochiOwnerName}
                          onChange={e => setPochiOwnerName(e.target.value)}
                          placeholder="e.g. John Mwangi Pochi"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* Section 4: Owner & Contact Information */}
            {/* ========================================================= */}
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>4. Shop Owner Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Owner Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder="e.g. Mary Wambui"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    WhatsApp &amp; Contact Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 0712345678"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address (For Invoices &amp; Orders) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. mary@wambuiwear.co.ke"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-neutral-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Creating Store &amp; Starting 30-Day Free Trial...</span>
                ) : (
                  <>
                    <span>Launch Store (30-Day Free Trial Active)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-4 text-[11px] text-neutral-500">
                <span className="flex items-center gap-1 font-medium text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  First month is always free (Day 1 to 30)
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Direct M-Pesa Till / Paybill / Pochi settlement
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  All 47 Kenyan Counties supported
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
