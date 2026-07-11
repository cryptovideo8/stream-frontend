import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./components/Providers";
import PageProgress from "./components/PageProgress";
import ThemedToaster from "./components/ThemedToaster";
import { BRAND } from "./config/brand";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: `${BRAND.name} — ${BRAND.tagline} for high-quality exclusive content.`,
  metadataBase: new URL(BRAND.siteUrl),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: BRAND.logoMark, type: "image/png", sizes: "1024x1024" },
    ],
    shortcut: BRAND.logoMark,
    apple: [{ url: BRAND.appleTouchIcon, sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: `Watch premium content on ${BRAND.name}.`,
    siteName: BRAND.name,
    type: "website",
    url: BRAND.siteUrl,
    images: [{ url: BRAND.ogImage, width: 1200, height: 630, alt: BRAND.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: `Watch premium content on ${BRAND.name}.`,
    images: [BRAND.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-dark-6 text-primary">
        <PageProgress />
        <Providers>
          {children}
          <ThemedToaster />
        </Providers>
      </body>
    </html>
  );
}
