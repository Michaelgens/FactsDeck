import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SITE_URL } from "./lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Facts Deck | Your Financial Knowledge Hub",
    template: "%s | Facts Deck",
  },
  description:
    "Master investing, banking, and personal finance with expert insights, comprehensive guides, and powerful comparison tools.",
  keywords: ["personal finance", "investing", "banking", "financial literacy", "money management", "investment guides"],
  authors: [{ name: "Facts Deck", url: SITE_URL }],
  creator: "Facts Deck",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Facts Deck",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Facts Deck | Your Financial Knowledge Hub",
    description: "Master investing, banking, and personal finance with expert insights.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-900 dark:bg-gradient-to-br dark:from-dark-950 dark:via-dark-900 dark:to-dark-850 dark:text-dark-100`}
      >
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
