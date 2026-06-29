"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BellOff, CheckCircle, Loader2, Mail, ShieldCheck } from "lucide-react";
import { unsubscribeEmail } from "../lib/subscriber-actions";

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/25 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/25";

type Props = {
  initialEmail?: string;
};

export default function UnsubscribeForm({ initialEmail = "" }: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"removed" | "not_found" | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await unsubscribeEmail(email);
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setDone(res.status);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[4rem_4rem] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[42rem] w-[min(90rem,200%)] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-200/35 via-orange-100/15 to-transparent blur-3xl dark:from-emerald-950/50 dark:via-blue-950/30 dark:to-transparent"
        aria-hidden
      />

      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-orange-50 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Back to home
          </Link>

          <p className="mt-10 text-xs font-semibold tracking-widest text-orange-800/80 dark:text-cyan-400/90">
            NEWSLETTER
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-balance sm:text-5xl">
            <span className="bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 bg-clip-text text-transparent dark:from-emerald-300 dark:via-cyan-300 dark:to-sky-300">
              Unsubscribe
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
            Opt out of Facts Deck newsletter emails. You&apos;ll stop receiving briefs and updates — our articles and tools
            stay free on the site.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-950">
          {done ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200/90 bg-emerald-50 text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-300">
                <CheckCircle className="h-7 w-7" aria-hidden />
              </div>
              <h2 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {done === "removed" ? "You're unsubscribed" : "You're all set"}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {done === "removed"
                  ? "We've removed your email from our newsletter list. You won't receive further Facts Deck emails."
                  : "That address wasn't on our newsletter list, so there's nothing to remove. You won't receive mail from us."}
              </p>
              <Link
                href="/"
                className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
              >
                Continue to Facts Deck
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <BellOff className="mt-0.5 h-5 w-5 shrink-0 text-blue-700 dark:text-emerald-400" aria-hidden />
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  Confirm the email address you used to subscribe. This only affects newsletter mail — not your ability to
                  read Facts Deck on the web.
                </p>
              </div>

              <div>
                <label htmlFor="unsubscribe-email" className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
                    aria-hidden
                  />
                  <input
                    id="unsubscribe-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    inputMode="email"
                    className={`${inputClass} pl-10`}
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              {error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:shadow-white/5 dark:hover:bg-zinc-100 sm:w-auto sm:px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    Processing…
                  </>
                ) : (
                  "Confirm unsubscribe"
                )}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700 dark:text-emerald-400" aria-hidden />
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Changed your mind?{" "}
            <Link href="/" className="font-medium text-blue-800 underline-offset-4 hover:underline dark:text-cyan-300">
              Return to Facts Deck
            </Link>{" "}
            and subscribe again anytime from the footer. See our{" "}
            <Link href="/privacy" className="font-medium text-blue-800 underline-offset-4 hover:underline dark:text-cyan-300">
              Privacy Policy
            </Link>{" "}
            for how we handle your data.
          </p>
        </div>
      </div>
    </div>
  );
}
