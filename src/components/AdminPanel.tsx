import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Building2,
  Package,
  ShoppingBag,
  CreditCard,
  Crown,
  Settings,
  CheckCircle2,
  XCircle,
  Search,
  TrendingUp,
  DollarSign,
  ExternalLink,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    user,
    openAuthModal,
    businesses,
    updateBusiness,
    products,
    orders,
    payments,
    plans,
    navigateTo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'businesses' | 'products' | 'orders' | 'transactions' | 'plans'>('businesses');
  const [searchFilter, setSearchFilter] = useState('');

  // Protect Admin Route: Directed only if user profile is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl border border-neutral-200 p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900">Restricted Administration</h2>
          <p className="text-xs text-neutral-600 mt-2">
            The Platform SuperAdmin Console is strictly reserved for authorized ShopLink Kenya system administrators.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => openAuthModal('admin')}
              className="w-full py-2.5 bg-purple-700 text-white rounded-xl text-xs font-bold hover:bg-purple-800 transition-colors"
            >
              Sign In as Administrator
            </button>
            <button
              onClick={() => navigateTo('landing')}
              className="w-full py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-xs font-bold hover:bg-neutral-50 transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Platform Metrics
  const totalBusinesses = businesses.length;
  const activeBusinesses = businesses.filter(b => b.is_featured !== false).length;
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalGMV = orders
    .filter(o => o.payment_status === 'successful')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-neutral-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header */}
        <div className="bg-neutral-900 text-white rounded-2xl p-6 shadow-md border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Platform SuperAdmin</h1>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                  SYSTEM LEVEL
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                ShopLink Kenya SaaS Oversight, Merchant Auditing & Settlement Tracking
              </p>
            </div>
          </div>

          <button
            onClick={() => navigateTo('marketplace')}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition-colors"
          >
            Exit to Marketplace
          </button>
        </div>

        {/* Global Platform Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <p className="text-xs font-semibold text-neutral-500">Platform GMV (Total Sales)</p>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">
              KSh {totalGMV.toLocaleString()}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-2 inline-block">
              M-Pesa Gross Volume
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <p className="text-xs font-semibold text-neutral-500">Total Merchants</p>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">
              {totalBusinesses}
            </p>
            <span className="text-[11px] text-neutral-500 mt-2 inline-block">
              Across Kenyan hubs
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <p className="text-xs font-semibold text-neutral-500">Catalog Products</p>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">
              {totalProducts}
            </p>
            <span className="text-[11px] text-neutral-500 mt-2 inline-block">Active items</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <p className="text-xs font-semibold text-neutral-500">Total Customer Orders</p>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">
              {totalOrders}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-2 inline-block">
              100% Hashback Verified
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-2 flex flex-wrap gap-1 shadow-xs">
          {[
            { id: 'businesses', label: `Businesses (${totalBusinesses})`, icon: Building2 },
            { id: 'products', label: `Products (${totalProducts})`, icon: Package },
            { id: 'orders', label: `Orders (${totalOrders})`, icon: ShoppingBag },
            { id: 'transactions', label: `Transactions (${payments.length})`, icon: CreditCard },
            { id: 'plans', label: `SaaS Plans (${plans.length})`, icon: Crown },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Businesses */}
        {activeTab === 'businesses' && (
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Registered Businesses</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Business</th>
                    <th className="py-3 px-4">Slug URL</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4 text-right">Storefront</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {businesses.map(b => (
                    <tr key={b.id} className="hover:bg-neutral-50/60">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.logo_url}
                            alt={b.name}
                            className="w-9 h-9 rounded-lg object-cover border border-neutral-200"
                          />
                          <div>
                            <span className="font-bold text-neutral-900 block">{b.name}</span>
                            <span className="text-[11px] text-neutral-500">{b.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-700 font-medium">
                        /shop/{b.slug}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">{b.location}</td>
                      <td className="py-3 px-4">
                        <p className="font-mono text-neutral-800">{b.phone}</p>
                        <p className="text-[11px] text-neutral-500">{b.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-800 uppercase">
                          {b.subscription_plan_id.replace('plan_', '')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigateTo('shop', b.slug)}
                          className="px-2.5 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg inline-flex items-center gap-1"
                        >
                          <span>Visit</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Products */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="py-3 px-4 font-bold text-neutral-900">{p.name}</td>
                      <td className="py-3 px-4 text-neutral-600">{p.category}</td>
                      <td className="py-3 px-4 font-bold">KSh {p.price.toLocaleString()}</td>
                      <td className="py-3 px-4">{p.stock_quantity} units</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Orders */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Delivery</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                        {o.order_number}
                      </td>
                      <td className="py-3 px-4 font-medium">{o.customer_name}</td>
                      <td className="py-3 px-4 text-neutral-600">{o.delivery_location}</td>
                      <td className="py-3 px-4 font-extrabold text-neutral-900">
                        KSh {o.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {o.payment_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize font-semibold">{o.order_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Transactions */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Gateway Tx ID</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Gateway</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td className="py-3 px-4 font-bold text-neutral-900">
                        {p.gateway_transaction_id}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">{p.phone_number}</td>
                      <td className="py-3 px-4 font-bold text-neutral-900">
                        KSh {p.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 uppercase">{p.gateway}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-400">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Plans */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs">
                <h3 className="text-base font-bold text-neutral-900">{p.name}</h3>
                <p className="text-xs text-neutral-500 mt-1">{p.description}</p>
                <p className="text-2xl font-extrabold text-neutral-900 mt-4">
                  KSh {p.price.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-neutral-500">/mo</span>
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-neutral-600">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
