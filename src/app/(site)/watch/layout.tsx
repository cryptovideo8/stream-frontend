import type { Metadata } from "next";
import { BRAND } from "../../config/brand";

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: `Your premium adult streaming destination on ${BRAND.name}`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-0 overflow-x-hidden overflow-y-auto pt-[calc(7rem+env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)] sm:pt-[calc(7.5rem+env(safe-area-inset-top))]">
      {children}
    </div>
  );
}
