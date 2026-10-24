import type { Metadata, Viewport } from "next";
import { Marcellus, Playfair_Display, Poppins, Smooch_Sans } from "next/font/google";
import "./globals.css";
import "./globals.scss";
import Preloader from "@/components/common/Preloader/Preloader";
import Navbar from "@/components/common/Navbar/Navbar";
import Footer from "@/components/common/Footer";
import MobileBottomNav from "@/components/common/MobileBottomNav";
import PwaInstallPrompt from "@/components/common/PwaInstallPrompt";
import AuthSync from "@/components/common/AuthSync";

const marcellus = Marcellus({
  weight: "400",
  variable: "--font-marcellus",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

const smoochSans = Smooch_Sans({
  variable: "--font-smooch",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Designs Of Dreams",
  description: "Premium heritage fashion and artisanal clothing.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DOD",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#FF6A00",
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
    <html
      lang="en"
      className={`${marcellus.variable} ${playfair.variable} ${poppins.variable} ${smoochSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative" suppressHydrationWarning>
        <AuthSync />
        <Preloader />
        <Navbar />
        {children}
        <Footer />
        <MobileBottomNav />
        <PwaInstallPrompt />
      </body>
    </html>
  );
}