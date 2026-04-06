"use client";

import { useState, useCallback, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Home,
  Loader2,
  Mail,
  PiggyBank,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { computeJourneyMetrics, formatMoney } from "./compute-journey-metrics";
import type { MortgageJourneyAnswers } from "./mortgage-journey-types";
import { FACTS_DECK_MORTGAGE_TEST } from "./mortgage-journey-types";

type Props = {
  answers: MortgageJourneyAnswers;
  onOpenDashboard: () => void;
  onStartOver: () => void;
};

const GOAL_LABEL: Record<MortgageJourneyAnswers["goal"], string> = {
  buying: "Buying",
  refinancing: "Refinancing",
  exploring: "Exploring",
};

export default function MortgageJourneyResults({ answers, onOpenDashboard, onStartOver }: Props) {
  const m = computeJourneyMetrics(answers);
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const sendEmail = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setNote(null);
      if (hp.trim()) return;
      const trimmed = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setNote({ kind: "err", text: "Enter a valid email address." });
        return;
      }
      setSending(true);
      try {
        const res = await fetch("/api/tools/mortgage-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: trimmed,
            website: hp,
            summary: m.summary,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          setNote({ kind: "err", text: data.error ?? "Could not send. Try again later." });
          return;
        }
        setNote({ kind: "ok", text: "Sent. Check your inbox (and spam) for your summary." });
      } catch {
        setNote({ kind: "err", text: "Network error. Try again." });
      } finally {
        setSending(false);
      }
    },
    [email, hp, m.summary]
  );

  const principalPct =
    m.year1Principal + m.year1Interest > 0
      ? (m.year1Principal / (m.year1Principal + m.year1Interest)) * 100
      : 50;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-emerald-500/[0.07] blur-3xl dark:bg-emerald-400/[0.08]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white w-fit"
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              Retake {FACTS_DECK_MORTGAGE_TEST}
            </button>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 w-fit sm:ml-auto"
            >
              <Home className="h-4 w-4 shrink-0" />
              All tools
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span className="leading-snug">{FACTS_DECK_MORTGAGE_TEST} · Results</span>
            </span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Goal: {GOAL_LABEL[answers.goal]}
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-balance max-w-3xl">
            Here’s what your numbers suggest
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
            Educational estimate using sample taxes & insurance — open the full calculator to dial in every line item.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        {/* Hero metric */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Estimated first-month payment (PITI)
          </p>
          <p className="mt-2 font-display text-5xl sm:text-6xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
            {formatMoney(m.pitiFirstMonth)}
            <span className="text-lg sm:text-xl font-semibold text-zinc-500 dark:text-zinc-400">/mo</span>
          </p>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 p-5 border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Principal & interest</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{formatMoney(m.pi)}</p>
            </div>
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 p-5 border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Loan amount</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{formatMoney(m.loanAmount)}</p>
            </div>
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 p-5 border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Payoff timeline</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{m.payoffMonths} mo</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Year 1 split */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
              <h2 className="font-display text-xl font-bold">First year: principal vs interest</h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Early payments skew toward interest — extra principal shifts this over time.
            </p>
            <div className="h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex">
              <div
                className="h-full bg-zinc-800 dark:bg-zinc-200 transition-all duration-500"
                style={{ width: `${principalPct}%` }}
              />
              <div className="flex-1 bg-zinc-400/50 dark:bg-zinc-600" />
            </div>
            <div className="flex justify-between mt-3 text-sm font-medium">
              <span className="text-zinc-700 dark:text-zinc-200">Principal {principalPct.toFixed(0)}%</span>
              <span className="text-zinc-500">Interest {(100 - principalPct).toFixed(0)}%</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Year 1 principal</p>
                <p className="font-bold tabular-nums">{formatMoney(m.year1Principal)}</p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Year 1 interest</p>
                <p className="font-bold tabular-nums">{formatMoney(m.year1Interest)}</p>
              </div>
            </div>
          </div>

          {/* Affordability */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-4">
              <PiggyBank className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
              <h2 className="font-display text-xl font-bold">Affordability snapshot</h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">{m.dtiMessage}</p>
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-zinc-500">Housing / income</span>
                <span className="text-2xl font-bold tabular-nums">{m.housingDtiPct.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-zinc-800 dark:bg-zinc-200 max-w-full"
                  style={{ width: `${Math.min(100, m.housingDtiPct)}%` }}
                />
              </div>
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950/80 p-4 border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-semibold uppercase text-zinc-500">Rough max loan at this DTI setup</p>
                <p className="text-lg font-bold tabular-nums mt-1">{formatMoney(m.maxAffordLoan)}</p>
                <p className="text-xs text-zinc-500 mt-2">
                  Implied max home ~ {formatMoney(m.maxAffordHome)} at {answers.downPercent}% down (illustrative).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Totals strip */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total interest (full term)", value: formatMoney(m.totalInterest) },
            { label: "Est. total PMI", value: m.needsPmi ? formatMoney(m.totalPmi) : "—" },
            { label: "LTV", value: `${m.ltv.toFixed(1)}%` },
            { label: "PMI / mo (if applicable)", value: m.needsPmi ? formatMoney(m.pmiMonthly) : "—" },
          ].map((row) => (
            <div
              key={row.label}
              className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/30"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{row.label}</p>
              <p className="mt-2 text-lg font-bold tabular-nums">{row.value}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border-2 border-zinc-900 bg-zinc-900 p-8 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-6 w-6" />
              <h2 className="font-display text-xl font-bold">Full mortgage workspace</h2>
            </div>
            <p className="text-sm opacity-90 leading-relaxed mb-6">
              Amortization schedules, refinance break-even, bi-weekly vs monthly, CSV export, and walk-through — same tool,
              every knob exposed.
            </p>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-3.5 rounded-2xl bg-white text-zinc-900 text-sm font-bold hover:bg-zinc-100 transition-colors dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Open calculator dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-6 w-6 text-zinc-700 dark:text-zinc-200" />
              <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50">Email this summary</h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              We’ll send the same structured snapshot used in the full calculator email.
            </p>
            <form onSubmit={sendEmail} className="space-y-3">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={sending}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <input type="text" name="website" tabIndex={-1} className="hidden" value={hp} onChange={(e) => setHp(e.target.value)} />
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Send summary
              </button>
              {note && (
                <p role="status" className={`text-sm ${note.kind === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {note.text}
                </p>
              )}
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed pb-8">
          Educational estimates only — not financial advice. Taxes, insurance, and PMI vary by location and lender.
        </p>
      </div>
    </div>
  );
}
