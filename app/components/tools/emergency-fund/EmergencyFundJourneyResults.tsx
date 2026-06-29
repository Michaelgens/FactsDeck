"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Home, RefreshCw, Sparkles, Umbrella } from "lucide-react";
import {
  computeEmergencyFundJourneyMetrics,
  defaultDemoEssentials,
  formatEfMoney,
  GOAL_LABEL,
  PLAN_MODE_LABEL,
  goalResultsHeadline,
  runwayStatusLabel,
  suggestRelatedTools,
} from "./compute-emergency-fund-journey-metrics";
import { saveEmergencyFundState } from "./emergency-fund-storage";
import type { EmergencyFundJourneyAnswers } from "./emergency-fund-journey-types";
import { FACTS_DECK_EMERGENCY_FUND_TEST } from "./emergency-fund-journey-types";
import EmergencyFundRelatedTools from "./EmergencyFundRelatedTools";
import { EMERGENCY_FUND_SLUG, trackToolEvent } from "../../../lib/tool-analytics-client";

type Props = {
  answers: EmergencyFundJourneyAnswers;
  onOpenDashboard: () => void;
  onStartOver: () => void;
};

const STATUS_STYLES = {
  good: "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800",
  warn: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800",
  critical: "bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-800",
};

export default function EmergencyFundJourneyResults({ answers, onOpenDashboard, onStartOver }: Props) {
  const m = computeEmergencyFundJourneyMetrics(answers);
  const [copied, setCopied] = useState(false);
  const headline = goalResultsHeadline(answers.goal, answers.planMode);
  const status = runwayStatusLabel(m);
  const relatedTools = suggestRelatedTools(answers.goal, m, answers.planMode);

  const summaryText = [
    `${FACTS_DECK_EMERGENCY_FUND_TEST} — Summary`,
    `Focus: ${GOAL_LABEL[answers.goal]}`,
    `Workspace: ${PLAN_MODE_LABEL[answers.planMode]}`,
    `Essential expenses: ${formatEfMoney(answers.monthlyEssentials)}/mo`,
    `Current fund: ${formatEfMoney(answers.currentFund)}`,
    `Contribution: ${formatEfMoney(answers.monthlyContribution)}/mo`,
    `Target: ${m.targetMonths} months of expenses`,
    ``,
    `Status: ${status.label}`,
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
      trackToolEvent(EMERGENCY_FUND_SLUG, "export_text");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [summaryText]);

  const loadSamplePlan = useCallback(() => {
    try {
      saveEmergencyFundState({
        goal: answers.goal,
        planMode: answers.planMode,
        monthlyEssentials: answers.monthlyEssentials,
        currentFund: answers.currentFund,
        monthlyContribution: answers.monthlyContribution,
        targetMonths: answers.targetMonths,
        essentialItems: defaultDemoEssentials(answers.monthlyEssentials),
      });
      trackToolEvent(EMERGENCY_FUND_SLUG, "starter_plan_load");
      onOpenDashboard();
    } catch (err) {
      console.error("[loadSamplePlan]", err);
      onOpenDashboard();
    }
  }, [answers, onOpenDashboard]);

  const pctBar = Math.min(100, m.pctOfTarget);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[4rem_4rem] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[42rem] w-[min(90rem,200%)] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-200/35 via-cyan-100/15 to-transparent blur-3xl dark:from-sky-950/50 dark:via-cyan-950/30 dark:to-transparent"
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
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Focus: {GOAL_LABEL[answers.goal]}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[status.tone]}`}
            >
              {status.label}
            </span>
          </div>
          <h1 className="font-display text-[1.7rem] leading-tight sm:text-5xl font-bold text-balance max-w-3xl">
            {headline.title}
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
            {headline.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8 sm:space-y-10 pb-28 sm:pb-14">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Runway today
              </p>
              <p className="mt-2 font-display text-4xl sm:text-6xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
                {m.runwayMonths.toFixed(1)}
                <span className="text-2xl font-bold text-zinc-500"> mo</span>
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {formatEfMoney(answers.currentFund)} ÷ {formatEfMoney(answers.monthlyEssentials)}/mo essentials
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Target ({m.targetMonths} mo)
              </p>
              <p className="mt-2 font-display text-4xl sm:text-6xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
                {formatEfMoney(m.targetBalance)}
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Gap {formatEfMoney(m.gap)} · {PLAN_MODE_LABEL[answers.planMode]}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Funding progress</p>
              <p className="text-sm font-semibold tabular-nums">{m.pctOfTarget.toFixed(0)}%</p>
            </div>
            <div className="h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-600 to-cyan-500 dark:from-sky-500 dark:to-cyan-400 transition-[width] duration-500"
                style={{ width: `${pctBar}%` }}
              />
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 p-5 border border-zinc-100 dark:border-zinc-800">
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
                : "Add a monthly contribution in the workspace to estimate."}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="rounded-3xl border-2 border-sky-800 bg-sky-900 p-6 sm:p-8 text-white dark:border-sky-400 dark:bg-sky-950">
            <div className="flex items-center gap-2 mb-3">
              <Umbrella className="h-6 w-6" />
              <h2 className="font-display text-xl font-bold">Full runway workspace</h2>
            </div>
            <p className="text-sm opacity-90 leading-relaxed mb-6">
              {answers.planMode === "essentials_builder"
                ? `Empty essentials list to start — load a ${GOAL_LABEL[answers.goal].toLowerCase()} starter or add categories line by line.`
                : "Your test numbers are pre-filled — switch to essentials builder anytime for a detailed breakdown."}
            </p>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-2 w-full justify-center px-6 py-3.5 rounded-2xl bg-white text-sky-900 text-sm font-bold hover:bg-sky-50 transition-colors"
            >
              Open emergency fund calculator
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={loadSamplePlan}
              className="mt-3 inline-flex items-center gap-2 w-full justify-center px-6 py-3 rounded-xl border border-white/70 bg-white/10 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Load sample plan
            </button>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
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

        {relatedTools.length > 0 ? (
          <div className="max-w-xl">
            <EmergencyFundRelatedTools tools={relatedTools} />
          </div>
        ) : null}

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed pb-8">
          Educational planning only — not financial advice. Runway assumes no interest and steady expenses.
        </p>
      </div>

      <div className="sm:hidden fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 backdrop-blur pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenDashboard}
              className="col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-sky-800 text-sm font-bold text-white shadow-sm transition-colors hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
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
              onClick={copySummary}
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
