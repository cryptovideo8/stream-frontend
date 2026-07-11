'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'xp_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(COOKIE_CONSENT_KEY);
      setVisible(!v);
    } catch {
      setVisible(true);
    }
  }, []);

  const save = (value: 'essential' | 'all') => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, value);
      document.cookie = `${COOKIE_CONSENT_KEY}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-[99990] px-4 md:bottom-6 md:left-6 md:right-auto md:max-w-md">
      <div className="rounded-2xl border border-dark-25 bg-dark-10/95 p-4 shadow-card-hover backdrop-blur-md">
        <p className="mb-3 text-sm text-grey-70">
          We use essential cookies to keep you signed in and protect the service. Optional analytics
          cookies help us improve {''}
          <Link href="/cookies" className="text-red-45 hover:underline">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => save('essential')}
            className="rounded-lg border border-dark-25 px-3 py-2 text-xs font-medium text-grey-70 hover:text-primary"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => save('all')}
            className="rounded-lg bg-red-45 px-3 py-2 text-xs font-bold text-white hover:bg-red-55"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
