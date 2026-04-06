import type { Metadata } from "next";
import type { ReactNode } from "react";
import { absoluteUrl } from "../lib/seo";

const canonical = absoluteUrl("/contact");

export const metadata: Metadata = {
  title: { absolute: "Contact Us | Facts Deck" },
  description:
    "Reach Facts Deck for editorial pitches, partnerships, technical help, press, or general questions. Office hours, departments, and contact form.",
  keywords: [
    "Facts Deck contact",
    "contact Facts Deck",
    "editorial pitch",
    "partnerships",
    "financial education support",
  ],
  alternates: { canonical },
  openGraph: {
    title: "Contact Us | Facts Deck",
    description: "Get in touch with Facts Deck—support, editorial, partnerships, and more.",
    url: canonical,
    siteName: "Facts Deck",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Facts Deck",
    description: "Contact Facts Deck for questions, tools help, or collaboration.",
  },
  robots: { index: true, follow: true },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
