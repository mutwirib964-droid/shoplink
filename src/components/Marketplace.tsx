import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Store,
  MapPin,
  Truck,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Plus,
  Package,
  CreditCard,
  Building2,
  X,
  Compass,
} from 'lucide-react';
import { Product, Business } from '../types';
import { KENYA_COUNTIES } from '../data/counties';

export const Marketplace: React.FC = () => {
  const { businesses, products, navigateTo, addToCart, setIsCartOpen, showToast } = useApp();

  const [viewMode, setViewMode] = useState<'products' | 'shops'>('products');
  const [search, setSearch] = useState('');
  const [exactLocationSearch, setExactLocationSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCounty, setSelectedCounty] = useState('All');

  const categories = useMemo(() => {
    const set = new Set<string>();
    businesses.forEach(b => set.add(b.category));
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [businesses, products]);

  // Filter businesses by search, exact location, category, and all 47 counties
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const bLocation = (b.location || '').toLowerCase();
      const bExact = (b.exact_location || '').toLowerCase();
      const bCounty = (b.county || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const bDesc = (b.description || '').toLowerCase();

      // General Search Query (name, description, or location)
      const matchesSearch =
        !search ||
        bName.includes(search.toLowerCase()) ||
        bDesc.includes(search.toLowerCase()) ||
        bLocation.includes(search.toLowerCase()) ||
        bExact.includes(search.toLowerCase());

      // Exact Location Search Query (e.g. "Imenti House", "Westlands", "Diani", "Kenyatta Ave")
      const matchesExactLocation =
        !exactLocationSearch ||
        bExact.includes(exactLocationSearch.toLowerCase()) ||
        bLocation.includes(exactLocationSearch.toLowerCase()) ||
        bCounty.includes(exactLocationSearch.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;

      // 47 County Filter
      const matchesCounty =
        selectedCounty === 'All' ||
        bCounty === selectedCounty.toLowerCase() ||
        bLocation.includes(selectedCounty.toLowerCase());

      return matchesSearch && matchesExactLocation && matchesCategory && matchesCounty;
    });
  }, [businesses, search, exactLocationSearch, selectedCategory, selectedCounty]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.is_active) return false;
      const biz = businesses.find(b => b.id === p.business_id);
      if (!biz) return false;

      const pName = (p.name || '').toLowerCase();
      const pDesc = (p.description || '').toLowerCase();
      const bLocation = (biz.location || '').toLowerCase();
      const bExact = (biz.exact_location || '').toLowerCase();
      const bCounty = (biz.county || '').toLowerCase();
      const bName = (biz.name || '').toLowerCase();

      // General Search
      const matchesSearch =
        !search ||
        pName.includes(search.toLowerCase()) ||
        pDesc.includes(search.toLowerCase()) ||
        bName.includes(search.toLowerCase()) ||
        bLocation.includes(search.toLowerCase());

      // Exact Location Search
      const matchesExactLocation =
        !exactLocationSearch ||
        bExact.includes(exactLocationSearch.toLowerCase()) ||
        bLocation.includes(exactLocationSearch.toLowerCase()) ||
        bCounty.includes(exactLocationSearch.toLowerCase());

      // Category
      const matchesCategory =
        selectedCategory === 'All' ||
        p.category === selectedCategory ||
        biz.category === selectedCategory;

      // 47 County
      const matchesCounty =
        selectedCounty === 'All' ||
        bCounty === selectedCounty.toLowerCase() ||
        bLocation.includes(selectedCounty.toLowerCase());

      return matchesSearch && matchesExactLocation && matchesCategory && matchesCounty;
    });
  }, [products, businesses, search, exactLocationSearch, selectedCategory, selectedCounty]);

  // Helper to render accepted payment method badges
  const renderPaymentBadges = (biz: Business) => {
    const settlement = biz.settlement;
    const methods = settlement?.enabled_methods || (settlement?.settlement_type ? [settlement.settlement_type] : []);

    return (
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        {(methods.includes('till') || settlement?.till_number) && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <span>Till No</span>
            {settlement?.till_number && <span className="font-mono text-emerald-950 font-black">{settlement.till_number}</span>}
          </span>
        )}
        {(methods.includes('paybill') || settlement?.paybill_number) && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
            <span>Paybill</span>
            {settlement?.paybill_number && <span className="font-mono text-blue-950 font-black">{settlement.paybill_number}</span>}
          </span>
        )}
        {(methods.includes('pochi') || settlement?.pochi_phone) && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <span>Pochi la Biashara</span>
          </span>
        )}
      </div>
    );
  };

  const clearAllFilters = () => {
    setSearch('');
    setExactLocationSearch('');
    setSelectedCategory('All');
    setSelectedCounty('All');
  };

  const hasActiveFilters = search || exactLocationSearch || selectedCategory !== 'All' || selectedCounty !== 'All';

  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-200">
            Kenya National 47-County Marketplace
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mt-3">
            Shop From Stores Across All 47 Counties
          </h1>
          <p className="text-sm text-neutral-600 mt-2 max-w-xl mx-auto">
            Find items by exact building, street, or county. Support Kenyan sellers with direct Till, Paybill, or Pochi la Biashara payments.
          </p>

          {/* View Mode Toggle: All Products vs Stores */}
          <div className="mt-5 inline-flex p-1 bg-neutral-200/70 rounded-2xl text-xs font-bold shadow-inner">
            <button
              onClick={() => setViewMode('products')}
              className={`px-5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                viewMode === 'products'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              <span>All Products ({filteredProducts.length})</span>
            </button>
            <button
              onClick={() => setViewMode('shops')}
              className={`px-5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                viewMode === 'shops'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Stores ({filteredBusinesses.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Controls: Search, Exact Location Search, 47 Counties, Categories */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* 1. General Keyword Search */}
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products, shoes, electronics..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            {/* 2. Exact Location Search Input */}
            <div className="md:col-span-4 relative">
              <Compass className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={exactLocationSearch}
                onChange={e => setExactLocationSearch(e.target.value)}
                placeholder="Search exact location (e.g. Imenti, Westlands, Nyali, Diani)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            {/* 3. 47 Counties Dropdown */}
            <div className="md:col-span-2">
              <select
                value={selectedCounty}
                onChange={e => setSelectedCounty(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-neutral-200 bg-white font-semibold text-neutral-800 focus:outline-hidden focus:border-emerald-600"
              >
                <option value="All">All 47 Counties</option>
                {KENYA_COUNTIES.map(c => (
                  <option key={c.code} value={c.name}>
                    {c.code} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Category Dropdown */}
            <div className="md:col-span-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-neutral-200 bg-white font-medium text-neutral-700 focus:outline-hidden focus:border-emerald-600"
              >
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick County Chips & Clear Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-xs">
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-[11px] font-bold text-neutral-400 mr-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                Counties:
              </span>
              {['All', 'Nairobi', 'Mombasa', 'Kiambu', 'Nakuru', 'Uasin Gishu', 'Kisumu', 'Machakos'].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => setSelectedCounty(cnt)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    selectedCounty === cnt
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cnt === 'All' ? 'All (47)' : cnt}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-[11px] font-semibold transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================= */}
        {/* VIEW 1: ALL PRODUCTS GRID (Visible to everyone) */}
        {/* ============================================================= */}
        {viewMode === 'products' && (
          <div>
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
                <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-900">No products found in this area</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {exactLocationSearch
                    ? `No products currently listed near "${exactLocationSearch}". Try searching a broader county or keyword.`
                    : 'Try selecting a different county or clearing the search query.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredProducts.map(product => {
                  const shop = businesses.find(b => b.id === product.business_id);

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden bg-neutral-100">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {product.sale_price && (
                            <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                              Sale
                            </span>
                          )}
                          {shop && (
                            <button
                              onClick={() => navigateTo('shop', shop.slug)}
                              className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-xs py-1.5 px-2.5 rounded-xl text-[10px] font-bold text-neutral-800 flex items-center justify-between border border-white/60 hover:bg-white shadow-xs transition-colors"
                            >
                              <span className="truncate">{shop.name}</span>
                              <span className="text-emerald-700 text-[10px] shrink-0 font-extrabold flex items-center gap-0.5">
                                Visit Shop &rarr;
                              </span>
                            </button>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-neutral-500">
                            <span className="font-medium text-emerald-700">{product.category}</span>
                            {shop && (
                              <span className="font-medium bg-neutral-100 px-2 py-0.5 rounded-md truncate max-w-[120px]" title={shop.location}>
                                📍 {shop.county || 'Kenya'}
                              </span>
                            )}
                          </div>

                          <h3 className="font-extrabold text-neutral-900 text-sm line-clamp-1 group-hover:text-emerald-700 transition-colors">
                            {product.name}
                          </h3>

                          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>

                          {/* Exact Location Tag */}
                          {shop?.exact_location && (
                            <div className="text-[11px] text-neutral-500 flex items-center gap-1 truncate" title={shop.exact_location}>
                              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{shop.exact_location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pricing & Add to Cart Action */}
                      <div className="p-4 pt-0 border-t border-neutral-100 mt-2">
                        <div className="flex items-baseline gap-2 pt-3">
                          <span className="text-base font-extrabold text-neutral-900">
                            KSh {(product.sale_price || product.price).toLocaleString()}
                          </span>
                          {product.sale_price && (
                            <span className="text-xs text-neutral-400 line-through">
                              KSh {product.price.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => {
                              addToCart(product);
                              showToast(`Added ${product.name} to cart!`);
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>

                          {shop && (
                            <button
                              onClick={() => {
                                addToCart(product);
                                setIsCartOpen(true);
                              }}
                              className="px-3 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold"
                              title="Buy Now"
                            >
                              Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* VIEW 2: VERIFIED STORES DIRECTORY */}
        {/* ============================================================= */}
        {viewMode === 'shops' && (
          <div>
            {filteredBusinesses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
                <Store className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-900">No stores found in this area</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {exactLocationSearch
                    ? `No stores matched exact location "${exactLocationSearch}". Try searching another Kenyan town or county.`
                    : 'Try selecting a different county or resetting your filters.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBusinesses.map(biz => {
                  const bizProductCount = products.filter(p => p.business_id === biz.id).length;

                  return (
                    <div
                      key={biz.id}
                      onClick={() => navigateTo('shop', biz.slug)}
                      className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      {/* Banner */}
                      <div className="h-32 bg-neutral-800 relative overflow-hidden">
                        {biz.banner_url ? (
                          <img
                            src={biz.banner_url}
                            alt={biz.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-emerald-800 to-neutral-900" />
                        )}
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3 text-emerald-400" />
                          <span>{bizProductCount} products</span>
                        </div>
                        {biz.county && (
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-xs text-emerald-200 text-[10px] font-bold flex items-center gap-1 border border-emerald-400/30">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            <span>{biz.county} County</span>
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-5 relative flex-1 flex flex-col justify-between">
                        <div>
                          {/* Logo avatar */}
                          <div className="-mt-12 mb-3">
                            <img
                              src={biz.logo_url}
                              alt={biz.name}
                              className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-sm bg-white"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-neutral-900 text-base group-hover:text-emerald-700 transition-colors">
                              {biz.name}
                            </h3>
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          </div>

                          <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                            {biz.description}
                          </p>

                          {/* Location & Exact Address */}
                          <div className="mt-3 space-y-1 text-xs text-neutral-600">
                            <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{biz.exact_location || biz.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                              <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Doorstep delivery available from KSh {biz.delivery_fee.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Payment Methods Accepted */}
                          <div className="mt-3 pt-3 border-t border-neutral-100">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                              Accepted M-Pesa Options:
                            </span>
                            {renderPaymentBadges(biz)}
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                          <span className="font-mono text-emerald-700 font-medium text-[11px]">
                            /?shop={biz.slug}
                          </span>
                          <span className="font-bold text-emerald-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            <span>Visit Store</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
