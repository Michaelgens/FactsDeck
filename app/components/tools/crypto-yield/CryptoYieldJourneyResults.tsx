"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Check, Coins, Copy, Home, RefreshCw, Sparkles } from "lucide-react";
import { computeCryptoYieldJourneyMetrics, formatCyMoney } from "./compute-crypto-yield-metrics";
import type { CryptoYieldJourneyAnswers } from "./crypto-yield-journey-types";
import { FACTS_DECK_CRYPTO_YIELD_TEST } from "./crypto-yield-journey-types";

type Props = {
  answers: CryptoYieldJourneyAnswers;
  onOpenDashboard: () => void;
  onStartOver: () => void;
};

const GOAL_LABEL: Record<CryptoYieldJourneyAnswers["goal"], string> = {
  compounding: "Compounding",
  compare: "Compare frequencies",
  exploring: "Exploring",
};

const COMP: Record<CryptoYieldJourneyAnswers["compounding"], string> = {
  daily: "Daily",
  monthly: "Monthly",
  annual: "Annual",
};

export default function CryptoYieldJourneyResults({ answers, onOpenDashboard, onStartOver }: Props) {
  const m = computeCryptoYieldJourneyMetrics(answers);
  const [copied, setCopied] = useState(false);

  const summaryText = [
    `${FACTS_DECK_CRYPTO_YIELD_TEST} — Summary`,
    `Goal: ${GOAL_LABEL[answers.goal]}`,
    `Principal: ${formatCyMoney(answers.principal)} | Nominal APY: ${answers.apyPercent.toFixed(2)}%`,
    `Horizon: ${answers.months} mo | Compounding: ${COMP[answers.compounding]}`,
    ``,
    `Ending balance: ${formatCyMoney(m.futureValue)}`,
    `Interest (illustrative): ${formatCyMoney(m.interestEarned)}`,
    `Effective APY (from path): ${m.effectiveApyPercent.toFixed(2)}%`,
    `Same APY — daily FV: ${formatCyMoney(m.compareAtHorizon.daily.fv)} | monthly: ${formatCyMoney(m.compareAtHorizon.monthly.fv)} | annual: ${formatCyMoney(m.compareAtHorizon.annual.fv)}`,
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
    <div className="dark min-h-screen bg-amber-950 text-amber-50">
      <div className="relative overflow-hidden border-b border-amber-900/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-orange-500/20 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 pb-6 border-b border-amber-900/40">
            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200/90 hover:text-amber-50 w-fit"
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              Retake {FACTS_DECK_CRYPTO_YIELD_TEST}
            </button>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-300/70 hover:text-amber-100 w-fit sm:ml-auto"
            >
              <Home className="h-4 w-4 shrink-0" />
              All tools
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-700/50 bg-amber-950/80 px-3 py-1.5 text-xs font-semibold text-amber-100">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span className="leading-snug">{FACTS_DECK_CRYPTO_YIELD_TEST} · Results</span>
            </span>
            <span className="text-xs font-semibold text-amber-300/70">{GOAL_LABEL[answers.goal]}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-balance max-w-3xl">Your yield snapshot</h1>
          <p className="mt-4 text-lg text-amber-100/70 max-w-2xl leading-relaxed">
            Ending balance and a three-way frequency compare—open the lab for APR ↔ APY and JSON export.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        <div className="rounded-2xl border border-amber-800/60 bg-amber-950/50 p-5">
          <p className="text-sm text-amber-100/80 leading-relaxed">
            <strong className="text-amber-200">Not investment advice.</strong> Staking and yield products carry protocol,
            smart-contract, and regulatory risk. APYs change. This model ignores fees, taxes, and slashing.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-amber-800/50 bg-amber-950/60 p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-400/90">Ending balance</p>
            <p className="mt-2 font-display text-4xl font-bold tabular-nums text-amber-50">{formatCyMoney(m.futureValue)}</p>
            <p className="mt-2 text-sm text-amber-200/70">
              {COMP[answers.compounding]} compounding · {answers.months} mo · Nominal {answers.apyPercent.toFixed(2)}% APY
            </p>
          </div>
          <div className="rounded-3xl border border-amber-800/50 bg-amber-950/60 p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-400/90">Illustrative interest</p>
            <p className="mt-2 font-display text-4xl font-bold tabular-nums text-amber-50">{formatCyMoney(m.interestEarned)}</p>
            <p className="mt-2 text-sm text-amber-200/70">
              Effective APY over horizon ≈ {m.effectiveApyPercent.toFixed(2)}%
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-amber-200 mb-3">Same headline APY — different compounding (illustrative)</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["Daily", m.compareAtHorizon.daily.fv],
                ["Monthly", m.compareAtHorizon.monthly.fv],
                ["Annual", m.compareAtHorizon.annual.fv],
              ] as const
            ).map(([label, fv]) => (
              <div key={label} className="rounded-2xl border border-amber-800/40 bg-amber-950/40 p-5">
                <p className="text-xs font-bold uppercase text-amber-500/90">{label}</p>
                <p className="mt-2 text-xl font-bold tabular-nums text-amber-50">{formatCyMoney(fv)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-amber-950 p-8">
            <div className="flex items-center gap-2 mb-3">
              <Coins className="h-6 w-6 text-amber-300" />
              <h2 className="font-display text-xl font-bold">Full yield lab</h2>
            </div>
            <p className="text-sm text-amber-100/75 leading-relaxed mb-6">
              APR vs APY converter, compounding dial, and JSON export—your test inputs carry over.
            </p>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-3.5 rounded-2xl bg-amber-400 text-amber-950 text-sm font-bold hover:bg-amber-300"
            >
              Open staking &amp; yield lab
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-3xl border border-amber-800/50 bg-amber-950/60 p-8">
            <div className="flex items-center gap-2 mb-3">
              <Copy className="h-6 w-6 text-amber-300" />
              <h2 className="font-display text-xl font-bold">Copy summary</h2>
            </div>
            <p className="text-sm text-amber-200/65 mb-4">Plain text for notes.</p>
            <button
              type="button"
              onClick={copySummary}
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-amber-400 text-amber-950 text-sm font-bold hover:bg-amber-300"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy text summary"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
