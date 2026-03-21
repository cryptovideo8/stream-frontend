'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAppSelector } from '../../../store/hooks';
import { selectIsAuthenticated, selectCurrentUser, setCredentials } from '../../../store/slices/authSlice';
import {
  useGetPlansQuery,
  useValidatePromoMutation,
  useSubscribeToPlanMutation,
  useGetMySubscriptionQuery,
  useCancelSubscriptionMutation,
  Plan
} from '../../../store/api/subscriptionApi';
import { useGetActiveUpiQuery, useSubmitAuditMutation, useGetMyAuditsQuery } from '../../../store/api/paymentApi';
import { QRCodeSVG } from 'qrcode.react';

export default function SubscriptionsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  // Queries & Mutations
  const { data: plans = [], isLoading: loadingPlans } = useGetPlansQuery();
  const { data: mySubData, isLoading: loadingMySub } = useGetMySubscriptionQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [validatePromo, { isLoading: validatingPromo }] = useValidatePromoMutation();
  const [subscribe, { isLoading: subscribing }] = useSubscribeToPlanMutation();
  const [cancelSub, { isLoading: cancelling }] = useCancelSubscriptionMutation();

  const { data: myAudits = [] } = useGetMyAuditsQuery(undefined, { skip: !isAuthenticated });

  // Local State
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // Changed default to UPI for manual MVP
  const [transactionId, setTransactionId] = useState('');

  const { data: activeUpi, isLoading: loadingActiveUpi } = useGetActiveUpiQuery(undefined, { skip: !showCheckout });
  const [submitAudit, { isLoading: submittingAudit }] = useSubmitAuditMutation();

  const activeSubscription = mySubData?.active ? mySubData.subscription : null;

  // Render Loading State
  if (loadingPlans || loadingMySub) {
    return (
      <div className="min-h-screen bg-dark-6 flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-45"></div>
      </div>
    );
  }

  // Handle Promo Apply
  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !selectedPlan) return;
    try {
      const res = await validatePromo({ code: promoCode, planId: selectedPlan._id }).unwrap();
      setPromoResult(res);
      toast.success('Promo code applied!');
    } catch (err: any) {
      setPromoResult(null);
      toast.error(err?.data?.message || 'Invalid promo code');
    }
  };

  const handleClearPromo = () => {
    setPromoCode('');
    setPromoResult(null);
  };

  // Handle Subscribe
  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!selectedPlan) return;

    // For UPI manual audit
    if (paymentMethod === 'upi') {
      if (!transactionId || transactionId.length < 10) {
        toast.error('Please enter a valid 12-digit UTR number');
        return;
      }
      try {
        await submitAudit({
          planId: selectedPlan._id,
          upiIdUsed: activeUpi?.upiId || 'Unknown',
          utrNumber: transactionId,
        }).unwrap();
        toast.success('UTR Submitted! Pending admin approval.');
        setShowCheckout(false);
        setSelectedPlan(null);
        setTransactionId('');
        return;
      } catch (err: any) {
        toast.error(err?.data?.message || 'Failed to submit UTR');
        return;
      }
    }

    // Existing Card / Auto / Mock logic if not UPI
    const finalTxnId = (paymentMethod === 'card' && !transactionId)
      ? `TXN-MOCK-${Date.now()}`
      : transactionId;

    if (!finalTxnId) {
      toast.error('Please enter a Transaction ID for manual payment');
      return;
    }

    const amountPaid = promoResult?.finalPrice ?? selectedPlan.price;

    try {
      const res = await subscribe({
        planId: selectedPlan._id,
        paymentMethod,
        transactionId: finalTxnId,
        amountPaid,
        promoCode: promoResult?.code,
      }).unwrap();

      toast.success('Subscription activated successfully!');

      // Update local storage auth sync
      if (user) {
        const updatedUser = { ...user, subscriptionId: res.subscription._id };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch(setCredentials({ user: updatedUser, token: localStorage.getItem('token') || '' }));
      }

      setShowCheckout(false);
      setSelectedPlan(null);
      handleClearPromo();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to activate subscription');
    }
  };

  // Handle Cancel
  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access immediately.')) return;
    try {
      await cancelSub().unwrap();
      toast.success('Subscription cancelled');
      if (user) {
        const updatedUser = { ...user, subscriptionId: undefined };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch(setCredentials({ user: updatedUser, token: localStorage.getItem('token') || '' }));
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to cancel subscription');
    }
  };

  const openCheckout = (plan: Plan) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to subscribe');
      router.push('/login');
      return;
    }
    setSelectedPlan(plan);
    handleClearPromo();
    setShowCheckout(true);
  };

  const pendingAudits = myAudits.filter(a => a.status === 'pending');

  return (
    <div className="min-h-[calc(100vh-56px)] bg-dark-6 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      {pendingAudits.length > 0 && !activeSubscription && (
        <div className="max-w-7xl mx-auto mb-8 animate-fade-in-down">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-yellow-500/5">
            <div className="flex items-center gap-3 text-yellow-500">
              <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-sm">Payment Pending Verification</p>
                <p className="text-xs text-yellow-600/80">You have {pendingAudits.length} manual payment(s) currently being reviewed by administrators.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Page Header --- */}
      <div className="max-w-7xl mx-auto text-center mb-16 px-4 animate-fade-in-up">
        {activeSubscription ? (
          <>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
              Your Current Plan
            </h1>
            <p className="text-lg text-grey-60 max-w-2xl mx-auto">
              You are currently subscribed to <strong className="text-white">{activeSubscription.planId?.name}</strong>.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
              Choose Your Perfect Plan
            </h1>
            <p className="text-lg text-grey-60 max-w-2xl mx-auto">
              Get unlimited access to our premium content with flexible subscription plans. Cancel anytime.
            </p>
          </>
        )}
      </div>

      {/* --- Active Subscription Card --- */}
      {activeSubscription && (
        <div className="max-w-3xl mx-auto bg-dark-12 border border-dark-25 rounded-2xl p-8 mb-16 animate-fade-in-up flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-white">{activeSubscription.planId?.name}</h2>
              <span className="px-3 py-1 bg-green-500/20 text-green-45 text-xs font-semibold rounded-full border border-green-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-grey-60 text-sm mb-4">
              Valid until: {new Date(activeSubscription.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-white font-medium">
              {activeSubscription.planId?.currency} {activeSubscription.finalAmountPaid} <span className="text-sm font-normal text-grey-60">paid via {activeSubscription.paymentDetails.paymentMethod}</span>
            </p>
          </div>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full sm:w-auto px-6 py-3 bg-dark-20 hover:bg-dark-30 border border-dark-35 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
          </button>
        </div>
      )}

      {/* --- Plans Grid --- */}
      {!activeSubscription && plans.length === 0 && (
        <div className="max-w-2xl mx-auto text-center py-16 px-4 rounded-2xl border border-dark-25 bg-dark-10">
          <p className="text-grey-60 mb-2">No subscription plans are available yet.</p>
          <p className="text-sm text-grey-50">Ask a super admin to add plans in Dashboard → Subscription plans.</p>
        </div>
      )}

      {!activeSubscription && plans.length > 0 && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
          {plans.map((plan, idx) => (
            <div
              key={plan._id}
              className={`relative flex flex-col bg-dark-10 border rounded-3xl p-8 animate-fade-in-up transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${plan.highlight
                  ? 'border-red-45/50 shadow-lg shadow-red-45/10 bg-gradient-to-b from-dark-10 to-red-45/5'
                  : 'border-dark-25 hover:border-dark-35'
                }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-45 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                {plan.description && <p className="text-grey-60 text-sm h-10">{plan.description}</p>}
              </div>

              <div className="mb-8 flex items-baseline text-white">
                <span className="text-sm font-semibold text-grey-50 mr-1">{plan.currency}</span>
                <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                <span className="text-grey-60 ml-2">/ {plan.validityDays} days</span>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-red-45 mr-3 shrink-0" />
                    <span className="text-grey-70 text-sm leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => openCheckout(plan)}
                className={`w-full py-4 rounded-xl font-bold transition-all duration-200 ${plan.highlight
                    ? 'bg-red-45 hover:bg-red-55 text-white shadow-lg shadow-red-45/20'
                    : 'bg-dark-20 hover:bg-dark-30 text-white'
                  }`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- Checkout Modal --- */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCheckout(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-dark-10 border border-dark-25 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-dark-25 flex items-center justify-between bg-dark-12 shrink-0">
              <h3 className="text-xl font-bold text-white">Complete Checkout</h3>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-grey-60 hover:text-white p-1 rounded-lg hover:bg-dark-20 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Plan Summary */}
              <div className="mb-6 bg-dark-15 border border-dark-25 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-white">{selectedPlan.name} Plan</span>
                  <span className="font-semibold text-white">{selectedPlan.currency} {selectedPlan.price}</span>
                </div>
                <p className="text-sm text-grey-60">Valid for {selectedPlan.validityDays} days</p>

                {/* Promo Applied State */}
                {promoResult && (
                  <div className="mt-4 pt-4 border-t border-dark-25">
                    <div className="flex justify-between items-center text-sm text-green-45 mb-1">
                      <span>Promo Discount ({promoResult.code})</span>
                      <span>-{selectedPlan.currency} {promoResult.discountAmount}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg text-white mt-2">
                      <span>Total Due</span>
                      <span>{selectedPlan.currency} {promoResult.finalPrice}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Promo Code Input */}
              {!promoResult && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-grey-70 mb-2">Have a promo code?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-dark-15 border border-dark-25 rounded-xl px-4 text-white focus:outline-none focus:border-red-45 uppercase"
                      placeholder="ENTER CODE"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={!promoCode || validatingPromo}
                      className="px-4 bg-dark-25 hover:bg-dark-35 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                      {validatingPromo ? '...' : 'Apply'}
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-grey-70 mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-dark-15 border border-dark-25 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-45 appearance-none"
                >
                  <option value="card">Credit / Debit Card</option>
                  <option value="upi">UPI</option>
                  <option value="wallet">Digital Wallet</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              {/* UPI Custom Checkout Flow */}
              {paymentMethod === 'upi' && (
                <div className="mb-6 animate-fade-in-up">
                  {loadingActiveUpi ? (
                    <div className="h-48 bg-dark-15 border border-dark-25 rounded-xl flex items-center justify-center text-grey-60 text-sm">
                      Loading Payment Gateway...
                    </div>
                  ) : activeUpi ? (
                    <div className="bg-dark-15 border border-dark-25 rounded-xl p-4 sm:p-6 text-center shadow-inner">
                      <p className="text-sm font-medium text-white mb-3">Pay with any UPI App</p>
                      <div className="bg-white p-2 rounded-lg inline-block mb-3 shadow-md">
                        <QRCodeSVG 
                          value={`upi://pay?pa=${activeUpi.upiId}&pn=StreamingApp&am=${promoResult?.finalPrice ?? selectedPlan.price}&cu=INR`}
                          size={160}
                          level="H"
                        />
                      </div>
                      <p className="text-sm text-grey-70 flex flex-col items-center justify-center gap-1 mb-2">
                        <span>Or pay to UPI ID:</span>
                        <span className="font-mono text-white text-sm sm:text-base bg-dark-20 px-3 py-1 rounded select-all break-all">{activeUpi.upiId}</span>
                      </p>
                      
                      <div className="text-left mt-6">
                        <label className="block text-sm font-medium text-grey-70 mb-2">Enter 12-Digit UTR Number</label>
                        <input
                          type="text"
                          className="w-full bg-dark-20 border border-dark-35 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-45 transition-colors font-mono tracking-widest text-center"
                          placeholder="e.g. 301982746192"
                          maxLength={12}
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ''))}
                        />
                        <p className="text-[11px] text-grey-50 mt-2 text-center">
                          After successful payment, enter the Reference / UTR number above to activate your plan.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center justify-center text-sm">
                      No Active UPI accounts found. Contact Support.
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="mb-6 animate-fade-in-up">
                  <label className="block text-sm font-medium text-grey-70 mb-2">Transaction ID / UTR</label>
                  <input
                    type="text"
                    className="w-full bg-dark-15 border border-dark-25 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-45"
                    placeholder="Enter 12-digit UTR or Txn ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
              )}

              <button
                onClick={handleSubscribe}
                disabled={subscribing || submittingAudit}
                className="w-full py-4 bg-red-45 hover:bg-red-55 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-45/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {(subscribing || submittingAudit) && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {(subscribing || submittingAudit) ? 'Processing...' : (paymentMethod === 'upi' ? `Submit UTR for ₹${promoResult?.finalPrice ?? selectedPlan.price}` : `Pay ${selectedPlan.currency} ${promoResult?.finalPrice ?? selectedPlan.price}`)}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
