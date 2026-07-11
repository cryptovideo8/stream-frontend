'use client';

import Link from 'next/link';
import { BRAND } from '../config/brand';

type BrandLogoProps = {
  href?: string;
  variant?: 'mark' | 'wordmark' | 'mark-text';
  className?: string;
  markClassName?: string;
  priority?: boolean;
};

export default function BrandLogo({
  href = '/',
  variant = 'mark-text',
  className = '',
  markClassName = 'h-8 w-8',
  priority = false,
}: BrandLogoProps) {
  const content =
    variant === 'wordmark' ? (
      <img
        src={BRAND.logoWordmark}
        alt={BRAND.name}
        className={`h-8 w-auto object-contain ${className}`}
        loading={priority ? 'eager' : 'lazy'}
      />
    ) : variant === 'mark' ? (
      <img
        src={BRAND.logoMark}
        alt={BRAND.name}
        className={`object-contain rounded-lg ${markClassName} ${className}`}
        loading={priority ? 'eager' : 'lazy'}
      />
    ) : (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <img
          src={BRAND.logoMark}
          alt=""
          className={`object-contain rounded-lg ${markClassName}`}
          loading={priority ? 'eager' : 'lazy'}
        />
        <span
          className="text-xl font-black tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #E30000, #FF5555)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {BRAND.name}
        </span>
      </span>
    );

  return (
    <Link
      href={href}
      className="flex-shrink-0 inline-flex items-center transition-opacity hover:opacity-90"
      aria-label={BRAND.name}
    >
      {content}
    </Link>
  );
}
