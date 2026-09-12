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
} from 'lucide-react';

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
  const { createBusiness, register, navigateTo, businesses } = useApp();

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Nairobi CBD');
  const [category, setCategory] = useState('Clothing & Fashion');
  const [logoUrl, setLogoUrl] = useState(PRESET_LOGOS[0].url);
  const [deliveryFee, setDeliveryFee] = useState<number>(200);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive slug dynamically
  const generatedSlug = businessName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const isSlugTaken = businesses.some(b => b.slug === generatedSlug);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessName.trim() || !ownerName.trim() || !phone.trim() || !email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create or register user profile
      const newUser = await register(ownerName, email, phone, 'business_owner');

      // 2. Create business
      const newBiz = await createBusiness({
        owner_id: newUser.id,
        name: businessName,
        slug: generatedSlug || `shop-${Date.now()}`,
        description: description || `${businessName} provides quality products in Kenya.`,
        phone,
        email,
        location,
        category,
        logo_url: logoUrl || PRESET_LOGOS[0].url,
        is_featured: false,
        subscription_plan_id: 'plan_free',
        delivery_fee: deliveryFee,
      });

      // 3. Navigate to owner dashboard
      navigateTo('dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register shop.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Launch in 2 Minutes</span>
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Create Your Online Shop
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Start receiving customer orders and M-Pesa payments through Hashback today.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Business Identity */}
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>1. Business Details</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Business / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="e.g. John's Shoes or Nairobi Thrift Shop"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                {/* Slug display with uniqueness indicator */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Public Shop Link (Auto-Generated Unique URL)
                  </label>
                  <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 font-mono">
                    <span className="text-neutral-400 select-none">{typeof window !== 'undefined' ? window.location.origin : 'https://shoplink.co.ke'}/?shop=</span>
                    <span className="font-bold text-emerald-700">
                      {generatedSlug || 'your-shop-name'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Customers who click this link directly land in your shop, add items to cart, and pay via M-Pesa.
                  </p>
                  {isSlugTaken && (
                    <p className="text-[11px] text-amber-600 mt-1 font-medium">
                      Note: This exact handle exists. A unique suffix will be added automatically upon creation.
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
                      Physical Location / Hub *
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g. Nairobi CBD, Imenti House"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Short Business Bio
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. Quality imported and locally made footwear delivered across Kenya."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Standard Delivery Fee (KSh)
                  </label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={e => setDeliveryFee(Number(e.target.value))}
                    className="w-full sm:w-48 px-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Logo Selection */}
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3 pb-2 border-b border-neutral-100 flex items-center gap-2">
                <Image className="w-4 h-4 text-emerald-600" />
                <span>2. Shop Logo</span>
              </h3>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-neutral-600">
                  Select a category preset logo or enter an image URL:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {PRESET_LOGOS.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setLogoUrl(preset.url)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        logoUrl === preset.url
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-12 h-12 rounded-lg object-cover mx-auto mb-1 border border-neutral-200"
                      />
                      <span className="text-[10px] font-medium text-neutral-700 block truncate">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-2">
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="Or paste custom image URL (https://...)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Owner Account & M-Pesa Contact */}
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>3. Owner & Contact Information</span>
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
                    placeholder="e.g. John Kamau"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    WhatsApp & M-Pesa Phone *
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
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. john@shoeske.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-neutral-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Launching Your Store...</span>
                ) : (
                  <>
                    <span>Launch Online Store (FREE Plan)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-neutral-500 mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                No credit card needed. Start for free with up to 10 products.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
