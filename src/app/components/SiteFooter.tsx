'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice';

export default function SiteFooter() {
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer
      className="relative mt-auto"
      style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Red gradient top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, #E30000 30%, #FF5555 50%, #E30000 70%, transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block text-2xl font-black"
              style={{ background: 'linear-gradient(135deg, #E30000, #FF5555)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              NightKing
            </Link>
            <p className="text-grey-60 text-sm leading-relaxed">
              Your premium streaming platform for high-quality content and exclusive features.
            </p>
            <div className="flex items-center gap-4">
              {/* Twitter */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="text-grey-60 hover:text-white transition-all duration-200 hover:scale-110 hover:-translate-y-0.5">
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
                className="text-grey-60 hover:text-white transition-all duration-200 hover:scale-110 hover:-translate-y-0.5">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Browse Videos', href: '/' },
                { label: 'Live Cams', href: '/live' },
                { label: 'Categories', href: '/categories' },
                { label: 'Creators', href: '/creators' },
                // Only render Dashboard link on client (after mount) to avoid hydration mismatch
                ...(mounted && isAuthenticated && user?.role && user.role !== 'viewer'
                  ? [{ label: 'Dashboard', href: '/dashboard' }]
                  : []),
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-grey-60 hover:text-white text-sm transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Cookie Policy', href: '/cookies' },
                { label: 'FAQ', href: '/faq' },
                { label: 'DMCA', href: '/dmca' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-grey-60 hover:text-white text-sm transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support + Newsletter */}
          <div>
            <h3 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Support</h3>
            <ul className="space-y-2.5 mb-6">
              <li>
                <Link href="/contact" className="text-grey-60 hover:text-white text-sm transition-colors duration-200">Contact Us</Link>
              </li>
              <li>
                <a href="mailto:support@nightking.com" className="text-grey-60 hover:text-white text-sm transition-colors duration-200">
                  support@nightking.com
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div>
              <p className="text-white text-xs font-semibold uppercase tracking-widest mb-3">Stay Updated</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 h-9 bg-dark-12 rounded-lg px-3 text-sm text-white placeholder-grey-60 border border-dark-25 focus:outline-none focus:border-red-45/60 transition-all"
                />
                <button className="h-9 px-3 bg-red-45 hover:bg-red-55 text-white text-xs font-semibold rounded-lg transition-all flex-shrink-0">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-grey-60 text-xs" suppressHydrationWarning>
            © {new Date().getFullYear()} NightKing. All rights reserved.
          </p>
          <p className="text-grey-60 text-xs">v1.0.0</p>
        </div>
      </div>
    </footer>
  );
}