"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Check,
  Copy,
  Home,
  PiggyBank,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  buildMortgageTextSummary,
  computeJourneyMetrics,
  computeMortgageReadinessScore,
  formatMoney,
  suggestRelatedTools,
} from "./compute-journey-metrics";
import type { MortgageJourneyAnswers } from "./mortgage-journey-types";
import { FACTS_DECK_MORTGAGE_TEST } from "./mortgage-journey-types";
import MortgagePaymentChart from "./MortgagePaymentChart";
import MortgageRelatedTools from "./MortgageRelatedTools";
import { MORTGAGE_SLUG, trackToolEvent } from "../../../lib/tool-analytics-client";

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
  const readinessScore = computeMortgageReadinessScore(m, answers);
  const relatedTools = suggestRelatedTools(answers.goal, m);
  const [copied, setCopied] = useState(false);

  const copySummary = useCallback(async () => {
    const text = buildMortgageTextSummary(answers, m);
    try {
      await navigator.clipboard.writeText(text);
      trackToolEvent(MORTGAGE_SLUG, "export_text");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [answers, m]);

  const principalPct =
    m.year1Principal + m.year1Interest > 0
      ? (m.year1Principal / (m.year1Principal + m.year1Interest)) * 100
      : 50;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[4rem_4rem] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[42rem] w-[min(90rem,200%)] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-200/35 via-orange-100/15 to-transparent blur-3xl dark:from-emerald-950/50 dark:via-blue-950/30 dark:to-transparent"
        aria-hidden
      />

      <div className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={onStartOver}
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white w-fit"
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
              Focus: {GOAL_LABEL[answers.goal]}
            </span>
          </div>
          <h1 className="font-display text-[1.7rem] leading-tight sm:text-5xl font-bold text-balance max-w-3xl">
            Here&apos;s what your numbers suggest
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
            Educational estimate using sample taxes & insurance — open the full calculator to dial in every line item.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8 sm:space-y-10 pb-28 sm:pb-14">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Estimated first-month payment (PITI)
          </p>
          <p className="mt-2 font-display text-4xl sm:text-6xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
            {formatMoney(m.pitiFirstMonth)}
            <span className="text-lg sm:text-xl font-semibold text-zinc-500 dark:text-zinc-400">/mo</span>
          </p>
          <div className="mt-6 sm:mt-8 -mx-6 px-6 sm:mx-0 sm:px-0">
            <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0">
              <div className="min-w-[14.5rem] sm:min-w-0 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 p-5 border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Principal & interest</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{formatMoney(m.pi)}</p>
              </div>
              <div className="min-w-[14.5rem] sm:min-w-0 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 p-5 border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Loan amount</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{formatMoney(m.loanAmount)}</p>
              </div>
              <div className="min-w-[14.5rem] sm:min-w-0 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 p-5 border border-emerald-200 dark:border-emerald-800 ring-2 ring-emerald-500/40 dark:ring-emerald-400/30">
                <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Readiness score</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">
                  {readinessScore}
                  <span className="text-base text-zinc-500">/100</span>
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 sm:hidden">Swipe to see all metrics</p>
          </div>
          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
              Payment breakdown (month 1)
            </p>
            <MortgagePaymentChart
              pi={m.pi}
              escrowTaxMonthly={m.escrowTaxMonthly}
              escrowInsMonthly={m.escrowInsMonthly}
              pmiMonthly={m.pmiMonthly}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
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

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
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

        <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0">
            {[
              { label: "Total interest (full term)", value: formatMoney(m.totalInterest) },
              { label: "Est. total PMI", value: m.needsPmi ? formatMoney(m.totalPmi) : "—" },
              { label: "LTV", value: `${m.ltv.toFixed(1)}%` },
              { label: "PMI / mo (if applicable)", value: m.needsPmi ? formatMoney(m.pmiMonthly) : "—" },
            ].map((row) => (
              <div
                key={row.label}
                className="min-w-[12rem] sm:min-w-0 shrink-0 sm:shrink rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/30"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{row.label}</p>
                <p className="mt-2 text-lg font-bold tabular-nums">{row.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 sm:hidden">Swipe for more totals</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="rounded-3xl border-2 border-zinc-900 bg-zinc-900 p-6 sm:p-8 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
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
              className="inline-flex items-center gap-2 w-full justify-center px-6 py-3.5 rounded-2xl bg-white text-zinc-900 text-sm font-bold hover:bg-zinc-100 transition-colors dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Open calculator workspace
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-3">
              <Copy className="h-6 w-6 text-zinc-700 dark:text-zinc-200" />
              <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50">Copy summary</h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Plain-text snapshot for your notes or to share with a lender or advisor.
            </p>
            <button
              type="button"
              onClick={() => void copySummary()}
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy text summary"}
            </button>
          </div>
        </div>

        {relatedTools.length > 0 ? (
          <div className="max-w-xl">
            <MortgageRelatedTools tools={relatedTools} />
          </div>
        ) : null}

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed pb-8">
          Educational estimates only — not financial advice. Taxes, insurance, and PMI vary by location and lender.
        </p>
      </div>

      <div className="sm:hidden fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 backdrop-blur pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenDashboard}
              className="col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-900 text-sm font-bold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Open calculator
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white text-sm font-bold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Retake
            </button>
            <button
              type="button"
              onClick={() => void copySummary()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white text-sm font-bold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
