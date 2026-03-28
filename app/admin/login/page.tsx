"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Mail, Lock, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { loginAdmin } from "../../lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginAdmin(email, password);
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(res.error ?? "Login failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-dark-900/80 shadow-2xl border border-slate-200 dark:border-purple-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-amber-500/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />

          <div className="relative p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-amber-600 mb-4 shadow-lg shadow-purple-500/25">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Admin Sign In
              </h1>
              <p className="text-slate-600 dark:text-purple-300 text-sm">
                Facts Deck · Authorized access only
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-purple-200 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-purple-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="admin@factsdeck.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-850 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 dark:text-purple-200 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-purple-500" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-850 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 text-white font-bold hover:from-purple-700 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-purple-500/20 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to site
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-purple-500">
          Create an account in Supabase Auth (Email/Password) and add your email to ADMIN_EMAILS in .env to access admin.
        </p>
      </div>
    </div>
  );
}
