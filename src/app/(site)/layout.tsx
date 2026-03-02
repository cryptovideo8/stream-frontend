"use client";
import Header from "../components/Header";
import SiteFooter from '../components/SiteFooter';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
