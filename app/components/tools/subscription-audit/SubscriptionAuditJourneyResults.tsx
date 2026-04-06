"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Home, RefreshCw, Repeat, Sparkles } from "lucide-react";
import { computeSubscriptionJourneyMetrics, formatSubMoney } from "./compute-subscription-audit-metrics";
import type { SubscriptionJourneyAnswers } from "./subscription-audit-journey-types";
import { FACTS_DECK_SUBSCRIPTION_AUDIT_TEST } from "./subscription-audit-journey-types";

type Props = {
  answers: SubscriptionJourneyAnswers;
  onOpenDashboard: () => void;
  onStartOver: () => void;
};

const GOAL_LABEL: Record<SubscriptionJourneyAnswers["goal"], string> = {
  leaks: "Find leaks",
  cut: "Cut costs",
  exploring: "Exploring",
};

export default function SubscriptionAuditJourneyResults({ answers, onOpenDashboard, onStartOver }: Props) {
  const m = computeSubscriptionJourneyMetrics(answers);
  const [copied, setCopied] = useState(false);

  const summaryText = [
    `${FACTS_DECK_SUBSCRIPTION_AUDIT_TEST} — Summary`,
    `Goal: ${GOAL_LABEL[answers.goal]}`,
    `Estimated recurring: ${formatSubMoney(m.monthly)}/mo`,
    `Active subscriptions (rough count): ${m.subscriptionCount}`,
    ``,
    `Annualized: ${formatSubMoney(m.annual)}`,
    `≈ per day: ${formatSubMoney(m.daily)}`,
    `Avg per sub (if spread evenly): ${formatSubMoney(m.avgPerSub)}/mo`,
    ``,
    `If you cut 10%: ~${formatSubMoney(m.cut10Annual)}/yr`,
    `If you cut 15%: ~${formatSubMoney(m.cut15Annual)}/yr`,
    `If you cut 25%: ~${formatSubMoney(m.cut25Annual)}/yr`,
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
    <div className="dark min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-rose-500/12 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 pb-6 border-b border-slate-800/80">
            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white w-fit"
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              Retake {FACTS_DECK_SUBSCRIPTION_AUDIT_TEST}
            </button>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-200 w-fit sm:ml-auto"
            >
              <Home className="h-4 w-4 shrink-0" />
              All tools
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-200">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-rose-400" />
              <span className="leading-snug">{FACTS_DECK_SUBSCRIPTION_AUDIT_TEST} · Results</span>
            </span>
            <span className="text-xs font-semibold text-slate-500">{GOAL_LABEL[answers.goal]}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-balance max-w-3xl">Recurring spend, annualized</h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl leading-relaxed">
            The same autopay, expressed as yearly dollars—open the audit to name each line and export JSON.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-950/50 to-slate-900/80 p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose-400/90">Annualized recurring</p>
          <p className="mt-2 font-display text-5xl sm:text-6xl font-bold tabular-nums text-white">{formatSubMoney(m.annual)}</p>
          <p className="mt-3 text-slate-400">
            {formatSubMoney(m.monthly)}/mo · ~{formatSubMoney(m.daily)}/day · ~{m.subscriptionCount} subs · avg{" "}
            {formatSubMoney(m.avgPerSub)}/mo if spread evenly
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {(
            [
              ["10% trim", m.cut10Annual],
              ["15% trim", m.cut15Annual],
              ["25% trim", m.cut25Annual],
            ] as const
          ).map(([label, amt]) => (
            <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <p className="text-xs font-bold uppercase text-slate-500">{label} (illustrative)</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-rose-300">{formatSubMoney(amt)}/yr</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border-2 border-rose-500/40 bg-gradient-to-br from-rose-950/60 to-slate-950 p-8">
            <div className="flex items-center gap-2 mb-3">
              <Repeat className="h-6 w-6 text-rose-400" />
              <h2 className="font-display text-xl font-bold">Full subscription audit</h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Line-by-line rows, categories, trim %—your test estimate is imported as a starter line you can split.
            </p>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-3.5 rounded-2xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100"
            >
              Open subscription audit
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
            <div className="flex items-center gap-2 mb-3">
              <Copy className="h-6 w-6 text-slate-300" />
              <h2 className="font-display text-xl font-bold">Copy summary</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">Plain text for notes.</p>
            <button
              type="button"
              onClick={copySummary}
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-500"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy text summary"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 max-w-2xl mx-auto pb-8">
          Educational planning only. Categories and totals are only as accurate as your inputs.
        </p>
      </div>
    </div>
  );
}
