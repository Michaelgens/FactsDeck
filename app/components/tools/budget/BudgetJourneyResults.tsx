"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Home, RefreshCw, Sparkles, Wallet } from "lucide-react";
import { computeBudgetJourneyMetrics, formatBudgetMoney } from "./compute-budget-journey-metrics";
import type { BudgetJourneyAnswers } from "./budget-journey-types";
import { FACTS_DECK_BUDGET_TEST } from "./budget-journey-types";

type Props = {
  answers: BudgetJourneyAnswers;
  onOpenDashboard: () => void;
  onStartOver: () => void;
};

const GOAL_LABEL: Record<BudgetJourneyAnswers["goal"], string> = {
  organize: "Get organized",
  debt: "Pay down debt",
  save: "Save more",
  exploring: "Exploring",
};

export default function BudgetJourneyResults({ answers, onOpenDashboard, onStartOver }: Props) {
  const m = computeBudgetJourneyMetrics(answers);
  const [copied, setCopied] = useState(false);

  const summaryText = [
    `${FACTS_DECK_BUDGET_TEST} — Summary`,
    `Focus: ${GOAL_LABEL[answers.goal]}`,
    `Monthly income: ${formatBudgetMoney(answers.incomeMonthly)}`,
    `Buffer: ${(answers.bufferPct * 100).toFixed(1)}% (${formatBudgetMoney(m.bufferMonthly)} / mo)`,
    `Available after buffer: ${formatBudgetMoney(m.available)}`,
    `Style: ${answers.mode === "50-30-20" ? "50/30/20" : "Zero-based"}`,
    m.targets
      ? `50/30/20 targets — Needs ${formatBudgetMoney(m.targets.needs)} | Wants ${formatBudgetMoney(m.targets.wants)} | Savings+debt ${formatBudgetMoney(m.targets.savingsDebt)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

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
              Retake {FACTS_DECK_BUDGET_TEST}
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
              <span className="leading-snug">{FACTS_DECK_BUDGET_TEST} · Results</span>
            </span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Focus: {GOAL_LABEL[answers.goal]}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-balance max-w-3xl">Your budget snapshot</h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
            Available cash after your buffer — then open the full planner to add real line items and buckets.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Available after buffer
          </p>
          <p className="mt-2 font-display text-5xl sm:text-6xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
            {formatBudgetMoney(m.available)}
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Income {formatBudgetMoney(answers.incomeMonthly)} − buffer {formatBudgetMoney(m.bufferMonthly)}
          </p>
          {m.targets ? (
            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 p-5 border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Needs target (50%)</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{formatBudgetMoney(m.targets.needs)}</p>
              </div>
              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 p-5 border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Wants target (30%)</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{formatBudgetMoney(m.targets.wants)}</p>
              </div>
              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 p-5 border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Savings + debt (20%)</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{formatBudgetMoney(m.targets.savingsDebt)}</p>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-300">
              Zero-based mode: assign every dollar in the full planner so remaining trends toward zero.
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border-2 border-zinc-900 bg-zinc-900 p-8 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="h-6 w-6" />
              <h2 className="font-display text-xl font-bold">Full budget workspace</h2>
            </div>
            <p className="text-sm opacity-90 leading-relaxed mb-6">
              Buckets, line items, insights, and JSON export — your test answers are pre-filled.
            </p>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-3.5 rounded-2xl bg-white text-zinc-900 text-sm font-bold hover:bg-zinc-100 transition-colors dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Open budget planner
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-3">
              <Copy className="h-6 w-6 text-zinc-700 dark:text-zinc-200" />
              <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50">Copy summary</h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Plain-text snapshot for notes or sharing.</p>
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
          Educational planning only — not financial advice.
        </p>
      </div>
    </div>
  );
}
