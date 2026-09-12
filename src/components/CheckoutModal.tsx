import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  MessageCircle,
  ArrowRight,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Order } from '../types';
import { ASSISTANCE_CONFIG, buildWhatsAppUrl } from '../lib/assistanceConfig';

interface CheckoutModalProps {
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose }) => {
  const {
    cart,
    cartSubtotal,
    cartDeliveryFee,
    cartTotal,
    currentShop,
    createOrder,
    processPaymentWebhook,
    navigateTo,
    user,
  } = useApp();

  // Form fields
  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '0711445566');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [deliveryLocation, setDeliveryLocation] = useState('Nairobi - Kilimani');
  const [deliveryAddress, setDeliveryAddress] = useState('Argwings Kodhek Rd, Royal Suites Apt 4B');
  const [deliveryNotes, setDeliveryNotes] = useState('Please call when at the gate.');
  const [mpesaPhone, setMpesaPhone] = useState('0711445566');

  // Checkout Stages: 'form' | 'stk_prompt' | 'success' | 'failed'
  const [stage, setStage] = useState<'form' | 'stk_prompt' | 'success' | 'failed'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resulting Order and Payment references
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [gatewayTxId, setGatewayTxId] = useState<string>('');
  const [mpesaReceipt, setMpesaReceipt] = useState<string>('');

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate Kenyan phone numbers
    const cleanPhone = mpesaPhone.replace(/\s+/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid Kenyan phone number (e.g. 0712345678 or 0112345678).');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOrder({
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        deliveryLocation,
        deliveryAddress,
        deliveryNotes: deliveryNotes || undefined,
        mpesaPhone: cleanPhone,
      });

      setCreatedOrder(result.order);
      setGatewayTxId(result.paymentPrompt?.gatewayTransactionId || `HB-TX-${Date.now()}`);
      setStage('stk_prompt');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulates or confirms the customer entering their M-Pesa PIN
  const handleSimulatePinEnter = async (status: 'SUCCESS' | 'CANCELLED') => {
    if (!createdOrder) return;
    setIsSubmitting(true);

    try {
      if (status === 'SUCCESS') {
        const receipt = `RHB${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        setMpesaReceipt(receipt);

        // Call backend or process payment webhook
        await processPaymentWebhook(createdOrder.id, 'successful', receipt);
        setStage('success');
      } else {
        await processPaymentWebhook(createdOrder.id, 'failed');
        setStage('failed');
      }
    } catch (err: any) {
      setErrorMessage('Payment verification error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppNotify = () => {
    if (!createdOrder || !currentShop) return;
    const cleanShopPhone = currentShop.phone.replace(/[^0-9]/g, '');
    const formatted = cleanShopPhone.startsWith('0') ? '254' + cleanShopPhone.substring(1) : cleanShopPhone;

    const message = encodeURIComponent(
      `Hello ${currentShop.name}, I have just completed payment for Order #${createdOrder.order_number} via M-Pesa (Ref: ${mpesaReceipt || 'Paid'}).\n\nTotal: KSh ${createdOrder.total.toLocaleString()}\nDelivery to: ${createdOrder.delivery_location}, ${createdOrder.delivery_address}.`
    );

    window.open(`https://wa.me/${formatted}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              M
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                {stage === 'form' && 'M-Pesa Checkout'}
                {stage === 'stk_prompt' && 'Complete M-Pesa Payment'}
                {stage === 'success' && 'Order Confirmed!'}
                {stage === 'failed' && 'Payment Cancelled'}
              </h3>
              <p className="text-[11px] text-neutral-500">
                {currentShop?.name || 'ShopLink Store'} • Hashback M-Pesa Gateway
              </p>
            </div>
          </div>
          {stage !== 'stk_prompt' && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STAGE 1: CHECKOUT FORM */}
          {stage === 'form' && (
            <form onSubmit={handleInitiatePayment} className="space-y-4">
              {/* Order Items Preview */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
                <div className="flex justify-between font-medium text-neutral-700">
                  <span>Items ({cart.length})</span>
                  <span>KSh {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium text-neutral-700">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-neutral-500" />
                    Delivery Fee
                  </span>
                  <span>KSh {cartDeliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-neutral-900 pt-1.5 border-t border-neutral-200 text-sm">
                  <span>Total Due</span>
                  <span className="text-emerald-700">KSh {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  1. Delivery Details
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="e.g. David Mwangi"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                    Town / Estate *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryLocation}
                    onChange={e => setDeliveryLocation(e.target.value)}
                    placeholder="e.g. Nairobi - Kilimani / Westlands / Roysambu"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                    Street Address / House / Building *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. Argwings Kodhek Rd, Royal Suites Apt 4B"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={e => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Leave with gate guard if away"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* M-Pesa Phone Section */}
              <div className="pt-2 border-t border-neutral-200">
                <p className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                  2. M-Pesa Payment Details
                </p>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                    M-Pesa Mobile Number *
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={mpesaPhone}
                      onChange={e => setMpesaPhone(e.target.value)}
                      placeholder="07XXXXXXXX or 01XXXXXXXX"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-emerald-300 bg-white font-mono font-bold text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <p className="text-[10px] text-emerald-800 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    An STK prompt will be sent immediately to this phone number.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Sending STK Prompt...</span>
                ) : (
                  <>
                    <span>Pay KSh {cartTotal.toLocaleString()} with M-Pesa</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <a
                  href={buildWhatsAppUrl(`Hello ShopLink Support, I am checking out an order at ${currentShop?.name} and need help with M-Pesa.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500 hover:text-emerald-700 transition-colors font-medium"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Need help paying? <strong className="font-semibold text-emerald-700 underline">Chat with us on WhatsApp</strong></span>
                </a>
              </div>
            </form>
          )}

          {/* STAGE 2: STK PUSH WAITING PROMPT */}
          {stage === 'stk_prompt' && (
            <div className="text-center py-4 space-y-4">
              {/* Animated Phone Graphic */}
              <div className="relative mx-auto w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 border-2 border-emerald-300 shadow-lg">
                <Smartphone className="w-10 h-10 animate-bounce" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                </span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-neutral-900">
                  Check Your Phone Now
                </h4>
                <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
                  An M-Pesa STK PIN prompt for{' '}
                  <strong className="text-neutral-900">
                    KSh {createdOrder?.total.toLocaleString()}
                  </strong>{' '}
                  has been sent to{' '}
                  <span className="font-mono font-bold text-emerald-700">
                    {mpesaPhone}
                  </span>
                  .
                </p>
              </div>

              {/* Transaction Metadata */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-left font-mono space-y-1 text-neutral-600">
                <div className="flex justify-between">
                  <span>Order Number:</span>
                  <span className="font-bold text-neutral-900">{createdOrder?.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gateway Ref:</span>
                  <span className="text-neutral-700">{gatewayTxId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" />
                    Awaiting PIN Confirmation
                  </span>
                </div>
              </div>

              {/* Developer / Sandbox PIN simulator for live demonstration */}
              <div className="pt-2 border-t border-neutral-100">
                <p className="text-[11px] text-neutral-500 mb-2">
                  (Simulate M-Pesa subscriber prompt response)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSimulatePinEnter('SUCCESS')}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    Enter M-Pesa PIN (Success)
                  </button>
                  <button
                    onClick={() => handleSimulatePinEnter('CANCELLED')}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 font-medium text-xs hover:bg-neutral-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: PAYMENT SUCCESS & ORDER CONFIRMATION */}
          {stage === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-neutral-900">
                  Payment Successful!
                </h4>
                <p className="text-xs text-neutral-600 mt-1">
                  Your order has been received by {currentShop?.name} and is now being processed.
                </p>
              </div>

              {/* Receipt Summary */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-left space-y-2">
                <div className="flex justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-500">M-Pesa Receipt:</span>
                  <span className="font-mono font-extrabold text-emerald-700">
                    {mpesaReceipt}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Order Reference:</span>
                  <span className="font-bold text-neutral-900">{createdOrder?.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Amount Paid:</span>
                  <span className="font-bold text-neutral-900">
                    KSh {createdOrder?.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Delivery Address:</span>
                  <span className="text-neutral-800 text-right max-w-[200px] truncate">
                    {createdOrder?.delivery_address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Inventory Status:</span>
                  <span className="text-emerald-700 font-bold">Auto-decremented</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleWhatsAppNotify}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Notify Shop via WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigateTo('customer-orders');
                  }}
                  className="w-full py-2.5 rounded-xl bg-neutral-100 text-neutral-800 font-semibold text-xs hover:bg-neutral-200 transition-colors"
                >
                  View My Orders & Track Status
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: PAYMENT FAILED OR CANCELLED */}
          {stage === 'failed' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-neutral-900">
                  Payment Was Not Completed
                </h4>
                <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
                  The STK prompt was either cancelled on the phone or timed out. Your order is preserved as pending.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStage('form')}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                >
                  Try Again with M-Pesa
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl bg-neutral-100 text-neutral-700 font-medium text-xs hover:bg-neutral-200 transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="pt-3 border-t border-neutral-200">
                <p className="text-[11px] text-neutral-500 mb-1.5">Need immediate assistance completing this order?</p>
                <a
                  href={buildWhatsAppUrl(`Hello ShopLink Support Team, my M-Pesa checkout failed for order ${createdOrder?.order_number || ''}. Please assist me.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chat with Support Agent on WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
