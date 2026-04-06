"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Gem, Home, RefreshCw, Sparkles } from "lucide-react";
import { computeFiSnapshotMetrics, formatFiMoney, FREEDOM_BAND_COPY } from "./compute-fi-snapshot-metrics";
import type { FiSnapshotJourneyAnswers } from "./fi-snapshot-journey-types";
import { FACTS_DECK_FI_SNAPSHOT_TEST } from "./fi-snapshot-journey-types";
import FiOrbitRing from "./FiOrbitRing";

type Props = {
  answers: FiSnapshotJourneyAnswers;
  onOpenDashboard: () => void;
  onStartOver: () => void;
};

const GOAL_LABEL: Record<FiSnapshotJourneyAnswers["goal"], string> = {
  freedom: "Freedom runway",
  clarity: "Clarity",
  milestone: "Milestone",
  exploring: "Exploring",
};

export default function FiSnapshotJourneyResults({ answers, onOpenDashboard, onStartOver }: Props) {
  const m = computeFiSnapshotMetrics(answers, { withdrawalRatePct: 4, investmentReturnAnnual: 0.07 });
  const band = FREEDOM_BAND_COPY[m.band];
  const [copied, setCopied] = useState(false);

  const summaryText = [
    `${FACTS_DECK_FI_SNAPSHOT_TEST} — Summary`,
    `Mindset: ${GOAL_LABEL[answers.goal]}`,
    `Assets — Cash ${formatFiMoney(answers.liquidCash)}, Invested ${formatFiMoney(answers.invested)}, Other ${formatFiMoney(answers.otherAssets)}`,
    `Liabilities: ${formatFiMoney(answers.liabilities)}`,
    `Monthly expenses: ${formatFiMoney(answers.monthlyExpenses)} | Investing: ${formatFiMoney(answers.monthlyInvesting)}/mo`,
    ``,
    `Net worth: ${formatFiMoney(m.netWorth)}`,
    `FI number (~4% rule): ${formatFiMoney(m.fiNumber)}`,
    `FI progress: ${m.fiProgressPct.toFixed(1)}%`,
    `Freedom band: ${band.title}`,
    m.yearsToFi != null ? `Illustrative years to FI (7% nominal): ~${m.yearsToFi} yr` : "Years to FI: add monthly investing to estimate",
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
    <div className="dark min-h-screen bg-zinc-950 text-zinc-100">
      <div className="relative overflow-hidden border-b border-violet-900/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-violet-600/25 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 pb-6 border-b border-violet-900/40">
            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-200/90 hover:text-white w-fit"
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              Retake {FACTS_DECK_FI_SNAPSHOT_TEST}
            </button>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-300/70 hover:text-white w-fit sm:ml-auto"
            >
              <Home className="h-4 w-4 shrink-0" />
              All tools
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/60 px-3 py-1.5 text-xs font-semibold text-violet-100">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-fuchsia-300" />
              <span className="leading-snug">{FACTS_DECK_FI_SNAPSHOT_TEST} · Results</span>
            </span>
            <span className="text-xs font-semibold text-violet-300/70">{GOAL_LABEL[answers.goal]}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-balance max-w-3xl bg-gradient-to-br from-white to-violet-200 bg-clip-text text-transparent">
            Your net worth &amp; freedom orbit
          </h1>
          <p className="mt-4 text-lg text-violet-100/70 max-w-2xl leading-relaxed">
            A single frame: where you are, how far to a textbook FI number, and a playful band name—not a verdict.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-violet-800/50 bg-violet-950/40 p-8">
            <FiOrbitRing pct={m.fiProgressPct} />
            <p className="mt-4 text-center text-sm text-violet-200/80">
              Illustrative progress vs a {m.withdrawalRatePct}% withdrawal FI target
            </p>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-violet-800/40 bg-zinc-900/50 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-400">Net worth</p>
              <p className="mt-1 font-display text-4xl font-bold tabular-nums text-white">{formatFiMoney(m.netWorth)}</p>
            </div>
            <div className="rounded-2xl border border-violet-800/40 bg-zinc-900/50 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-400/90">FI number (shortcut)</p>
              <p className="mt-1 font-display text-3xl font-bold tabular-nums text-white">{formatFiMoney(m.fiNumber)}</p>
              <p className="mt-2 text-sm text-violet-200/65">
                Months of expenses covered:{" "}
                {m.monthlyExpenses > 0 && m.netWorth > 0
                  ? `${(m.netWorth / m.monthlyExpenses).toFixed(1)} mo`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-950/40 to-violet-950/50 p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300/90">Freedom band</p>
          <p className="mt-2 font-display text-2xl font-bold text-white">{band.title}</p>
          <p className="mt-2 text-violet-100/75 leading-relaxed">{band.blurb}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border-2 border-violet-400/40 bg-violet-950/80 p-8 shadow-xl shadow-violet-950/50">
            <div className="flex items-center gap-2 mb-3">
              <Gem className="h-6 w-6 text-fuchsia-300" />
              <h2 className="font-display text-xl font-bold">Full snapshot workspace</h2>
            </div>
            <p className="text-sm text-violet-100/70 leading-relaxed mb-6">
              Lean / fat FI tiers, withdrawal rate, return assumption, and JSON export—your answers carry over.
            </p>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-3.5 rounded-2xl bg-white text-violet-950 text-sm font-bold hover:bg-violet-100 transition-colors"
            >
              Open FI snapshot workspace
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-3xl border border-violet-800/50 bg-zinc-900/60 p-8">
            <div className="flex items-center gap-2 mb-3">
              <Copy className="h-6 w-6 text-violet-300" />
              <h2 className="font-display text-xl font-bold">Copy summary</h2>
            </div>
            <p className="text-sm text-violet-200/65 mb-4">Plain text for journaling or sharing with a partner.</p>
            <button
              type="button"
              onClick={copySummary}
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-fuchsia-500/90 text-white text-sm font-bold hover:bg-fuchsia-400"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy text summary"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-violet-400/70 max-w-2xl mx-auto leading-relaxed pb-8">
          Educational illustration only—not tax, legal, or investment advice. FI math is sensitive to spend, returns, and
          sequence of returns.
        </p>
      </div>
    </div>
  );
}
