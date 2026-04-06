"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Gauge, Home, RefreshCw, Sparkles } from "lucide-react";
import { computeCreditJourneyMetrics } from "./compute-credit-journey-metrics";
import type { CreditJourneyAnswers } from "./credit-journey-types";
import { FACTS_DECK_CREDIT_TEST } from "./credit-journey-types";

type Props = {
  answers: CreditJourneyAnswers;
  onOpenDashboard: () => void;
  onStartOver: () => void;
};

const GOAL_LABEL: Record<CreditJourneyAnswers["goal"], string> = {
  improve: "Improve score",
  learn: "Learn factors",
  exploring: "Exploring",
};

export default function CreditJourneyResults({ answers, onOpenDashboard, onStartOver }: Props) {
  const m = computeCreditJourneyMetrics(answers);
  const [copied, setCopied] = useState(false);

  const summaryText = [
    `${FACTS_DECK_CREDIT_TEST} — Summary`,
    `Goal: ${GOAL_LABEL[answers.goal]}`,
    `Simulated score: ${m.score} (${m.bandName})`,
    `Utilization ${answers.utilizationPct}% | On-time ${answers.onTimePct}%`,
    `Avg age ${answers.avgAgeYears} yr | Inquiries ${answers.hardInquiries12m} | Types ${answers.accountTypes}`,
    ``,
    `Factor points (illustrative): util ${m.pts.utilization} | pay ${m.pts.payment} | age ${m.pts.age} | inq ${m.pts.inquiries} | mix ${m.pts.mix}`,
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

  const barPct = ((m.score - 300) / 550) * 100;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-zinc-400/[0.08] blur-3xl dark:bg-zinc-500/[0.1]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white w-fit"
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              Retake {FACTS_DECK_CREDIT_TEST}
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
              <span className="leading-snug">{FACTS_DECK_CREDIT_TEST} · Results</span>
            </span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{GOAL_LABEL[answers.goal]}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-balance max-w-3xl">Your simulated score</h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
            Educational model only — not a real FICO or VantageScore. Open the full simulator for presets and what-ifs.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Illustrative score
            </p>
            <p className="mt-2 font-display text-6xl sm:text-7xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
              {m.score}
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-700 dark:text-zinc-200">{m.bandName}</p>
            <div className="mt-6 h-3 max-w-md rounded-full bg-zinc-200 overflow-hidden dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-500"
                style={{ width: `${barPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">300 ············································································· 850</p>
          </div>
          <div className="mt-8 grid sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/80">
              <p className="font-bold text-zinc-500 dark:text-zinc-400">Util</p>
              <p className="mt-1 font-semibold tabular-nums">{m.pts.utilization}</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/80">
              <p className="font-bold text-zinc-500 dark:text-zinc-400">Pay</p>
              <p className="mt-1 font-semibold tabular-nums">{m.pts.payment}</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/80">
              <p className="font-bold text-zinc-500 dark:text-zinc-400">Age</p>
              <p className="mt-1 font-semibold tabular-nums">{m.pts.age}</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/80">
              <p className="font-bold text-zinc-500 dark:text-zinc-400">Inq</p>
              <p className="mt-1 font-semibold tabular-nums">{m.pts.inquiries}</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/80">
              <p className="font-bold text-zinc-500 dark:text-zinc-400">Mix</p>
              <p className="mt-1 font-semibold tabular-nums">{m.pts.mix}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border-2 border-zinc-900 bg-zinc-900 p-8 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="h-6 w-6" />
              <h2 className="font-display text-xl font-bold">Full simulator</h2>
            </div>
            <p className="text-sm opacity-90 leading-relaxed mb-6">
              Presets, gauge, what-if paydown — your test inputs are pre-filled.
            </p>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-3.5 rounded-2xl bg-white text-zinc-900 text-sm font-bold hover:bg-zinc-100 transition-colors dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Open credit simulator
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
          Not a credit report or real score — for learning only.
        </p>
      </div>
    </div>
  );
}
