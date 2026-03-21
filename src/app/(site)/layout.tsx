"use client";
import { Suspense } from 'react';
import Header from "../components/Header";
import SiteFooter from '../components/SiteFooter';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="h-14 bg-dark-10" />}>
        <Header />
      </Suspense>
      <main className="flex-grow">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-grey-70">Loading...</div>}>
          {children}
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
