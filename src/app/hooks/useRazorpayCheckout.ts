'use client';

import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { BRAND } from '../config/brand';
import {
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} from '../store/api/subscriptionApi';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (resp: { error?: { description?: string } }) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

type CheckoutUser = { name?: string; email?: string } | null;

type OpenCheckoutArgs = {
  planId: string;
  planName: string;
  promoCode?: string;
  keyId: string;
  user: CheckoutUser;
  onSuccess?: () => void | Promise<void>;
};

export default function useRazorpayCheckout() {
  const [busy, setBusy] = useState(false);
  const [createOrder] = useCreateRazorpayOrderMutation();
  const [verifyPayment] = useVerifyRazorpayPaymentMutation();

  const openCheckout = useCallback(
    async ({ planId, planName, promoCode, keyId, user, onSuccess }: OpenCheckoutArgs) => {
      if (!keyId) {
        toast.error('Online payments are not available right now.');
        return;
      }

      setBusy(true);
      try {
        await loadRazorpayScript();
        const order = await createOrder({ planId, promoCode }).unwrap();

        await new Promise<void>((resolve, reject) => {
          if (!window.Razorpay) {
            reject(new Error('Razorpay SDK failed to load'));
            return;
          }

          const options = {
            key: order.keyId || keyId,
            amount: order.amount,
            currency: order.currency,
            name: BRAND.name,
            description: `${planName || order.planName} subscription`,
            order_id: order.orderId,
            prefill: {
              name: user?.name || '',
              email: user?.email || '',
            },
            theme: { color: '#E30000' },
            handler: async (response: {
              razorpay_order_id: string;
              razorpay_payment_id: string;
              razorpay_signature: string;
            }) => {
              try {
                const result = await verifyPayment({
                  planId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  promoCode,
                }).unwrap();

                if (result.alreadyProcessed) {
                  toast.success('Payment already processed — your plan is active');
                } else {
                  toast.success('Payment successful — plan activated!');
                }
                if (onSuccess) await onSuccess();
                resolve();
              } catch (err: unknown) {
                const error = err as { data?: { message?: string } };
                toast.error(error?.data?.message || 'Payment verification failed');
                reject(err);
              }
            },
            modal: {
              ondismiss: () => resolve(),
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', (resp) => {
            const msg = resp?.error?.description || 'Payment failed';
            toast.error(msg);
            reject(new Error(msg));
          });
          rzp.open();
        });
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        if (error?.data?.message) {
          toast.error(error.data.message);
        } else if (error?.message && !String(error.message).includes('Payment failed')) {
          toast.error(error.message);
        }
      } finally {
        setBusy(false);
      }
    },
    [createOrder, verifyPayment]
  );

  return { openCheckout, busy };
}
