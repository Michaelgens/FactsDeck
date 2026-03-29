"use client";

import { useState } from "react";
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
} from "lucide-react";
import { subscribeEmail } from "../lib/subscriber-actions";

const companyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Careers", href: "/careers" },
  { name: "Contact", href: "/contact" },
  { name: "Disclaimer", href: "/disclaimer" },
  { name: "Privacy Policy", href: "/privacy" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

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
    <footer className="bg-white dark:bg-dark-950 border-t border-slate-200 dark:border-purple-500/30">
      {!isAdmin && (
      <div id='newsletter' className="bg-gradient-to-br from-purple-600 via-purple-700 to-amber-800 dark:bg-gradient-to-br dark:from-dark-900 dark:via-purple-900/40 dark:to-dark-850 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-400/20 dark:bg-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 dark:bg-accent-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="glass-effect rounded-full p-6 w-20 h-20 mx-auto mb-6 shadow-2xl">
            <Mail className="h-8 w-8 mx-auto" />
          </div>
          
          <h2 className="font-display text-3xl lg:text-5xl font-bold mb-4 text-balance">
            Join <span className="gradient-text">500K+</span> Finance Enthusiasts
          </h2>
          
          <p className="text-lg text-purple-100 dark:text-purple-200 mb-8 leading-relaxed max-w-2xl mx-auto">
            Get weekly insights, market updates, and exclusive finance tips delivered straight to your inbox.
          </p>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row max-w-lg mx-auto gap-4 mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              disabled={status === "loading"}
              required
              className="flex-1 px-6 py-4 rounded-2xl text-slate-900 dark:text-dark-900 placeholder-slate-500 dark:placeholder-dark-400 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-500/50 shadow-xl border-2 border-white/30 dark:border-white/20 bg-white dark:bg-white/95 disabled:opacity-70"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-white text-purple-600 dark:text-purple-700 px-8 py-4 rounded-2xl font-bold hover:bg-purple-50 dark:hover:bg-emerald-900/30 transition-all duration-300 whitespace-nowrap shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 disabled:opacity-70 disabled:transform-none disabled:hover:scale-100"
            >
              {status === "loading" ? (
                <Loader2 className="inline h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Zap className="inline h-5 w-5 mr-2" />
              )}
              Subscribe Now
            </button>
          </form>
          {message && (
            <p className={`text-sm mb-4 ${status === "success" ? "text-emerald-300" : "text-amber-200"}`}>
              {message}
            </p>
          )}
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-purple-200 dark:text-purple-300">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">No spam, ever</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">Unsubscribe anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">100% free</span>
            </div>
          </div>
        </div>
      </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200 dark:border-purple-500/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-purple-600 to-amber-600 dark:from-purple-600 dark:via-amber-600 dark:to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">FD</span>
              </div>
              <span className="font-display font-bold text-2xl text-slate-900 dark:text-white dark:bg-gradient-to-r dark:from-white dark:to-purple-200 dark:bg-clip-text dark:text-transparent">
                Facts Deck
              </span>
            </div>
            <p className="text-slate-600 dark:text-dark-300 mb-6 leading-relaxed">
              Your trusted source for finance knowledge, investment insights, and
              banking expertise. Empowering smart financial decisions through
              education.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-slate-400 dark:text-dark-400 hover:text-purple-600 dark:hover:text-emerald-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-slate-400 dark:text-dark-400 hover:text-purple-600 dark:hover:text-emerald-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-slate-400 dark:text-dark-400 hover:text-purple-600 dark:hover:text-emerald-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-slate-400 dark:text-dark-400 hover:text-purple-600 dark:hover:text-emerald-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div className="md:col-span-1">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-dark-100 mb-6">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-600 dark:text-dark-300 hover:text-purple-600 dark:hover:text-emerald-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-1">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-dark-100 mb-6">
              Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-dark-400">Email us</p>
                  <p className="text-slate-900 dark:text-dark-100 font-medium">
                    contact@factsdeck.com
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-dark-400">Call us</p>
                  <p className="text-slate-900 dark:text-dark-100 font-medium">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-dark-400">Visit us</p>
                  <p className="text-slate-900 dark:text-dark-100 font-medium">New York, NY</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 mt-8 border-t border-slate-200 dark:border-purple-500/30">
          <p className="text-slate-500 dark:text-dark-400 text-sm mb-4 md:mb-0">
            © 2026 Facts Deck. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              href="/disclaimer"
              className="text-slate-500 dark:text-dark-400 hover:text-purple-600 dark:hover:text-emerald-400 text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-slate-500 dark:text-dark-400 hover:text-purple-600 dark:hover:text-emerald-400 text-sm transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
