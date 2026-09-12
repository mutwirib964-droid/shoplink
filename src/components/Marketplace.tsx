import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Store,
  MapPin,
  Truck,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const Marketplace: React.FC = () => {
  const { businesses, products, navigateTo } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  const categories = useMemo(() => {
    const set = new Set<string>();
    businesses.forEach(b => set.add(b.category));
    return ['All', ...Array.from(set)];
  }, [businesses]);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const matchesSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.description.toLowerCase().includes(search.toLowerCase()) ||
        b.location.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
      const matchesCity =
        selectedCity === 'All' || b.location.toLowerCase().includes(selectedCity.toLowerCase());
      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [businesses, search, selectedCategory, selectedCity]);

  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
            Kenya Merchant Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mt-3">
            Explore Verified Kenyan Online Shops
          </h1>
          <p className="text-sm text-neutral-600 mt-2">
            Buy directly from genuine Kenyan businesses. Instant M-Pesa STK payment via Hashback and doorstep delivery.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search shops, products, or locations in Kenya..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white font-medium text-neutral-700"
              >
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white font-medium text-neutral-700"
              >
                <option value="All">All Regions</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Kisumu">Kisumu</option>
                <option value="Nakuru">Nakuru</option>
                <option value="Eldoret">Eldoret</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shops Grid */}
        {filteredBusinesses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <Store className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-900">No shops found</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Try adjusting your search criteria or city filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map(biz => {
              const bizProductCount = products.filter(p => p.business_id === biz.id).length;

              return (
                <div
                  key={biz.id}
                  onClick={() => navigateTo('shop', biz.slug)}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
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
                  </div>

                  {/* Body */}
                  <div className="p-5 relative flex-1 flex flex-col justify-between">
                    <div>
                      {/* Logo avatar */}
                      <div className="-mt-12 mb-3">
                        <img
                          src={biz.logo_url}
                          alt={biz.name}
                          className="w-16 h-16 rounded-xl object-cover border-4 border-white shadow-sm bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-neutral-900 text-base group-hover:text-emerald-700 transition-colors">
                          {biz.name}
                        </h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>

                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                        {biz.description}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          {biz.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-emerald-600" />
                          Delivery KSh {biz.delivery_fee.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                      <span className="font-mono text-emerald-700 font-medium text-[11px]">
                        /shop/{biz.slug}
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
    </div>
  );
};
