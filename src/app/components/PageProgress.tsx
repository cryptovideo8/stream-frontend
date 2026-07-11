'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function PageProgressContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);
    const timeout = setTimeout(() => {
      setIsNavigating(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-dark-15 overflow-hidden">
      <div className="h-full bg-red-45 animate-progress shadow-[0_0_10px_#E30000]" />
    </div>
  );
}

export default function PageProgress() {
  return (
    <Suspense fallback={null}>
      <PageProgressContent />
    </Suspense>
  );
}
