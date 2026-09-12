import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  MessageCircle,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

export const CustomerOrders: React.FC = () => {
  const { user, openAuthModal, orders, businesses, navigateTo } = useApp();

  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              My Orders & Deliveries
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Track your recent orders placed with Kenyan stores on ShopLink.
            </p>
          </div>

          <button
            onClick={() => navigateTo('marketplace')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Marketplace</span>
          </button>
        </div>

        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-900">Signed out shopper</p>
                <p className="text-[11px] text-blue-700">
                  Sign in with your phone or email to track your order deliveries and receipts.
                </p>
              </div>
            </div>
            <button
              onClick={() => openAuthModal('customer')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shrink-0 transition-colors"
            >
              Sign In to View Orders
            </button>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-900">No Orders Yet</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              You haven&apos;t placed any orders yet. Browse our local merchants and order via M-Pesa.
            </p>
            <button
              onClick={() => navigateTo('marketplace')}
              className="mt-5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Browse Kenyan Stores
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const shop = businesses.find(b => b.id === order.business_id);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4"
                >
                  {/* Order header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-neutral-900 text-sm">
                          Order #{order.order_number}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            order.payment_status === 'successful'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          M-Pesa: {order.payment_status}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-neutral-600">Store:</span>
                      <button
                        onClick={() => shop && navigateTo('shop', shop.slug)}
                        className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <span>{shop?.name || 'Local Store'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Delivery Status tracker */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-neutral-700">Fulfillment Status:</span>
                      <span className="font-bold text-emerald-700 capitalize flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        {order.order_status}
                      </span>
                    </div>

                    {/* Progress dots */}
                    <div className="grid grid-cols-4 gap-1 text-center pt-2">
                      {['pending', 'paid', 'processing', 'delivered'].map((step, idx) => {
                        const isReached =
                          (step === 'pending') ||
                          (step === 'paid' && order.payment_status === 'successful') ||
                          (step === 'processing' && ['processing', 'ready', 'shipped', 'delivered'].includes(order.order_status)) ||
                          (step === 'delivered' && order.order_status === 'delivered');

                        return (
                          <div key={step} className="flex flex-col items-center">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                isReached
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-neutral-200 text-neutral-500'
                              }`}
                            >
                              {idx + 1}
                            </div>
                            <span className="text-[10px] text-neutral-600 capitalize mt-1">
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-9 h-9 rounded-lg object-cover border border-neutral-200"
                          />
                          <div>
                            <p className="font-bold text-neutral-900">{item.product_name}</p>
                            <p className="text-[11px] text-neutral-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-extrabold text-neutral-900">
                          KSh {item.total.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom info & WhatsApp button */}
                  <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="text-neutral-500">
                        Delivery to: <strong className="text-neutral-900">{order.delivery_location}</strong> ({order.delivery_address})
                      </p>
                      <p className="font-bold text-neutral-900 mt-0.5">
                        Total: KSh {order.total.toLocaleString()} (incl. KSh {order.delivery_fee.toLocaleString()} delivery)
                      </p>
                    </div>

                    {shop && (
                      <button
                        onClick={() => {
                          const clean = shop.phone.replace(/[^0-9]/g, '');
                          const formatted = clean.startsWith('0') ? '254' + clean.substring(1) : clean;
                          window.open(
                            `https://wa.me/${formatted}?text=Hi%20${shop.name},%20checking%20status%20of%20Order%20%23${order.order_number}`,
                            '_blank'
                          );
                        }}
                        className="px-3.5 py-2 bg-emerald-50 text-emerald-800 font-bold rounded-xl hover:bg-emerald-100 transition-colors inline-flex items-center justify-center gap-1.5 border border-emerald-200"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Chat with Store on WhatsApp</span>
                      </button>
                    )}
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
