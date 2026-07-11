'use client';

import { useTheme } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme !== 'light';

  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        style: {
          background: isDark ? '#1A1A1A' : '#FFFFFF',
          color: isDark ? '#FFFFFF' : '#111113',
          border: isDark ? '1px solid #333' : '1px solid #E4E4E7',
        },
        success: {
          iconTheme: { primary: '#E30000', secondary: '#FFFFFF' },
        },
      }}
    />
  );
}
