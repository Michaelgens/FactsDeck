"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Copy,
  Home,
  LineChart,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";
import {
  buildInvestmentTextSummary,
  computeInvestmentJourneyMetrics,
  computeInvestmentReadinessScore,
  formatInvestMoney,
  suggestRelatedTools,
} from "./compute-investment-journey-metrics";
import type { InvestmentJourneyAnswers } from "./investment-journey-types";
import { FACTS_DECK_INVESTMENT_TEST } from "./investment-journey-types";
import InvestmentRelatedTools from "./InvestmentRelatedTools";
import { INVESTMENT_SLUG, trackToolEvent } from "../../../lib/tool-analytics-client";

type Props = {
  answers: InvestmentJourneyAnswers;
  onOpenDashboard: () => void;
  onStartOver: () => void;
};

const GOAL_LABEL: Record<InvestmentJourneyAnswers["goal"], string> = {
  wealth: "Build wealth",
  fire: "FIRE / retirement",
  exploring: "Exploring",
};

export default function InvestmentJourneyResults({ answers, onOpenDashboard, onStartOver }: Props) {
  const m = computeInvestmentJourneyMetrics(answers);
  const readinessScore = computeInvestmentReadinessScore(answers, m);
  const relatedTools = suggestRelatedTools(answers.goal, answers);
  const [copied, setCopied] = useState(false);

  const summaryText = buildInvestmentTextSummary(answers, m);

  const copySummary = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      trackToolEvent(INVESTMENT_SLUG, "export_text");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [summaryText]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[4rem_4rem] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[42rem] w-[min(90rem,200%)] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-200/35 via-orange-100/15 to-transparent blur-3xl dark:from-violet-950/50 dark:via-fuchsia-950/30 dark:to-transparent"
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
              Retake {FACTS_DECK_INVESTMENT_TEST}
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
              <span className="leading-snug">{FACTS_DECK_INVESTMENT_TEST} · Results</span>
            </span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Focus: {GOAL_LABEL[answers.goal]}
            </span>
          </div>
          <h1 className="font-display text-[1.7rem] leading-tight sm:text-5xl font-bold text-balance max-w-3xl">
            Your investment snapshot
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
            Illustrative compounding with fixed 0.08% expense drag in this preview — open the full calculator to model fees,
            taxes, Monte Carlo, and more.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8 sm:space-y-10 pb-28 sm:pb-14">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Ending balance (nominal)
          </p>
          <p className="mt-2 font-display text-4xl sm:text-6xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
            {formatInvestMoney(m.finalNominal)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span>Contributed {formatInvestMoney(m.totalContributed)}</span>
            <span className="hidden h-3 w-px bg-zinc-200 dark:bg-zinc-700 sm:inline" aria-hidden />
            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              {answers.years} yr horizon
            </span>
            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              {answers.nominal.toFixed(1)}% return
            </span>
          </div>

          <div className="mt-6 sm:mt-8 -mx-6 px-6 sm:mx-0 sm:px-0">
            <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0">
              <div className="min-w-[14.5rem] sm:min-w-0 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 p-5 border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Purchasing power</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{formatInvestMoney(m.realFinal)}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Today&apos;s dollars (est.)</p>
              </div>
              <div className="min-w-[14.5rem] sm:min-w-0 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 p-5 border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">FIRE target</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{formatInvestMoney(m.fireTarget)}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {m.yearsToFire != null ? `${m.yearsToFire} yr to reach` : "Beyond horizon"}
                </p>
              </div>
              <div className="min-w-[14.5rem] sm:min-w-0 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 p-5 border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Readiness score</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">
                  {readinessScore}
                  <span className="text-base text-zinc-500">/100</span>
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Illustrative scale</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 sm:hidden">Swipe to see all metrics</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
              <h2 className="font-display text-xl font-bold">FIRE-style target</h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Portfolio implied by {formatInvestMoney(answers.annualSpend)}/yr spending at {answers.swr}% withdrawal.
            </p>
            <p className="text-3xl font-bold tabular-nums">{formatInvestMoney(m.fireTarget)}</p>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
              Years to reach (simple constant return):{" "}
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {m.yearsToFire != null ? `${m.yearsToFire} years` : "Not within horizon"}
              </span>
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
              <h2 className="font-display text-xl font-bold">Monte Carlo (illustrative band)</h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              250 paths, 16% vol — not a forecast, just an uncertainty range.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">10th percentile</span>
                <span className="font-bold tabular-nums">{formatInvestMoney(m.mc.p10)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Median</span>
                <span className="font-bold tabular-nums">{formatInvestMoney(m.mc.p50)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">90th percentile</span>
                <span className="font-bold tabular-nums">{formatInvestMoney(m.mc.p90)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="rounded-3xl border-2 border-zinc-900 bg-zinc-900 p-6 sm:p-8 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
            <div className="flex items-center gap-2 mb-3">
              <LineChart className="h-6 w-6" />
              <h2 className="font-display text-xl font-bold">Full investment workspace</h2>
            </div>
            <p className="text-sm opacity-90 leading-relaxed mb-6">
              Trajectory tables, sequence-of-returns, lump vs DCA, adjustable fees & tax — everything in one place.
            </p>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-2 w-full justify-center px-6 py-3.5 rounded-2xl bg-white text-zinc-900 text-sm font-bold hover:bg-zinc-100 transition-colors dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Open calculator dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-3">
              <Copy className="h-6 w-6 text-zinc-700 dark:text-zinc-200" />
              <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50">Copy summary</h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Plain-text snapshot for your notes, email draft, or advisor.
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
            <InvestmentRelatedTools tools={relatedTools} />
          </div>
        ) : null}

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed pb-8">
          Educational estimates only — not investment advice. Markets are uncertain; models simplify taxes and fees.
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
