import type { Metadata } from "next";
import "./globals.css";
import Providers from "./components/Providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "NightKing — Premium Streaming",
  description: "NightKing premium streaming platform for high-quality exclusive content.",
  openGraph: {
    title: "NightKing — Premium Streaming",
    description: "Watch premium content on NightKing.",
    siteName: "NightKing",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster position="top-center" reverseOrder={false} />
        </Providers>
      </body>
    </html>
  );
}
