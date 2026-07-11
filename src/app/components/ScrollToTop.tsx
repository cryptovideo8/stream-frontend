'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 p-3 rounded-full bg-red-45 text-white shadow-glow-red hover:bg-red-55 hover:-translate-y-1 hover:scale-110 active:scale-95 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0 animate-slide-up' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <ArrowUp size={24} strokeWidth={2.5} className="animate-pulse-glow" />
    </button>
  );
}
