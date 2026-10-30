import type { Metadata, Viewport } from "next";
import "./globals.css";
import { EVENT } from "@/lib/content";

export const metadata: Metadata = {
  title: EVENT.title,
  description: EVENT.subtitle,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: EVENT.title, statusBarStyle: "black-translucent" },
  icons: { apple: "/apple-touch-icon.png" },
  // Next only emits the standard mobile-web-app-capable tag; older iPadOS needs the Apple one
  // to open the Home Screen icon without Safari's URL bar.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#00164E",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/BentonSans-Bold.otf" as="font" type="font/otf" crossOrigin="" />
        <link rel="preload" href="/fonts/BentonSans-Regular.otf" as="font" type="font/otf" crossOrigin="" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
