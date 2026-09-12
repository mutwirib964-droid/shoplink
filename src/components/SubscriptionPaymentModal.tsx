import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SubscriptionPlan } from '../types';
import {
  X,
  Smartphone,
  CheckCircle2,
  Copy,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
  AlertCircle,
  Receipt,
  Printer,
  CreditCard,
  Building,
} from 'lucide-react';

interface SubscriptionPaymentModalProps {
  plan: SubscriptionPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubscriptionPaymentModal: React.FC<SubscriptionPaymentModalProps> = ({
  plan,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { myBusiness, updateBusinessSubscription, showToast } = useApp();

  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [paymentMethod, setPaymentMethod] = useState<'stk_push' | 'paybill'>('stk_push');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [manualReceiptCode, setManualReceiptCode] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // STK Push flow states
  const [stkStatus, setStkStatus] = useState<'idle' | 'sending' | 'prompted' | 'verifying' | 'completed' | 'failed'>('idle');
  const [countdown, setCountdown] = useState<number>(40);
  const [generatedReceipt, setGeneratedReceipt] = useState<string>('');
  const [showReceiptView, setShowReceiptView] = useState<boolean>(false);

  // Initialize phone from business on open
  useEffect(() => {
    if (myBusiness?.phone) {
      setMpesaPhone(myBusiness.phone);
    } else {
      setMpesaPhone('0712345678');
    }
    setStkStatus('idle');
    setManualReceiptCode('');
    setShowReceiptView(false);
  }, [isOpen, myBusiness]);

  // STK push countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stkStatus === 'prompted' && countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (stkStatus === 'prompted' && countdown === 0) {
      // Prompt timeout
      setStkStatus('failed');
    }
    return () => clearTimeout(timer);
  }, [stkStatus, countdown]);

  if (!isOpen || !plan) return null;

  const basePrice = plan.price;
  const isFreePlan = basePrice === 0;
  const annualPrice = Math.round(basePrice * 12 * 0.8); // 20% discount
  const finalAmount = billingInterval === 'year' ? annualPrice : basePrice;

  const businessSlug = myBusiness?.slug || 'my-shop';
  const paybillNumber = '400200';
  const paybillAccount = `SUB-${businessSlug.toUpperCase()}`;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName}: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 1. Direct confirmation for Free Plan
  const handleConfirmFreePlan = () => {
    if (!myBusiness) return;
    updateBusinessSubscription(myBusiness.id, plan.id);
    onClose();
    if (onSuccess) onSuccess();
  };

  // 2. Initiate STK push
  const handleInitiateSTKPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpesaPhone.trim() || mpesaPhone.length < 9) {
      showToast('Please enter a valid 10-digit M-Pesa phone number.');
      return;
    }

    setStkStatus('sending');
    setTimeout(() => {
      setStkStatus('prompted');
      setCountdown(40);
    }, 1200);
  };

  // 3. Complete payment (automated callback simulation or manual approve)
  const handleCompletePayment = (receiptCode?: string) => {
    if (!myBusiness) return;

    setStkStatus('verifying');

    const receipt = receiptCode || `RHB${Math.floor(100000 + Math.random() * 900000)}K`;
    setGeneratedReceipt(receipt);

    setTimeout(() => {
      updateBusinessSubscription(myBusiness.id, plan.id, {
        mpesaPhone,
        receiptNumber: receipt,
        amount: finalAmount,
        billingInterval,
      });
      setStkStatus('completed');
      if (onSuccess) onSuccess();
    }, 1500);
  };

  // 4. Verify manual Paybill transaction
  const handleVerifyPaybill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualReceiptCode.trim() || manualReceiptCode.length < 6) {
      showToast('Please enter the valid M-Pesa transaction code received in SMS.');
      return;
    }
    handleCompletePayment(manualReceiptCode.toUpperCase().trim());
  };

  return (
    <div
      id="subscription-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
      onClick={e => {
        if ((e.target as HTMLElement).id === 'subscription-modal-backdrop' && stkStatus !== 'verifying') {
          onClose();
        }
      }}
    >
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-6 animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="relative px-6 py-5 border-b border-neutral-100 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>ShopLink Subscription Upgrade</span>
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Switch to {plan.name} Plan</span>
          </h2>
          <p className="text-xs text-neutral-300 mt-1">
            Unlock higher sales volume, advanced M-Pesa checkout, and priority Kenyan merchant perks.
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* =========================================================================
              VIEW A: PAYMENT COMPLETED RECEIPT SCREEN
          ========================================================================= */}
          {stkStatus === 'completed' ? (
            <div className="space-y-6 text-center py-2 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-neutral-900">
                  Payment Verified Successfully!
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Your store is now upgraded to the <strong className="text-emerald-700">{plan.name} Plan</strong>.
                </p>
              </div>

              {/* Official Receipt Card */}
              <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-5 text-left text-xs font-mono space-y-2.5">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
                  <div className="flex items-center gap-2 font-sans font-bold text-neutral-900">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>HASHBACK M-PESA TAX INVOICE</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    PAID
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-500">M-Pesa Receipt:</span>
                  <span className="font-bold text-neutral-900">{generatedReceipt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Merchant Store:</span>
                  <span className="font-semibold text-neutral-800">{myBusiness?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subscribed Plan:</span>
                  <span className="font-semibold text-neutral-800">{plan.name} ({billingInterval.toUpperCase()})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Amount Charged:</span>
                  <span className="font-extrabold text-neutral-950 text-sm">
                    KSh {finalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">M-Pesa Phone:</span>
                  <span className="text-neutral-800">{mpesaPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Payment Date:</span>
                  <span className="text-neutral-800">{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Next Renewal:</span>
                  <span className="text-neutral-800">
                    {new Date(Date.now() + (billingInterval === 'year' ? 365 : 30) * 86400000).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
                >
                  <span>Return to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : isFreePlan ? (
            /* =========================================================================
                VIEW B: FREE PLAN DOWNGRADE CONFIRMATION
            ========================================================================= */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Downgrade to Free Plan</p>
                  <p className="mt-0.5 text-amber-800">
                    The Free Plan is KSh 0 per month. Your store will be adjusted to a limit of 10 products. No payment is required.
                  </p>
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-neutral-600">Plan:</span>
                  <span className="font-bold text-neutral-900">FREE PLAN</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-neutral-600">Monthly Price:</span>
                  <span className="font-bold text-emerald-700">KSh 0 / month</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-neutral-600">Product Capacity:</span>
                  <span className="text-neutral-900">Up to 10 products</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-bold hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmFreePlan}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold"
                >
                  Confirm Switch to Free
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================================
                VIEW C: PAID PLAN PAYMENT GATEWAY & INSTRUCTIONS
            ========================================================================= */
            <div className="space-y-6">
              {/* Plan Summary Box with Billing Interval Toggle */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      Selected Plan
                    </span>
                    <h3 className="text-base font-extrabold text-neutral-900">
                      {plan.name} PLAN
                    </h3>
                  </div>

                  {/* Monthly vs Annual Toggle */}
                  <div className="inline-flex p-1 bg-neutral-200/80 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setBillingInterval('month')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        billingInterval === 'month'
                          ? 'bg-white text-neutral-900 shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingInterval('year')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                        billingInterval === 'year'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <span>Annual</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-1 rounded">
                        -20%
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <span className="text-xs text-neutral-600">Total Due Today:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-neutral-900">
                      KSh {finalAmount.toLocaleString()}
                    </span>
                    <span className="text-xs text-neutral-500 block">
                      {billingInterval === 'year' ? 'Billed annually' : 'Billed monthly via M-Pesa'}
                    </span>
                  </div>
                </div>
              </div>

              {/* STK Push in progress state */}
              {stkStatus === 'prompted' || stkStatus === 'verifying' ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4 text-center">
                  <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30" />
                    <div className="relative w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Smartphone className="w-6 h-6 animate-bounce" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-emerald-950">
                      Check Your Phone for M-Pesa PIN Prompt
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      A prompt has been sent to Safaricom line <strong className="font-mono">{mpesaPhone}</strong> for{' '}
                      <strong>KSh {finalAmount.toLocaleString()}</strong>.
                    </p>
                  </div>

                  {/* Simulated Phone Prompt Mockup */}
                  <div className="bg-white rounded-xl p-3 max-w-xs mx-auto border border-emerald-300 shadow-sm text-left font-mono text-[11px] text-neutral-800 space-y-1">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-1 text-[10px] text-neutral-400">
                      <span>SIM TOOLKIT</span>
                      <span>M-PESA</span>
                    </div>
                    <p className="font-bold text-neutral-900">
                      Do you want to pay KSh {finalAmount.toLocaleString()} to SHOPLINK KENYA?
                    </p>
                    <p className="text-neutral-500">Acc: {paybillAccount}</p>
                    <div className="pt-1 flex justify-between text-neutral-400 text-[10px]">
                      <span>Enter PIN: • • • •</span>
                      <span className="text-emerald-700 font-bold">[ OK ]</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-semibold">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Awaiting Hashback confirmation... ({countdown}s)</span>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60 flex flex-col sm:flex-row gap-2">
                    {/* Simulated instant confirmation button for test environments */}
                    <button
                      type="button"
                      onClick={() => handleCompletePayment()}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                    >
                      I Have Entered PIN on Phone
                    </button>
                    <button
                      type="button"
                      onClick={() => setStkStatus('idle')}
                      className="py-2 px-3 bg-white border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-50"
                    >
                      Change Phone Number
                    </button>
                  </div>
                </div>
              ) : stkStatus === 'failed' ? (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-red-900">M-Pesa Prompt Timed Out</h4>
                    <p className="text-xs text-red-700 mt-0.5">
                      Did not receive the prompt? You can retry STK push or use the manual Paybill number below.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setStkStatus('idle')}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => {
                        setStkStatus('idle');
                        setPaymentMethod('paybill');
                      }}
                      className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-xl text-xs font-bold"
                    >
                      Use Paybill Instead
                    </button>
                  </div>
                </div>
              ) : (
                /* Choose between STK Push or Paybill */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('stk_push')}
                      className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                        paymentMethod === 'stk_push'
                          ? 'bg-white text-emerald-900 shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Instant STK Push</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paybill')}
                      className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                        paymentMethod === 'paybill'
                          ? 'bg-white text-emerald-900 shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <Building className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Manual Paybill</span>
                    </button>
                  </div>

                  {/* METHOD 1: STK PUSH FORM */}
                  {paymentMethod === 'stk_push' && (
                    <form onSubmit={handleInitiateSTKPush} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                          Safaricom M-Pesa Phone Number *
                        </label>
                        <div className="relative">
                          <Smartphone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            value={mpesaPhone}
                            onChange={e => setMpesaPhone(e.target.value)}
                            placeholder="0712 345 678"
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono"
                          />
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          We will prompt this phone number with a PIN dialog via Hashback gateway.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Secured by Safaricom & Hashback</p>
                          <p className="text-[11px] text-emerald-800">
                            No card details needed. Your payment is directly deducted from your M-Pesa balance.
                          </p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={stkStatus === 'sending'}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                      >
                        {stkStatus === 'sending' ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin" />
                            <span>Contacting Safaricom Gateway...</span>
                          </>
                        ) : (
                          <>
                            <span>Send M-Pesa Prompt (KSh {finalAmount.toLocaleString()})</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* METHOD 2: MANUAL PAYBILL INSTRUCTIONS */}
                  {paymentMethod === 'paybill' && (
                    <div className="space-y-4">
                      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-3">
                        <p className="text-xs font-bold text-neutral-900">
                          Follow these steps on your Safaricom phone:
                        </p>

                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-neutral-200">
                            <div>
                              <span className="text-neutral-500 block text-[10px]">Lipa na M-Pesa Paybill</span>
                              <span className="font-mono font-bold text-neutral-900 text-sm">
                                {paybillNumber}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(paybillNumber, 'Paybill Number')}
                              className="px-2.5 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 rounded-lg font-bold text-neutral-700 flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedField === 'Paybill Number' ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-neutral-200">
                            <div>
                              <span className="text-neutral-500 block text-[10px]">Account Number</span>
                              <span className="font-mono font-bold text-neutral-900 text-sm">
                                {paybillAccount}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(paybillAccount, 'Account Number')}
                              className="px-2.5 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 rounded-lg font-bold text-neutral-700 flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedField === 'Account Number' ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-neutral-200">
                            <div>
                              <span className="text-neutral-500 block text-[10px]">Exact Amount</span>
                              <span className="font-mono font-bold text-emerald-800 text-sm">
                                KSh {finalAmount.toLocaleString()}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(finalAmount.toString(), 'Amount')}
                              className="px-2.5 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 rounded-lg font-bold text-neutral-700 flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedField === 'Amount' ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-neutral-600 bg-white p-3 rounded-xl border border-neutral-200 space-y-1">
                          <p>1. Open M-Pesa menu &gt; <strong>Lipa na M-Pesa</strong> &gt; <strong>Paybill</strong></p>
                          <p>2. Enter Business Number <strong>{paybillNumber}</strong></p>
                          <p>3. Enter Account Number <strong>{paybillAccount}</strong></p>
                          <p>4. Enter Amount <strong>KSh {finalAmount.toLocaleString()}</strong></p>
                          <p>5. Enter your M-Pesa PIN and send</p>
                        </div>
                      </div>

                      {/* Manual verification form */}
                      <form onSubmit={handleVerifyPaybill} className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-neutral-800 mb-1">
                            Paste M-Pesa SMS Confirmation Code *
                          </label>
                          <input
                            type="text"
                            required
                            value={manualReceiptCode}
                            onChange={e => setManualReceiptCode(e.target.value.toUpperCase())}
                            placeholder="e.g. RHB81023J or SHL92837K"
                            className="w-full px-3 py-2.5 text-xs font-mono font-bold uppercase rounded-xl border border-neutral-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                          />
                          <p className="text-[10px] text-neutral-500 mt-1">
                            Found in the Safaricom confirmation SMS (e.g. &quot;Confirmed. Ksh... sent to ShopLink...&quot;).
                          </p>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                          <span>Verify M-Pesa Code & Activate</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
