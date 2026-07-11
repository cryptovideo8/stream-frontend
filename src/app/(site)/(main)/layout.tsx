"use client";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import MobileBottomNav from "../../components/MobileBottomNav";
import ScrollToTop from "../../components/ScrollToTop";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-dark-10 text-primary hover:bg-dark-15"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Main Content Area */}
      <div className="w-full pt-[120px] overflow-auto">
        <div className="flex">
          {/* Sidebar - Hidden on mobile by default, visible on md and up */}
          <div className={`
            fixed md:static inset-y-0 left-0 z-40
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <Sidebar />
          </div>

          {/* Overlay for mobile - Only visible when mobile menu is open */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 min-h-full w-full pb-safe-nav md:pb-0">{children}</div>
        </div>
      </div>
      
      <MobileBottomNav />
      <ScrollToTop />
    </>
  );
}