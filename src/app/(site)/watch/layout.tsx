import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NightKing - Premium Streaming Platform",
  description: "Your premium streaming destination for high-quality content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full pt-[120px] overflow-auto">
      {children}
    </div>
  );
}
