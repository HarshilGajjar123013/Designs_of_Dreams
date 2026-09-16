import type { Metadata, Viewport } from "next";
import { Marcellus, Poppins, Inter } from "next/font/google";
import PWAStatusProvider from "../components/common/PWAStatusProvider";
import PwaInstallPrompt, { PWAInstallProvider } from "../components/common/PwaInstallPrompt";
import "./globals.css";

const marcellus = Marcellus({
  weight: "400",
  variable: "--font-marcellus",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#C5A059",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Designs of Dreams — Atelier Admin Panel",
  description: "Executive management command center for the Designs of Dreams luxury fashion marketplace.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DOD Admin",
  },
  icons: {
    icon: [
      { url: "/logo.png" },
      { url: "/favicon.ico" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${marcellus.variable} ${poppins.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#1A1A1A]" suppressHydrationWarning>
        <PWAStatusProvider>
          <PWAInstallProvider>
            {children}
            <PwaInstallPrompt />
          </PWAInstallProvider>
        </PWAStatusProvider>
      </body>
    </html>
  );
}
