'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BRAND } from '../config/brand';

const AGE_GATE_KEY = 'xp_age_verified_18';

export default function AgeGate() {
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    try {
      const ok = localStorage.getItem(AGE_GATE_KEY) === '1';
      if (ok) {
        document.cookie = `${AGE_GATE_KEY}=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      }
      setBlocked(!ok);
    } catch {
      setBlocked(true);
    }
    setReady(true);
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(AGE_GATE_KEY, '1');
      document.cookie = `${AGE_GATE_KEY}=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    } catch {
      /* ignore */
    }
    setBlocked(false);
  };

  const leave = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!ready || !blocked) return null;

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-dark-10 p-8 text-center shadow-2xl">
        <img
          src={BRAND.logoMark}
          alt=""
          className="mx-auto mb-4 h-16 w-16 rounded-xl object-contain"
        />
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-red-45">Adults only</p>
        <h1 id="age-gate-title" className="mb-3 text-2xl font-black text-white">
          Are you 18 or older?
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-grey-60">
          {BRAND.name} contains adult sexual content. By entering, you confirm you are at least 18 years
          old (or the age of majority where you live) and that viewing adult content is legal in your
          jurisdiction.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={accept}
            className="rounded-xl bg-red-45 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-55"
          >
            I am 18+ — Enter
          </button>
          <button
            type="button"
            onClick={leave}
            className="rounded-xl border border-dark-25 bg-dark-15 px-6 py-3 text-sm font-medium text-grey-70 transition hover:border-dark-30 hover:text-white"
          >
            Exit
          </button>
        </div>
        <p className="mt-6 text-[11px] text-grey-60">
          By entering you also agree to our{' '}
          <Link href="/terms" className="text-red-45 hover:underline" onClick={accept}>
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-red-45 hover:underline" onClick={accept}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
