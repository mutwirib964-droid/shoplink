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
  Store,
  Building2,
  Copy,
  Check,
  CreditCard,
  PhoneCall,
} from 'lucide-react';
import { Order } from '../types';
import { buildWhatsAppUrl } from '../lib/assistanceConfig';

interface CheckoutModalProps {
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose }) => {
  const {
    cart,
    cartSubtotal,
    currentShop,
    createOrder,
    processPaymentWebhook,
    navigateTo,
    user,
    showToast,
  } = useApp();

  // Form fields
  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '0711445566');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryLocation, setDeliveryLocation] = useState('Nairobi - Kilimani');
  const [deliveryAddress, setDeliveryAddress] = useState('Argwings Kodhek Rd, Royal Suites Apt 4B');
  const [deliveryNotes, setDeliveryNotes] = useState('Please call when at the gate.');
  const [mpesaPhone, setMpesaPhone] = useState('0711445566');

  // Multi-method payment choice by buyer
  const settlement = currentShop?.settlement;
  const enabledMethods = settlement?.enabled_methods || (settlement?.settlement_type ? [settlement.settlement_type] : ['till']);

  // Selected checkout payment channel: 'stk' | 'till' | 'paybill' | 'pochi'
  const [selectedChannel, setSelectedChannel] = useState<'stk' | 'till' | 'paybill' | 'pochi'>('stk');
  const [manualTxCode, setManualTxCode] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const activeDeliveryFee = deliveryType === 'pickup' ? 0 : (currentShop?.delivery_fee || 0);
  const activeTotal = cartSubtotal + activeDeliveryFee;

  // Checkout Stages: 'form' | 'stk_prompt' | 'success' | 'failed'
  const [stage, setStage] = useState<'form' | 'stk_prompt' | 'success' | 'failed'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resulting Order and Payment references
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [gatewayTxId, setGatewayTxId] = useState<string>('');
  const [mpesaReceipt, setMpesaReceipt] = useState<string>('');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

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
        deliveryLocation: deliveryType === 'pickup' ? `Store Pickup (${currentShop?.location || 'Store'})` : deliveryLocation,
        deliveryAddress: deliveryType === 'pickup' ? `In-Store Pickup (${currentShop?.location || 'Store'})` : deliveryAddress,
        deliveryNotes: deliveryNotes || undefined,
        deliveryType,
        deliveryFee: activeDeliveryFee,
        mpesaPhone: cleanPhone,
      });

      setCreatedOrder(result.order);

      if (selectedChannel === 'stk') {
        setGatewayTxId(result.paymentPrompt?.gatewayTransactionId || `HB-TX-${Date.now()}`);
        setStage('stk_prompt');
      } else {
        // Manual Till / Paybill / Pochi confirmation
        const receipt = manualTxCode.trim().toUpperCase() || `MP${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setMpesaReceipt(receipt);
        await processPaymentWebhook(result.order.id, 'successful', receipt);
        setStage('success');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulates or confirms the customer entering their M-Pesa PIN for STK
  const handleSimulatePinEnter = async (status: 'SUCCESS' | 'CANCELLED') => {
    if (!createdOrder) return;
    setIsSubmitting(true);

    try {
      if (status === 'SUCCESS') {
        const receipt = `RHB${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        setMpesaReceipt(receipt);

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
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              M
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                {stage === 'form' && 'Direct M-Pesa Checkout'}
                {stage === 'stk_prompt' && 'Complete M-Pesa Payment'}
                {stage === 'success' && 'Order Confirmed!'}
                {stage === 'failed' && 'Payment Cancelled'}
              </h3>
              <p className="text-[11px] text-neutral-500">
                {currentShop?.name || 'ShopLink Store'} &bull; Direct Merchant Settlement
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
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
                <div className="flex justify-between font-medium text-neutral-700">
                  <span>Items ({cart.length})</span>
                  <span>KSh {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium text-neutral-700">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-neutral-500" />
                    Delivery
                  </span>
                  <span className="font-semibold text-neutral-900">
                    {deliveryType === 'pickup'
                      ? 'Free Pickup (KSh 0)'
                      : activeDeliveryFee > 0
                      ? `KSh ${activeDeliveryFee.toLocaleString()} (Est.)`
                      : 'Quoted by Seller'}
                  </span>
                </div>
                <div className="flex justify-between font-extrabold text-neutral-900 pt-1.5 border-t border-neutral-200 text-sm">
                  <span>Total Due</span>
                  <span className="text-emerald-700">KSh {activeTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery Method Selection */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  1. Delivery Method
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      deliveryType === 'delivery'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Truck className={`w-4 h-4 ${deliveryType === 'delivery' ? 'text-emerald-600' : 'text-neutral-500'}`} />
                      <span className="text-xs font-bold">Doorstep Courier</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1 font-normal leading-tight">
                      Seller inserts exact fee by distance
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      deliveryType === 'pickup'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Store className={`w-4 h-4 ${deliveryType === 'pickup' ? 'text-emerald-600' : 'text-neutral-500'}`} />
                      <span className="text-xs font-bold">Store Pickup</span>
                    </div>
                    <p className="text-[10px] text-emerald-700 mt-1 font-bold leading-tight">
                      Free (KSh 0) &mdash; Collect at shop
                    </p>
                  </button>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  2. {deliveryType === 'pickup' ? 'Pickup Details' : 'Destination Address'}
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

                {deliveryType === 'delivery' ? (
                  <>
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
                      💡 <strong>Shop Location:</strong> {currentShop?.exact_location || currentShop?.location || 'Merchant Store'} ({currentShop?.county || 'Kenya'} County).
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
                  </>
                ) : (
                  <div className="p-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs text-neutral-700">
                    <p className="font-bold text-neutral-900">Collection Location:</p>
                    <p className="mt-0.5">{currentShop?.name} &mdash; {currentShop?.exact_location || currentShop?.location || 'Merchant Store'}</p>
                    <p className="text-[11px] text-neutral-500 mt-1">You will receive an SMS and WhatsApp alert when your package is ready for pickup.</p>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                    Special Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={e => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Call before dispatch or leave with gate security"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* ========================================================= */}
              {/* Payment Channel Selection: STK Push, Till, Paybill, Pochi */}
              {/* ========================================================= */}
              <div className="pt-2 border-t border-neutral-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    3. Select How You Want to Pay
                  </p>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Direct to {currentShop?.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* STK Push Option */}
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('stk')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedChannel === 'stk'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold">M-Pesa STK Push</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1 font-normal">
                      Instant PIN prompt on phone
                    </p>
                  </button>

                  {/* Till Number Option */}
                  {(enabledMethods.includes('till') || settlement?.till_number) && (
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('till')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedChannel === 'till'
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Store className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold">Buy Goods Till</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1 font-normal font-mono">
                        Till: {settlement?.till_number || '5928341'}
                      </p>
                    </button>
                  )}

                  {/* Paybill Option */}
                  {(enabledMethods.includes('paybill') || settlement?.paybill_number) && (
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('paybill')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedChannel === 'paybill'
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold">Paybill</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1 font-normal font-mono">
                        PB: {settlement?.paybill_number || '400200'}
                      </p>
                    </button>
                  )}

                  {/* Pochi Option */}
                  {(enabledMethods.includes('pochi') || settlement?.pochi_phone) && (
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('pochi')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedChannel === 'pochi'
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <PhoneCall className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold">Pochi la Biashara</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1 font-normal font-mono">
                        {settlement?.pochi_phone || currentShop?.phone}
                      </p>
                    </button>
                  )}
                </div>

                {/* Selected Channel Interactive Panel */}
                {selectedChannel === 'stk' && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                    <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                      M-Pesa Phone Number for PIN Prompt *
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={mpesaPhone}
                        onChange={e => setMpesaPhone(e.target.value)}
                        placeholder="07XXXXXXXX or 01XXXXXXXX"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-emerald-300 bg-white font-mono font-bold text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <p className="text-[10px] text-emerald-800 mt-1.5 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 shrink-0" />
                      <span>An STK prompt will be sent immediately to your phone.</span>
                    </p>
                  </div>
                )}

                {selectedChannel === 'till' && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950">Buy Goods Till Number:</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settlement?.till_number || '5928341', 'Till Number')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-neutral-100 rounded-lg border border-emerald-300 text-xs font-bold text-emerald-900 transition-colors"
                      >
                        {copiedField === 'Till Number' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'Till Number' ? 'Copied!' : 'Copy Till'}</span>
                      </button>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-300 text-center font-mono font-black text-lg text-emerald-900 tracking-wider">
                      {settlement?.till_number || '5928341'}
                    </div>
                    <p className="text-[11px] text-neutral-600">
                      Store Name: <strong>{settlement?.store_name || currentShop?.name}</strong>. Open M-Pesa &gt; Lipa na M-Pesa &gt; Buy Goods &gt; Enter <strong>{settlement?.till_number || '5928341'}</strong> &gt; Amount: <strong>KSh {activeTotal.toLocaleString()}</strong>.
                    </p>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        M-Pesa Confirmation Code (Optional or auto-verified)
                      </label>
                      <input
                        type="text"
                        value={manualTxCode}
                        onChange={e => setManualTxCode(e.target.value)}
                        placeholder="e.g. SI83JX991P"
                        className="w-full px-3 py-1.5 text-xs font-mono uppercase font-bold rounded-lg border border-neutral-300 bg-white"
                      />
                    </div>
                  </div>
                )}

                {selectedChannel === 'paybill' && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-white border border-blue-200">
                        <span className="text-[10px] text-blue-700 font-bold block">Business No:</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="font-mono font-black text-base text-neutral-900">
                            {settlement?.paybill_number || '400200'}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(settlement?.paybill_number || '400200', 'Paybill')}
                            className="p-1 text-blue-700 hover:text-blue-900"
                            title="Copy Paybill"
                          >
                            {copiedField === 'Paybill' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-blue-200">
                        <span className="text-[10px] text-blue-700 font-bold block">Account No:</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="font-mono font-black text-sm text-neutral-900 truncate">
                            {settlement?.paybill_account_number || settlement?.account_number_format || currentShop?.slug?.toUpperCase()}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(settlement?.paybill_account_number || settlement?.account_number_format || currentShop?.slug?.toUpperCase() || '', 'Account')}
                            className="p-1 text-blue-700 hover:text-blue-900"
                            title="Copy Account"
                          >
                            {copiedField === 'Account' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-600">
                      Open M-Pesa &gt; Lipa na M-Pesa &gt; Paybill &gt; Enter Paybill <strong>{settlement?.paybill_number || '400200'}</strong> &gt; Account <strong>{settlement?.paybill_account_number || currentShop?.slug?.toUpperCase()}</strong> &gt; Amount: <strong>KSh {activeTotal.toLocaleString()}</strong>.
                    </p>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        M-Pesa Confirmation Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={manualTxCode}
                        onChange={e => setManualTxCode(e.target.value)}
                        placeholder="e.g. SI83JX991P"
                        className="w-full px-3 py-1.5 text-xs font-mono uppercase font-bold rounded-lg border border-neutral-300 bg-white"
                      />
                    </div>
                  </div>
                )}

                {selectedChannel === 'pochi' && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950">Pochi la Biashara Mobile Line:</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settlement?.pochi_phone || currentShop?.phone || '', 'Pochi Number')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-neutral-100 rounded-lg border border-amber-300 text-xs font-bold text-amber-900 transition-colors"
                      >
                        {copiedField === 'Pochi Number' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'Pochi Number' ? 'Copied!' : 'Copy Phone'}</span>
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-amber-300 text-center font-mono font-black text-lg text-amber-900 tracking-wider">
                      {settlement?.pochi_phone || currentShop?.phone}
                    </div>

                    <p className="text-[11px] text-neutral-600">
                      Name: <strong>{settlement?.pochi_name || currentShop?.name}</strong>. Dial *334# &gt; Pochi la Biashara &gt; Send Money &gt; Enter <strong>{settlement?.pochi_phone || currentShop?.phone}</strong> &gt; Amount: <strong>KSh {activeTotal.toLocaleString()}</strong>.
                    </p>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        M-Pesa Confirmation Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={manualTxCode}
                        onChange={e => setManualTxCode(e.target.value)}
                        placeholder="e.g. SI83JX991P"
                        className="w-full px-3 py-1.5 text-xs font-mono uppercase font-bold rounded-lg border border-neutral-300 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Processing Payment...</span>
                ) : selectedChannel === 'stk' ? (
                  <>
                    <span>Send STK Prompt for KSh {activeTotal.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Confirm Order Payment (KSh {activeTotal.toLocaleString()})</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-1 text-center">
                <a
                  href={buildWhatsAppUrl(`Hello ShopLink Support, I am checking out an order at ${currentShop?.name} and need help with M-Pesa payment.`)}
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
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-left font-mono space-y-1 text-neutral-600">
                <div className="flex justify-between">
                  <span>Order Number:</span>
                  <span className="font-bold text-neutral-900">{createdOrder?.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Merchant Destination:</span>
                  <span className="text-emerald-700 font-bold">{currentShop?.name}</span>
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

              {/* Live Demonstration Simulator for PIN entry */}
              <div className="pt-2 border-t border-neutral-100">
                <p className="text-[11px] text-neutral-500 mb-2">
                  (Simulate M-Pesa subscriber prompt response)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSimulatePinEnter('SUCCESS')}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enter PIN (Simulate Success)</span>
                  </button>
                  <button
                    onClick={() => handleSimulatePinEnter('CANCELLED')}
                    disabled={isSubmitting}
                    className="px-3 py-2.5 rounded-xl border border-neutral-300 text-neutral-600 text-xs font-medium hover:bg-neutral-100"
                  >
                    Cancel PIN
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: ORDER CONFIRMED */}
          {stage === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-neutral-900">
                  Order Successfully Placed!
                </h4>
                <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
                  Your payment has credited directly to{' '}
                  <strong className="text-neutral-900">{currentShop?.name}</strong>.
                </p>
              </div>

              {/* Receipt card */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-left space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Order Number:</span>
                  <span className="font-bold text-neutral-900">{createdOrder?.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">M-Pesa Reference:</span>
                  <span className="font-bold text-emerald-700">{mpesaReceipt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Amount Paid:</span>
                  <span className="font-bold text-neutral-900">
                    KSh {createdOrder?.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Delivery Destination:</span>
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
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
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
                  View My Orders &amp; Track Status
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
                  The M-Pesa prompt was cancelled or timed out. Your order is preserved as pending.
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
