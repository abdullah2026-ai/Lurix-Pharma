import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { APP_CONFIG } from "@/lib/constants";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { PwaInstaller } from "@/components/pwa/PwaInstaller";

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} — Modern Pharmacy Management System`,
  description: APP_CONFIG.description,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_CONFIG.name,
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C382E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-[#F2F5F3] text-gray-900 antialiased selection:bg-brand-200 selection:text-brand-900">
        <OfflineIndicator />
        {children}
        <PwaInstaller />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
