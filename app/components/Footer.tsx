"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  CheckCircle,
  Zap,
  Loader2,
  Wrench,
  Shield,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { siteTools } from "../lib/site-config";
import { pickDailyTools } from "../lib/tools-utils";
import { subscribeEmail } from "../lib/subscriber-actions";

const companyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Careers", href: "/careers" },
  { name: "Contact", href: "/contact" },
  { name: "Disclaimer", href: "/disclaimer" },
  { name: "Privacy Policy", href: "/privacy" },
];

const trustBadges = [
  { icon: Shield, label: "Editor-reviewed" },
  { icon: TrendingUp, label: "Data-backed" },
  { icon: BookOpen, label: "Expert-written" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const footerTools = useMemo(() => pickDailyTools(siteTools, 3, "nav-tools-spotlight"), []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const res = await subscribeEmail(email);
    if (res.ok) {
      setStatus("success");
      setEmail("");
      setMessage("Thanks! You're subscribed.");
    } else {
      setStatus("error");
      setMessage(res.error ?? "Something went wrong. Try again.");
    }
  };

  return (
    <footer className="relative border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {!isAdmin && (
        <section
          id="newsletter"
          className="border-b border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/35 dark:text-zinc-100"
          aria-label="Newsletter signup"
        >
          <div className="mx-auto max-w-6xl px-4 pb-9 pt-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-cyan-300">
                    <Mail className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-orange-800/80 dark:text-cyan-400/90">
                      WEEKLY NEWSLETTER
                    </p>
                    <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                      <span className="text-orange-600 dark:text-cyan-400">Weekly finance notes,</span>{" "}
                      <span className="text-blue-800 dark:text-emerald-300">without the Hype</span>
                    </h2>
                  </div>
                </div>

                <p className="mt-4 max-w-xl leading-relaxed text-zinc-600 dark:text-zinc-300">
                  A short, editorial brief: what changed, what matters, and practical ideas you can use. No spam. Ever.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-blue-600 dark:text-emerald-400" />
                    Unsubscribe anytime
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-orange-600 dark:text-cyan-400" />
                    No tracking pixels
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-blue-600 dark:text-emerald-400" />
                    Free
                  </span>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row">
                    <label className="sr-only" htmlFor="newsletter-email">
                      Email
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      disabled={status === "loading"}
                      required
                      className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:opacity-70 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/25"
                      autoComplete="email"
                      inputMode="email"
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:opacity-70 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                      {status === "loading" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      {status === "loading" ? "Subscribing…" : "Subscribe"}
                    </button>
                  </form>

                  <div className="mt-3 min-h-[1.25rem]">
                    {message ? (
                      <p
                        className={`text-sm ${
                          status === "success"
                            ? "text-blue-800 dark:text-emerald-300"
                            : "text-red-600 dark:text-red-400"
                        }`}
                        role="status"
                        aria-live="polite"
                      >
                        {message}
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        By subscribing, you agree to receive emails from Facts Deck. No spam—unsubscribe in one click.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-5 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              {trustBadges.map(({ icon: Icon, label }, idx) =>
                Icon && label && Icon.name !== "undefined" ? (
                  <div
                    key={label ?? idx}
                    className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-100"
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        idx % 2 === 0 ? "text-blue-600 dark:text-emerald-400" : "text-orange-600 dark:text-cyan-400"
                      }`}
                    />
                    <span>{label}</span>
                  </div>
                ) : null
              )}
              <div className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-100">
                <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500 dark:bg-cyan-400" />
                <span>Updated daily</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl border-t border-zinc-200 px-4 py-12 dark:border-zinc-800 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="rounded-lg flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Facts Deck Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight">
                <span className="text-blue-700 dark:text-emerald-400">Facts</span>{" "}
                <span className="text-orange-600 dark:text-cyan-400">Deck</span>
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
              Your trusted source for finance knowledge, investment insights, and
              banking expertise. Empowering smart financial decisions through
              education.
            </p>
            <div className="flex space-x-2">
              <a
                href="#"
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-orange-50 hover:text-blue-700 dark:text-zinc-500 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-orange-50 hover:text-blue-700 dark:text-zinc-500 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-orange-50 hover:text-blue-700 dark:text-zinc-500 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-orange-50 hover:text-blue-700 dark:text-zinc-500 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-6">
              Tools
            </h3>
            <ul className="space-y-3">
              {/* For the pointer/indicator effect, we wrap each <li> with a group, and prepend an animated/appearing icon on hover */}
              <li className="group flex items-center">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {/* Simple creative pointer icon (arrow/caret) */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-orange-600 dark:text-cyan-400"
                  >
                    <path d="M4 8l6 0M10 8l-2.5 -2.5M10 8l-2.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <Link
                  href="/tools"
                  className="inline-block text-sm text-zinc-600 transition-colors hover:translate-x-1 hover:text-blue-800 dark:text-zinc-300 dark:hover:text-cyan-300"
                >
                  All Tools & Calculators
                </Link>
              </li>
              {footerTools.map((tool) => (
                <li key={tool.slug} className="group flex items-center">
                  <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-orange-600 dark:text-cyan-400"
                    >
                      <path d="M4 8l6 0M10 8l-2.5 -2.5M10 8l-2.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="inline-block text-sm text-zinc-600 transition-colors hover:translate-x-1 hover:text-blue-800 dark:text-zinc-300 dark:hover:text-cyan-300"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-6">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name} className="group flex items-center">
                  {/* Creative animated indicator – a little gem/star shines on hover */}
                  <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:scale-110">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-orange-600 dark:text-cyan-400"
                    >
                      <path d="M4 8l6 0M10 8l-2.5 -2.5M10 8l-2.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <Link
                    href={link.href}
                    className="inline-block text-sm text-zinc-600 transition-colors hover:translate-x-1 hover:text-blue-800 dark:text-zinc-300 dark:hover:text-cyan-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-6">
              Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 shrink-0 text-blue-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Email us</p>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium">
                    contact@factsdeck.com
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 shrink-0 text-orange-600 dark:text-cyan-400" />
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Call us</p>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 shrink-0 text-blue-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Visit us</p>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium">New York, NY</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t border-zinc-200 pt-8 dark:border-zinc-800 md:flex-row">
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400 md:mb-0">
            © 2026 Facts Deck. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              href="/disclaimer"
              className="text-sm text-zinc-500 transition-colors hover:text-blue-800 dark:text-zinc-400 dark:hover:text-cyan-300"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-zinc-500 transition-colors hover:text-blue-800 dark:text-zinc-400 dark:hover:text-cyan-300"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
