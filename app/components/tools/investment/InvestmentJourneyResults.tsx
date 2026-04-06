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
import { computeInvestmentJourneyMetrics, formatInvestMoney } from "./compute-investment-journey-metrics";
import type { InvestmentJourneyAnswers } from "./investment-journey-types";
import { FACTS_DECK_INVESTMENT_TEST } from "./investment-journey-types";

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
  const [copied, setCopied] = useState(false);

  const summaryText = [
    `${FACTS_DECK_INVESTMENT_TEST} — Summary`,
    `Goal: ${GOAL_LABEL[answers.goal]}`,
    `Starting balance: ${formatInvestMoney(answers.initial)}`,
    `Monthly contribution: ${formatInvestMoney(answers.monthly)}/mo`,
    `Horizon: ${answers.years} years @ ${answers.nominal.toFixed(2)}% nominal (0.08% expense drag in snapshot)`,
    `Inflation: ${answers.inflation.toFixed(2)}%`,
    ``,
    `Ending balance (nominal): ${formatInvestMoney(m.finalNominal)}`,
    `Purchasing power (est.): ${formatInvestMoney(m.realFinal)}`,
    `After-tax (simplified ${15}% on gains): ${formatInvestMoney(m.afterTaxApprox)}`,
    `FIRE target (${answers.swr}% SWR, ${formatInvestMoney(answers.annualSpend)}/yr spend): ${formatInvestMoney(m.fireTarget)}`,
    `Years to FIRE (simple model): ${m.yearsToFire != null ? `${m.yearsToFire} yr` : "Not reached in horizon"}`,
    `Passive income @ ${answers.swr}% on ending balance: ${formatInvestMoney(m.passiveIncomeAtTargetSwr)}/yr`,
    `Monte Carlo (illustrative): p10 ${formatInvestMoney(m.mc.p10)} | p50 ${formatInvestMoney(m.mc.p50)} | p90 ${formatInvestMoney(m.mc.p90)}`,
  ].join("\n");

  const copySummary = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [summaryText]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-violet-500/[0.07] blur-3xl dark:bg-violet-400/[0.08]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white w-fit"
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
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Goal: {GOAL_LABEL[answers.goal]}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-balance max-w-3xl">
            Your investment snapshot
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
            Illustrative compounding with fixed 0.08% expense drag in this preview — open the full calculator to model fees,
            taxes, Monte Carlo, and more.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Ending balance (nominal)
          </p>
          <p className="mt-2 font-display text-5xl sm:text-6xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
            {formatInvestMoney(m.finalNominal)}
          </p>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 p-5 border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Purchasing power (est.)</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{formatInvestMoney(m.realFinal)}</p>
            </div>
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 p-5 border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Total contributed</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{formatInvestMoney(m.totalContributed)}</p>
            </div>
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 p-5 border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">After-tax (simple)</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{formatInvestMoney(m.afterTaxApprox)}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
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
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Passive income from ending balance @ {answers.swr}%:{" "}
              <span className="font-semibold">{formatInvestMoney(m.passiveIncomeAtTargetSwr)}/yr</span>
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
              <h2 className="font-display text-xl font-bold">Monte Carlo (illustrative band)</h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              250 paths, 16% vol — not a forecast, just a uncertainty range.
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

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border-2 border-zinc-900 bg-zinc-900 p-8 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
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
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-3.5 rounded-2xl bg-white text-zinc-900 text-sm font-bold hover:bg-zinc-100 transition-colors dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Open calculator dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-3">
              <Copy className="h-6 w-6 text-zinc-700 dark:text-zinc-200" />
              <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50">Copy summary</h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Plain-text snapshot for your notes, email draft, or advisor — copied to your clipboard.
            </p>
            <button
              type="button"
              onClick={copySummary}
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy text summary"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed pb-8">
          Educational estimates only — not investment advice. Markets are uncertain; models simplify taxes and fees.
        </p>
      </div>
    </div>
  );
}
