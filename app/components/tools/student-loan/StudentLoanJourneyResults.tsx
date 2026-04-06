"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Copy,
  GraduationCap,
  Home,
  RefreshCw,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { computeStudentLoanJourneyMetrics, formatSlMoney } from "./compute-student-loan-metrics";
import type { StudentLoanJourneyAnswers } from "./student-loan-journey-types";
import { FACTS_DECK_STUDENT_LOAN_TEST } from "./student-loan-journey-types";

type Props = {
  answers: StudentLoanJourneyAnswers;
  onOpenDashboard: () => void;
  onStartOver: () => void;
};

const GOAL_LABEL: Record<StudentLoanJourneyAnswers["goal"], string> = {
  standard: "Standard repayment",
  idr: "IDR (illustrative)",
  compare: "Compare both",
  exploring: "Exploring",
};

export default function StudentLoanJourneyResults({ answers, onOpenDashboard, onStartOver }: Props) {
  const m = computeStudentLoanJourneyMetrics(answers);
  const [copied, setCopied] = useState(false);

  const summaryText = [
    `${FACTS_DECK_STUDENT_LOAN_TEST} — Summary`,
    `Goal: ${GOAL_LABEL[answers.goal]}`,
    `Balance: ${formatSlMoney(answers.balance)} @ ${answers.aprPercent.toFixed(2)}%`,
    `Income: ${formatSlMoney(answers.annualIncome)}/yr | Family size: ${answers.familySize}`,
    ``,
    `Discretionary income (est.): ${formatSlMoney(m.discretionaryAnnual)}/yr`,
    `Standard (10 yr) payment: ${formatSlMoney(m.standardMonthly)}/mo | Total interest ≈ ${formatSlMoney(m.standardTotalInterest)}`,
    `IDR illustrative payment (${m.idrPercentOfDiscretionary}% of discretionary / yr): ${formatSlMoney(m.idrMonthly)}/mo`,
    m.idrBelowInterest ? `Warning: IDR payment is below first-month interest (balance can grow).` : ``,
    `After 20 yrs (illustrative IDR path): balance ≈ ${formatSlMoney(m.idrAfter20y.endingBalance)}`,
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-sky-500/[0.1] blur-3xl dark:bg-sky-400/[0.07]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white w-fit"
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              Retake {FACTS_DECK_STUDENT_LOAN_TEST}
            </button>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 w-fit sm:ml-auto"
            >
              <Home className="h-4 w-4 shrink-0" />
              All tools
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
              <span className="leading-snug">{FACTS_DECK_STUDENT_LOAN_TEST} · Results</span>
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{GOAL_LABEL[answers.goal]}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-balance max-w-3xl">Your student loan path snapshot</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Standard vs illustrative IDR—open the full workspace to change term, IDR %, and export JSON.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 p-5 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-950 dark:text-amber-100/90 leading-relaxed">
              <strong>Educational model only.</strong> Not your servicer’s payment, not tax or legal advice. IDR here uses a
              fixed % of estimated discretionary income; real SAVE/PAYE/ICR rules differ.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Standard (10-year level)
            </p>
            <p className="mt-2 font-display text-4xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {formatSlMoney(m.standardMonthly)}
              <span className="text-xl font-bold text-slate-500">/mo</span>
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Total interest ≈ {formatSlMoney(m.standardTotalInterest)}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              IDR illustrative
            </p>
            <p className="mt-2 font-display text-4xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {formatSlMoney(m.idrMonthly)}
              <span className="text-xl font-bold text-slate-500">/mo</span>
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Discretionary income ≈ {formatSlMoney(m.discretionaryAnnual)}/yr
            </p>
          </div>
        </div>

        {m.idrBelowInterest ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-6 dark:border-rose-900/50 dark:bg-rose-950/30">
            <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">Payment may not cover interest</p>
            <p className="mt-2 text-sm text-rose-800/90 dark:text-rose-200/90 leading-relaxed">
              Your illustrative IDR payment is below first-month interest—the balance can grow until income rises or you
              switch plans. Check real IDR rules and recertification with your servicer.
            </p>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Illustrative balance after 20 years (IDR path)</p>
          <p className="mt-2 text-2xl font-bold tabular-nums">{formatSlMoney(m.idrAfter20y.endingBalance)}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Simplified accrual + payment; forgiveness and subsidies are not modeled.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border-2 border-slate-900 bg-slate-900 p-8 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-6 w-6" />
              <h2 className="font-display text-xl font-bold">Full snapshot</h2>
            </div>
            <p className="text-sm opacity-90 leading-relaxed mb-6">
              Adjust standard term, IDR % of discretionary income, and horizon—then copy JSON.
            </p>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-3.5 rounded-2xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition-colors dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800"
            >
              Open student loan snapshot
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center gap-2 mb-3">
              <Copy className="h-6 w-6 text-slate-700 dark:text-slate-200" />
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">Copy summary</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Plain text for notes.</p>
            <button
              type="button"
              onClick={copySummary}
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
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
