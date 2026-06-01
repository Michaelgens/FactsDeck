"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Mail, Lock, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { loginAdmin } from "../../lib/admin-auth";
import { admin } from "../components/admin-theme";

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
        <div className={`relative overflow-hidden rounded-3xl ${admin.card} shadow-2xl dark:shadow-black/40`}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5 dark:from-violet-500/10 dark:to-transparent" />

          <div className="relative p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 mb-4 shadow-lg shadow-purple-500/25">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className={`font-display text-2xl font-bold mb-2 ${admin.heading}`}>Admin Sign In</h1>
              <p className={`text-sm ${admin.body}`}>Facts Deck · Authorized access only</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${admin.label}`}>
                  Email
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${admin.subtle}`} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="admin@factsdeck.com"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl ${admin.input} ${admin.focus}`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium mb-2 ${admin.label}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${admin.subtle}`} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl ${admin.input} ${admin.focus}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold hover:from-purple-700 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25"
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

            <div className={`mt-6 pt-6 border-t text-center ${admin.divide}`}>
              <Link href="/" className={`inline-flex items-center gap-2 text-sm ${admin.link}`}>
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to site
              </Link>
            </div>
          </div>
        </div>

        <p className={`mt-6 text-center text-xs ${admin.subtle}`}>
          Create an account in Supabase Auth (Email/Password) and add your email to ADMIN_EMAILS in .env to
          access admin.
        </p>
      </div>
    </div>
  );
}
