"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Home, RefreshCw, Sparkles, Umbrella } from "lucide-react";
import { computeEmergencyFundJourneyMetrics, formatEfMoney } from "./compute-emergency-fund-journey-metrics";
import type { EmergencyFundJourneyAnswers } from "./emergency-fund-journey-types";
import { FACTS_DECK_EMERGENCY_FUND_TEST } from "./emergency-fund-journey-types";

type Props = {
  answers: EmergencyFundJourneyAnswers;
  onOpenDashboard: () => void;
  onStartOver: () => void;
};

const GOAL_LABEL: Record<EmergencyFundJourneyAnswers["goal"], string> = {
  essentials: "Cover essentials",
  job_buffer: "Job-loss buffer",
  peace: "Peace of mind",
  exploring: "Exploring",
};

export default function EmergencyFundJourneyResults({ answers, onOpenDashboard, onStartOver }: Props) {
  const m = computeEmergencyFundJourneyMetrics(answers);
  const [copied, setCopied] = useState(false);

  const summaryText = [
    `${FACTS_DECK_EMERGENCY_FUND_TEST} — Summary`,
    `Goal: ${GOAL_LABEL[answers.goal]}`,
    `Essential expenses: ${formatEfMoney(answers.monthlyEssentials)}/mo`,
    `Current fund: ${formatEfMoney(answers.currentFund)}`,
    `Contribution: ${formatEfMoney(answers.monthlyContribution)}/mo`,
    `Target: ${m.targetMonths} months of expenses`,
    ``,
    `Runway: ${m.runwayMonths.toFixed(1)} months`,
    `Target balance: ${formatEfMoney(m.targetBalance)}`,
    `Gap: ${formatEfMoney(m.gap)}`,
    `Progress: ${m.pctOfTarget.toFixed(0)}%`,
    m.monthsToTarget != null
      ? `Months to target (at current contribution): ${m.monthsToTarget === 0 ? "Fully funded" : m.monthsToTarget}`
      : "Months to target: add monthly contribution to estimate",
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
          <div className="absolute -top-20 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-sky-500/[0.07] blur-3xl dark:bg-sky-400/[0.08]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white w-fit"
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              Retake {FACTS_DECK_EMERGENCY_FUND_TEST}
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
              <span className="leading-snug">{FACTS_DECK_EMERGENCY_FUND_TEST} · Results</span>
            </span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{GOAL_LABEL[answers.goal]}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-balance max-w-3xl">Your emergency fund snapshot</h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
            Runway, target, and time to goal — open the full calculator to refine numbers and export JSON.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Runway</p>
            <p className="mt-2 font-display text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
              {m.runwayMonths.toFixed(1)}
              <span className="text-2xl font-bold text-zinc-500"> mo</span>
            </p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              At current balance ÷ {formatEfMoney(answers.monthlyEssentials)}/mo essentials
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Target ({m.targetMonths} mo of expenses)
            </p>
            <p className="mt-2 font-display text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatEfMoney(m.targetBalance)}
            </p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {m.pctOfTarget.toFixed(0)}% funded · Gap {formatEfMoney(m.gap)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Time to full target</p>
          <p className="mt-2 text-2xl font-bold tabular-nums">
            {m.monthsToTarget === null
              ? "—"
              : m.monthsToTarget === 0
                ? "Fully funded"
                : `${m.monthsToTarget} mo`}
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {answers.monthlyContribution > 0
              ? `At ${formatEfMoney(answers.monthlyContribution)}/mo (simple, no growth)`
              : "Add a monthly contribution in the full calculator to estimate."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border-2 border-zinc-900 bg-zinc-900 p-8 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
            <div className="flex items-center gap-2 mb-3">
              <Umbrella className="h-6 w-6" />
              <h2 className="font-display text-xl font-bold">Full calculator</h2>
            </div>
            <p className="text-sm opacity-90 leading-relaxed mb-6">
              Adjust inputs, see progress, and copy JSON — your test answers are pre-filled.
            </p>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-3.5 rounded-2xl bg-white text-zinc-900 text-sm font-bold hover:bg-zinc-100 transition-colors dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Open emergency fund calculator
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-3">
              <Copy className="h-6 w-6 text-zinc-700 dark:text-zinc-200" />
              <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50">Copy summary</h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Plain text for notes.</p>
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
          Educational planning only — not financial advice. Runway assumes no interest and steady expenses.
        </p>
      </div>
    </div>
  );
}
