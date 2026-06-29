import type { Metadata } from "next";
import type { ReactNode } from "react";
import { absoluteUrl } from "../lib/seo";

const canonical = absoluteUrl("/unsubscribe");

export const metadata: Metadata = {
  title: { absolute: "Unsubscribe | Facts Deck" },
  description: "Manage your Facts Deck newsletter subscription and opt out of email updates.",
  alternates: { canonical },
  robots: { index: false, follow: false },
};

export default function UnsubscribeLayout({ children }: { children: ReactNode }) {
  return children;
}
