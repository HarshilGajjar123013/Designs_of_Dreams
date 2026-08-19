import type { Metadata } from "next";
import { Marcellus, Poppins, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Designs of Dreams — Atelier Admin Panel",
  description: "Executive management command center for the Designs of Dreams luxury fashion marketplace.",
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
        {children}
      </body>
    </html>
  );
}
