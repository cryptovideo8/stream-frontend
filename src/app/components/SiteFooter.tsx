'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice';
import BrandLogo from './BrandLogo';
import { BRAND } from '../config/brand';

export default function SiteFooter() {
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="theme-shell relative mt-auto border-t">
      {/* Red gradient top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, #E30000 30%, #FF5555 50%, #E30000 70%, transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {/* Brand */}
          <div className="space-y-4 col-span-2 sm:col-span-2 md:col-span-1">
            <BrandLogo variant="mark-text" markClassName="h-9 w-9" />
            <p className="text-grey-60 text-sm leading-relaxed">
              {BRAND.tagline} for high-quality exclusive content — available where adult entertainment is legal.
            </p>
            <div className="flex items-center gap-4">
              {/* Twitter */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="text-grey-60 hover:text-primary transition-all duration-200 hover:scale-110 hover:-translate-y-0.5">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              {/* Discord */}
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer"
                className="text-grey-60 hover:text-[#5865F2] transition-all duration-200 hover:scale-110 hover:-translate-y-0.5">
                <span className="sr-only">Discord</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 00-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 00-5.487 0 12.36 12.36 0 00-.617-1.23A.077.077 0 008.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 00-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 00.031.055 20.03 20.03 0 005.993 2.98.078.078 0 00.084-.026 13.83 13.83 0 001.226-1.963.074.074 0 00-.041-.104 13.201 13.201 0 01-1.872-.878.075.075 0 01-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 01.078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 01.079.009c.12.098.245.195.372.288a.075.075 0 01-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 00-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 00.084.028 19.963 19.963 0 006.002-2.981.076.076 0 00.032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 00-.031-.028z" />
                </svg>
              </a>
              {/* GitHub */}
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="text-grey-60 hover:text-primary transition-all duration-200 hover:scale-110 hover:-translate-y-0.5">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              {/* Telegram */}
              <a href="https://telegram.org" target="_blank" rel="noopener noreferrer"
                className="text-grey-60 hover:text-[#0088cc] transition-all duration-200 hover:scale-110 hover:-translate-y-0.5">
                <span className="sr-only">Telegram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Browse Videos', href: '/' },
                { label: 'Categories', href: '/categories' },
                { label: 'Subscriptions', href: '/subscriptions' },
                // Only render Dashboard link on client (after mount) to avoid hydration mismatch
                ...(mounted && isAuthenticated && user?.role && user.role !== 'viewer'
                  ? [{ label: 'Dashboard', href: '/dashboard' }]
                  : []),
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-grey-60 hover:text-primary text-sm transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Cookie Policy', href: '/cookies' },
                { label: 'FAQ', href: '/faq' },
                { label: 'DMCA', href: '/dmca' },
                { label: '2257 Statement', href: '/2257' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-grey-60 hover:text-primary text-sm transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <h3 className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">Support</h3>
            <ul className="space-y-2.5 mb-6">
              <li>
                <Link href="/support" className="text-grey-60 hover:text-primary text-sm transition-colors duration-200">Support Center</Link>
              </li>
              <li>
                <Link href="/support" className="text-grey-60 hover:text-primary text-sm transition-colors duration-200">Create a Ticket</Link>
              </li>
              <li>
                <a href={`mailto:${BRAND.supportEmail}`} className="text-grey-60 hover:text-primary text-sm transition-colors duration-200">
                  {BRAND.supportEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t theme-hairline">
          <div className="flex items-center gap-3">
            <p className="text-grey-60 text-xs">
              © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
            </p>
            <span className="px-2 py-0.5 border border-red-45/50 text-red-45 text-[10px] font-bold rounded uppercase tracking-wider hidden sm:inline-block">18+ Adults Only</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 border border-red-45/50 text-red-45 text-[10px] font-bold rounded uppercase tracking-wider sm:hidden">18+ Adults Only</span>
            <p className="text-grey-60 text-xs">v1.0.0</p>
          </div>
        </div>
      </div>
    </footer>
  );
}