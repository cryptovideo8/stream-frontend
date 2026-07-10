'use client';
import Link from 'next/link';

export default function DashboardFooter() {
  return (
    <footer className="bg-dark-6 border-t border-dark-20 py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <div className="text-sm text-grey-70">
          © {new Date().getFullYear()} NightKing. All rights reserved.
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/terms" className="text-sm text-grey-70 hover:text-primary transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="text-sm text-grey-70 hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link href="/support" className="text-sm text-grey-70 hover:text-primary transition-colors">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
} 