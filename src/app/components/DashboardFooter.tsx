'use client';

export default function DashboardFooter() {
  return (
    <footer className="bg-dark-6 border-t border-dark-20 py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <div className="text-sm text-grey-70">
          © {new Date().getFullYear()} RahulVibs. All rights reserved.
        </div>
        <div className="flex items-center space-x-4">
          <a href="/terms" className="text-sm text-grey-70 hover:text-primary transition-colors">
            Terms
          </a>
          <a href="/privacy" className="text-sm text-grey-70 hover:text-primary transition-colors">
            Privacy
          </a>
          <a href="/contact" className="text-sm text-grey-70 hover:text-primary transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
} 