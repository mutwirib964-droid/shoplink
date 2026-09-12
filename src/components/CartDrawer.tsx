import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartDeliveryFee,
    cartTotal,
    currentShop,
  } = useApp();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-neutral-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900">Your Cart</h2>
                  <p className="text-[11px] text-neutral-500">
                    Ordering from {currentShop?.name || "ShopLink Store"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-800">Your cart is empty</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                    Browse the shop products and add items to your cart to checkout with M-Pesa.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-neutral-100">
                    <span>{cart.length} item{cart.length > 1 ? 's' : ''} in cart</span>
                    <button
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Empty Cart
                    </button>
                  </div>

                  {cart.map(item => {
                    const price = item.product.sale_price || item.product.price;
                    const isMaxStock = item.quantity >= item.product.stock_quantity;

                    return (
                      <div
                        key={item.product.id}
                        className="flex gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
                      >
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-lg object-cover border border-neutral-200 shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                                {item.product.name}
                              </h4>
                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="text-neutral-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs font-extrabold text-neutral-900 mt-0.5">
                              KSh {price.toLocaleString()}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 border border-neutral-200 rounded-lg bg-white p-0.5">
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                className="p-1 text-neutral-600 hover:bg-neutral-100 rounded"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-neutral-900 px-1.5">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                disabled={isMaxStock}
                                className={`p-1 rounded ${
                                  isMaxStock
                                    ? 'text-neutral-300 cursor-not-allowed'
                                    : 'text-neutral-600 hover:bg-neutral-100'
                                }`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-xs font-extrabold text-neutral-900">
                              KSh {(price * item.quantity).toLocaleString()}
                            </span>
                          </div>

                          {isMaxStock && (
                            <p className="text-[10px] text-amber-600 mt-1">
                              Max stock ({item.product.stock_quantity}) reached
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Drawer Footer / Summary */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50 space-y-3">
                <div className="space-y-1.5 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-900">
                      KSh {cartSubtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Estimated Delivery</span>
                    </span>
                    <span className="font-semibold text-neutral-900">
                      KSh {cartDeliveryFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-neutral-900 pt-2 border-t border-neutral-200">
                    <span>Grand Total</span>
                    <span className="text-emerald-700">
                      KSh {cartTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secured by Hashback M-Pesa Gateway</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal onClose={() => setIsCheckoutOpen(false)} />
      )}
    </>
  );
};
