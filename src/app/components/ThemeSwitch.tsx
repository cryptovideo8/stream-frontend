'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

/**
 * Binary dark ↔ light switch. No system mode.
 */
export default function ThemeSwitch({ className = '' }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = (resolvedTheme ?? theme ?? 'dark') === 'dark';

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-dark-25 bg-dark-12 text-grey-70 ${className}`}
        disabled
      >
        <span className="h-4 w-4 rounded-full bg-dark-20 animate-pulse" />
      </button>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-dark-25 bg-dark-12 text-grey-70 transition-all duration-200 hover:border-red-45/40 hover:bg-dark-15 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-red-45/50 ${className}`}
    >
      {isDark ? (
        <SunIcon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
      ) : (
        <MoonIcon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
      )}
    </button>
  );
}
