"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, PieChart, PiggyBank, Sparkles, Target, Wallet, Compass } from "lucide-react";
import WizardSlideShell from "../mortgage/WizardSlideShell";
import type { BudgetGoal, BudgetJourneyAnswers } from "./budget-journey-types";
import {
  BUDGET_JOURNEY_DEFAULTS,
  FACTS_DECK_BUDGET_PLANNER,
  FACTS_DECK_BUDGET_TEST,
} from "./budget-journey-types";

const TOTAL_STEPS = 6;

const GOALS: { id: BudgetGoal; title: string; blurb: string; icon: typeof Wallet }[] = [
  { id: "organize", title: "Get organized", blurb: "See income, buckets, and what’s left", icon: Wallet },
  { id: "debt", title: "Pay down debt faster", blurb: "Balance needs, wants, and extra payoff", icon: Target },
  { id: "save", title: "Save & invest more", blurb: "Tune savings vs lifestyle", icon: PiggyBank },
  { id: "exploring", title: "Just exploring", blurb: "Try 50/30/20 or zero-based", icon: Compass },
];

type Props = {
  onComplete: (answers: BudgetJourneyAnswers) => void;
  onSkipToDashboard: () => void;
};

export default function BudgetQuickJourney({ onComplete, onSkipToDashboard }: Props) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<BudgetJourneyAnswers>({ ...BUDGET_JOURNEY_DEFAULTS });

  const setField = useCallback(<K extends keyof BudgetJourneyAnswers>(key: K, value: BudgetJourneyAnswers[K]) => {
    setA((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = useCallback((): boolean => {
    if (step === 2) return a.incomeMonthly >= 500 && a.incomeMonthly <= 500_000;
    if (step === 4) return a.bufferPct >= 0 && a.bufferPct <= 0.25;
    return true;
  }, [step, a]);

  const finish = useCallback(() => onComplete({ ...a }), [a, onComplete]);

  const next = useCallback(() => {
    if (step >= TOTAL_STEPS - 1) {
      finish();
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  }, [step, finish]);

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/2 h-72 w-[56rem] -translate-x-1/2 rounded-full bg-zinc-900/[0.04] blur-3xl dark:bg-white/[0.06]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 flex items-center gap-2 sm:gap-3">
          <div className="flex-1 flex justify-start min-w-0">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
              Home
            </Link>
          </div>
          <div className="flex justify-center min-w-0 max-w-[min(100%,28rem)] px-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span className="leading-snug text-center">{FACTS_DECK_BUDGET_TEST}</span>
            </span>
          </div>
          <div className="flex-1 flex justify-end min-w-0">
            <button
              type="button"
              onClick={onSkipToDashboard}
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white underline-offset-2 hover:underline text-right"
            >
              Skip to full planner
            </button>
          </div>
        </div>
      </div>

      <div className="transition-opacity duration-300" key={step}>
        {step === 0 && (
          <WizardSlideShell
            layout="hero"
            seriesTitle={FACTS_DECK_BUDGET_TEST}
            stepIndex={0}
            totalSteps={TOTAL_STEPS}
            title=""
            showBack={false}
            onNext={next}
            nextLabel="Begin the test"
            secondaryLabel="Skip to Dashboard"
            onSecondary={onSkipToDashboard}
          >
            <div className="relative text-center">
              <div className="relative mx-auto mb-8 flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
                <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-emerald-400/35 via-sky-400/20 to-amber-300/25 blur-2xl dark:from-emerald-500/25 dark:via-sky-500/15 dark:to-amber-400/20" />
                <div className="absolute inset-2 rounded-[2.25rem] border border-dashed border-zinc-300/60 dark:border-zinc-600/50" />
                <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 rounded-[2rem] border border-zinc-200/90 bg-white/95 shadow-2xl ring-1 ring-zinc-900/5 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/95 dark:ring-white/10">
                  <div className="flex items-end justify-center gap-1">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-black tracking-tight text-white dark:bg-zinc-100 dark:text-zinc-900">
                      FD
                    </span>
                    <Wallet className="h-14 w-14 text-emerald-700 dark:text-emerald-400" strokeWidth={1.2} aria-hidden />
                    <PieChart className="h-8 w-8 text-sky-600 dark:text-sky-400" strokeWidth={1.25} aria-hidden />
                  </div>
                  <div className="flex gap-1" aria-hidden>
                    <span className="h-1.5 w-6 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    <span className="h-1.5 w-10 rounded-full bg-emerald-500/80" />
                    <span className="h-1.5 w-4 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  </div>
                </div>
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-emerald-700 dark:text-emerald-400/90">Facts Deck</p>
              <h1 className="font-display text-3xl font-bold leading-[1.12] tracking-tight text-zinc-900 text-balance dark:text-zinc-50 sm:text-5xl md:text-6xl">
                {FACTS_DECK_BUDGET_PLANNER}
              </h1>
              <p className="mt-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{FACTS_DECK_BUDGET_TEST}</p>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
                A few quick choices — then a snapshot of your monthly runway before you open the full budget workspace.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Buckets</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Buffer</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">50/30/20</span>
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 1 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_BUDGET_TEST}
            stepIndex={1}
            totalSteps={TOTAL_STEPS}
            title="What’s your main focus?"
            subtitle="We’ll tune labels on your snapshot — about a minute."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="grid gap-3 sm:gap-4">
              {GOALS.map((g) => {
                const Icon = g.icon;
                const on = a.goal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setField("goal", g.id)}
                    className={`text-left rounded-2xl border-2 p-5 transition-all ${
                      on
                        ? "border-zinc-900 bg-zinc-50 shadow-md dark:border-zinc-100 dark:bg-zinc-900/60"
                        : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          on ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <div>
                        <p className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50">{g.title}</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{g.blurb}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </WizardSlideShell>
        )}

        {step === 2 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_BUDGET_TEST}
            stepIndex={2}
            totalSteps={TOTAL_STEPS}
            title="Monthly take-home income"
            subtitle="After tax is best — use an average if it varies."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-4xl sm:text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                ${a.incomeMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
              <input
                type="range"
                min={1_000}
                max={30_000}
                step={100}
                value={Math.min(30_000, Math.max(1_000, a.incomeMonthly))}
                onChange={(e) => setField("incomeMonthly", Number(e.target.value))}
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
              <label className="block">
                <span className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Exact amount</span>
                <input
                  type="number"
                  min={500}
                  max={500_000}
                  step={50}
                  value={a.incomeMonthly}
                  onChange={(e) => setField("incomeMonthly", Number(e.target.value) || 0)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
            </div>
          </WizardSlideShell>
        )}

        {step === 3 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_BUDGET_TEST}
            stepIndex={3}
            totalSteps={TOTAL_STEPS}
            title="Budget style"
            subtitle="You can switch anytime in the full planner."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    id: "50-30-20" as const,
                    title: "50 / 30 / 20",
                    blurb: "Target split: needs / wants / savings+debt",
                  },
                  {
                    id: "zero-based" as const,
                    title: "Zero-based",
                    blurb: "Assign every dollar — aim remaining ≈ $0",
                  },
                ] as const
              ).map((opt) => {
                const on = a.mode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setField("mode", opt.id)}
                    className={`text-left rounded-2xl border-2 p-5 transition-all ${
                      on
                        ? "border-zinc-900 bg-zinc-50 shadow-md dark:border-zinc-100 dark:bg-zinc-900/60"
                        : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                    }`}
                  >
                    <p className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50">{opt.title}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">{opt.blurb}</p>
                  </button>
                );
              })}
            </div>
          </WizardSlideShell>
        )}

        {step === 4 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_BUDGET_TEST}
            stepIndex={4}
            totalSteps={TOTAL_STEPS}
            title="Buffer for surprises"
            subtitle="Money you don’t assign — helps when bills spike."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-4xl sm:text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {(a.bufferPct * 100).toFixed(1)}%
              </p>
              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                ≈ ${(a.incomeMonthly * a.bufferPct).toLocaleString("en-US", { maximumFractionDigits: 0 })} / mo
              </p>
              <input
                type="range"
                min={0}
                max={0.2}
                step={0.005}
                value={a.bufferPct}
                onChange={(e) => setField("bufferPct", Number(e.target.value))}
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
            </div>
          </WizardSlideShell>
        )}

        {step === 5 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_BUDGET_TEST}
            stepIndex={5}
            totalSteps={TOTAL_STEPS}
            title="Ready for your snapshot"
            subtitle="We’ll show how your income, buffer, and style fit together — then you can edit every line in the planner."
            onBack={back}
            onNext={finish}
            nextLabel="See my snapshot"
            variant="finish"
            nextDisabled={!canProceed()}
          >
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-left text-sm dark:border-zinc-700 dark:bg-zinc-900/50">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Summary</p>
              <ul className="mt-3 space-y-2 text-zinc-600 dark:text-zinc-300">
                <li>Income: ${a.incomeMonthly.toLocaleString()} / mo</li>
                <li>Buffer: {(a.bufferPct * 100).toFixed(1)}%</li>
                <li>Style: {a.mode === "50-30-20" ? "50/30/20" : "Zero-based"}</li>
              </ul>
            </div>
          </WizardSlideShell>
        )}
      </div>
    </div>
  );
}
