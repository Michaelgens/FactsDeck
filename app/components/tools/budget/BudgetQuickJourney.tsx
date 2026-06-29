"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, PieChart, PiggyBank, Sparkles, Target, Wallet, Compass, DoorOpen } from "lucide-react";
import WizardSlideShell from "../mortgage/WizardSlideShell";
import type { BudgetGoal, BudgetJourneyAnswers } from "./budget-journey-types";
import {
  BUDGET_JOURNEY_DEFAULTS,
  FACTS_DECK_BUDGET_PLANNER,
  FACTS_DECK_BUDGET_TEST,
} from "./budget-journey-types";
import { BUDGET_PLANNER_SLUG, trackToolEvent } from "../../../lib/tool-analytics-client";

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

  function clampNumber(n: number, lo: number, hi: number) {
    if (!Number.isFinite(n)) return lo;
    return Math.min(hi, Math.max(lo, n));
  }

  const canProceed = useCallback((): boolean => {
    if (step === 2) return a.incomeMonthly >= 500 && a.incomeMonthly <= 500_000;
    if (step === 4) return a.bufferPct >= 0 && a.bufferPct <= 0.25;
    return true;
  }, [step, a]);

  const finish = useCallback(() => onComplete({ ...a }), [a, onComplete]);

  useEffect(() => {
    trackToolEvent(BUDGET_PLANNER_SLUG, "journey_start", undefined, true);
  }, []);

  const next = useCallback(() => {
    if (step >= TOTAL_STEPS - 1) {
      finish();
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  }, [step, finish]);

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  return (
    <div className="relative overflow-x-hidden overflow-y-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Ambient layers */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[4rem_4rem] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[42rem] w-[min(90rem,200%)] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-200/35 via-orange-100/15 to-transparent blur-3xl dark:from-emerald-950/50 dark:via-blue-950/30 dark:to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-[28rem] right-[-10%] h-96 w-96 rounded-full bg-orange-100/30 blur-3xl dark:bg-cyan-950/25"
        aria-hidden
      />
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
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white underline-offset-2 hover:underline text-right inline-flex items-center gap-1.5"
            >
              <span className="sm:hidden flex items-center gap-2">
                <DoorOpen className="h-4 w-4 inline-block" aria-hidden />
                Skip
              </span>
              <span className="hidden sm:inline flex items-center gap-1">
                <DoorOpen className="h-4 w-4 inline-block mr-2" aria-hidden />
                Skip to full planner
              </span>
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
              <div className="relative mx-auto mb-10 flex items-center justify-center h-44 sm:h-48">
                {/* Background Glow */}
                <div className="pointer-events-none absolute -inset-8 rounded-full bg-gradient-to-br from-emerald-400/30 via-sky-400/20 to-amber-300/15 blur-3xl opacity-80 dark:from-emerald-500/25 dark:via-sky-500/20 dark:to-amber-400/15" />
                
                {/* Card Container */}
                <div className="relative flex flex-row items-center justify-center gap-7 sm:gap-10 rounded-[2.1rem] border border-zinc-200 bg-white/95 shadow-xl ring-1 ring-zinc-900/5 backdrop-blur-lg dark:border-zinc-700 dark:bg-zinc-950/90 dark:ring-white/10 px-8 py-4 sm:px-12 sm:py-6">
                  {/* Icon Row */}
                  <div className="flex items-end justify-center gap-4 sm:gap-5">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 flex items-center justify-center rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <img
                        src="/logo.png"
                        alt="Facts Deck"
                        className="h-14 w-14 sm:h-16 sm:w-16 object-contain"
                        style={{ minWidth: "3rem", minHeight: "3rem" }}
                      />
                    </div>
                    <div className="h-20 w-20 sm:h-24 sm:w-24 flex items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900 border border-emerald-200/60 dark:border-emerald-900/40">
                      <Wallet className="h-12 w-12 sm:h-14 sm:w-14 text-emerald-700 dark:text-emerald-400" strokeWidth={1.25} aria-hidden />
                    </div>
                    <div className="h-20 w-20 sm:h-24 sm:w-24 flex items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-900 border border-sky-200/60 dark:border-sky-900/40">
                      <PieChart className="h-12 w-12 sm:h-14 sm:w-14 text-sky-600 dark:text-sky-400" strokeWidth={1.3} aria-hidden />
                    </div>
                  </div>
                
                  {/* Progress style bar */}
                  <div className="absolute left-1/2 -bottom-8 sm:-bottom-10 -translate-x-1/2 flex gap-2" aria-hidden>
                    <span className="h-2 w-16 sm:w-20 rounded-full bg-zinc-300 dark:bg-zinc-600 opacity-80" />
                    <span className="h-2 w-20 sm:w-28 rounded-full bg-emerald-500/80" />
                    <span className="h-2 w-8 sm:w-10 rounded-full bg-zinc-300 dark:bg-zinc-600 opacity-80" />
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
                    className={`text-left rounded-2xl border-2 p-5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ${
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
                min={500}
                max={500_000}
                step={50}
                value={clampNumber(a.incomeMonthly, 500, 500_000)}
                onChange={(e) => setField("incomeMonthly", Number(e.target.value))}
                aria-label="Monthly take-home income"
                aria-valuetext={`$${Number(a.incomeMonthly).toLocaleString()}`}
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
                  onChange={(e) => setField("incomeMonthly", clampNumber(Number(e.target.value) || 0, 500, 500_000))}
                  aria-label="Exact monthly take-home income"
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
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
                    className={`text-left rounded-2xl border-2 p-5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ${
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
                max={0.25}
                step={0.005}
                value={clampNumber(a.bufferPct, 0, 0.25)}
                onChange={(e) => setField("bufferPct", Number(e.target.value))}
                aria-label="Buffer percentage for surprises"
                aria-valuetext={`${(Number(a.bufferPct) * 100).toFixed(1)}%`}
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
