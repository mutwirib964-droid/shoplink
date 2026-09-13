import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Share2,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Check,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowLeft,
  Truck,
  ShieldCheck,
  ExternalLink,
  QrCode,
  Building2,
  Store,
  Smartphone,
  CreditCard,
} from 'lucide-react';
import { Product } from '../types';
import { ShopLinkModal } from './ShopLinkModal';

export const ShopView: React.FC = () => {
  const {
    currentShop,
    currentShopProducts,
    addToCart,
    cart,
    setIsCartOpen,
    navigateTo,
    getShopUrl,
    showToast,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isShopLinkModalOpen, setIsShopLinkModalOpen] = useState<boolean>(false);

  // Derive unique categories from products
  const productCategories = useMemo(() => {
    const cats = new Set<string>();
    currentShopProducts.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [currentShopProducts]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return currentShopProducts.filter(product => {
      if (!product.is_active) return false;
      const matchesCategory =
        selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [currentShopProducts, selectedCategory, searchQuery]);

  if (!currentShop) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-neutral-900">Store Not Found</h2>
        <p className="text-sm text-neutral-600 mt-2">
          The shop you are looking for does not exist or may have been updated.
        </p>
        <button
          onClick={() => navigateTo('marketplace')}
          className="mt-6 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
        >
          Browse All Stores
        </button>
      </div>
    );
  }

  const shopUrl = currentShop ? getShopUrl(currentShop.slug) : '';
  const whatsappShareText = encodeURIComponent(
    `Habari! Check out ${currentShop.name} on ShopLink Kenya: ${shopUrl}`
  );
  const whatsappContactText = encodeURIComponent(
    `Hello ${currentShop.name}, I am browsing your ShopLink catalog and would like to inquire about your products.`
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shopUrl);
    setCopiedLink(true);
    showToast('Shop link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${whatsappShareText}`, '_blank');
  };

  const handleContactWhatsApp = () => {
    const cleanPhone = currentShop.phone.replace(/[^0-9]/g, '');
    const formatted = cleanPhone.startsWith('0') ? '254' + cleanPhone.substring(1) : cleanPhone;
    window.open(`https://wa.me/${formatted}?text=${whatsappContactText}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Top Banner & Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <button
              onClick={() => navigateTo('marketplace')}
              className="flex items-center gap-1 hover:text-neutral-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Marketplace</span>
            </button>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
              <span>shoplink.co.ke/shop/{currentShop.slug}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Store Header Hero */}
      <div className="relative bg-white border-b border-neutral-200 shadow-xs">
        {/* Banner image or background tint */}
        <div className="h-36 sm:h-52 w-full bg-neutral-800 relative overflow-hidden">
          {currentShop.banner_url ? (
            <img
              src={currentShop.banner_url}
              alt={currentShop.name}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-emerald-800 to-neutral-900 opacity-90" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-14 sm:-mt-16 pb-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            {/* Logo and Shop Info */}
            <div className="flex items-end gap-4">
              <img
                src={currentShop.logo_url}
                alt={currentShop.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0"
              />
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                    {currentShop.name}
                  </h1>
                  <span className="p-0.5 rounded-full bg-emerald-100 text-emerald-700" title="Verified Seller">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xl">
                  {currentShop.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-neutral-700">
                      {currentShop.county ? `${currentShop.county} County` : ''}
                    </span>
                    {currentShop.exact_location ? (
                      <span>&bull; {currentShop.exact_location}</span>
                    ) : (
                      <span>{currentShop.location}</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    Delivery: KSh {currentShop.delivery_fee.toLocaleString()}
                  </span>
                </div>

                {/* Visual Payment Methods Accepted Badges */}
                <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-neutral-600 mr-1">Accepts:</span>
                  {(currentShop.settlement?.enabled_methods?.includes('till') ||
                    currentShop.settlement?.till_number ||
                    currentShop.settlement?.settlement_type === 'till') && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
                      <Store className="w-3 h-3 text-emerald-600" />
                      <span>Till {currentShop.settlement?.till_number ? `(${currentShop.settlement.till_number})` : ''}</span>
                    </span>
                  )}
                  {(currentShop.settlement?.enabled_methods?.includes('paybill') ||
                    currentShop.settlement?.paybill_number ||
                    currentShop.settlement?.settlement_type === 'paybill') && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-medium">
                      <Building2 className="w-3 h-3 text-blue-600" />
                      <span>Paybill {currentShop.settlement?.paybill_number ? `(${currentShop.settlement.paybill_number})` : ''}</span>
                    </span>
                  )}
                  {(currentShop.settlement?.enabled_methods?.includes('pochi') ||
                    currentShop.settlement?.pochi_phone ||
                    currentShop.settlement?.settlement_type === 'pochi') && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium">
                      <Smartphone className="w-3 h-3 text-amber-600" />
                      <span>Pochi {currentShop.settlement?.pochi_phone ? `(${currentShop.settlement.pochi_phone})` : ''}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Shop Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                onClick={() => setIsShopLinkModalOpen(true)}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 border border-emerald-200"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>Shop Link &amp; QR</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 border border-emerald-200"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Share</span>
              </button>

              <button
                onClick={handleContactWhatsApp}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Contact Business</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-medium hover:bg-neutral-200 transition-colors"
                title="Copy Shop URL"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Search & Category Filter Bar */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${currentShop.name}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All Products ({currentShopProducts.length})
            </button>
            {productCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-800">No products found</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Try adjusting your search query or choosing another category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const isOutOfStock = product.stock_quantity <= 0;
              const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
              const discountPercent = product.sale_price
                ? Math.round(((product.price - product.sale_price) / product.price) * 100)
                : null;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  <div>
                    {/* Product Image */}
                    <div className="relative h-48 bg-neutral-100 overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        {discountPercent && (
                          <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-extrabold uppercase shadow-xs">
                            {discountPercent}% OFF
                          </span>
                        )}
                        {product.is_featured && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-extrabold uppercase shadow-xs flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Popular
                          </span>
                        )}
                      </div>

                      {/* Stock Indicator Top Right */}
                      <div className="absolute top-2.5 right-2.5">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-md bg-neutral-900/85 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                            <XCircle className="w-2.5 h-2.5 text-red-400" />
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Only {product.stock_quantity} left
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            In Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-4">
                      <p className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider mb-1">
                        {product.category}
                      </p>
                      <h3 className="font-bold text-neutral-900 text-sm line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Pricing */}
                      <div className="mt-3 flex items-baseline gap-2">
                        {product.sale_price ? (
                          <>
                            <span className="text-base font-extrabold text-neutral-900">
                              KSh {product.sale_price.toLocaleString()}
                            </span>
                            <span className="text-xs line-through text-neutral-400 font-medium">
                              KSh {product.price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-base font-extrabold text-neutral-900">
                            KSh {product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add To Cart CTA */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => addToCart(product, 1)}
                      disabled={isOutOfStock}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        isOutOfStock
                          ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 active:scale-98'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar for Mobile shoppers */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-30">
          <div className="bg-neutral-900 text-white rounded-2xl p-3 px-4 shadow-2xl flex items-center justify-between border border-neutral-800 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-neutral-950 font-extrabold flex items-center justify-center text-xs">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </div>
              <div>
                <p className="text-xs text-neutral-400">Total in Cart</p>
                <p className="text-sm font-extrabold">
                  KSh{' '}
                  {cart
                    .reduce((a, b) => a + (b.product.sale_price || b.product.price) * b.quantity, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-neutral-950 text-xs font-extrabold hover:bg-emerald-400 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span>View Cart & Checkout</span>
            </button>
          </div>
        </div>
      )}

      {/* Direct Store Link & QR Code Modal */}
      {currentShop && (
        <ShopLinkModal
          isOpen={isShopLinkModalOpen}
          onClose={() => setIsShopLinkModalOpen(false)}
          business={currentShop}
        />
      )}
    </div>
  );
};
