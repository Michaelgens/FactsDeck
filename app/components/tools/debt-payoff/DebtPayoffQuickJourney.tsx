"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, GitCompare, Layers, Sparkles, TrendingDown } from "lucide-react";
import WizardSlideShell from "../mortgage/WizardSlideShell";
import type { DebtPayoffGoal, DebtJourneyAnswers } from "./debt-payoff-journey-types";
import {
  DEBT_PAYOFF_JOURNEY_DEFAULTS,
  FACTS_DECK_DEBT_PAYOFF_PLANNER,
  FACTS_DECK_DEBT_PAYOFF_TEST,
} from "./debt-payoff-journey-types";

const TOTAL_STEPS = 6;

const GOALS: { id: DebtPayoffGoal; title: string; blurb: string; icon: typeof Layers }[] = [
  { id: "snowball", title: "Snowball", blurb: "Knock out smallest balances first", icon: Layers },
  { id: "avalanche", title: "Avalanche", blurb: "Tackle highest APR first", icon: TrendingDown },
  { id: "compare", title: "Compare both", blurb: "See months & interest side by side", icon: GitCompare },
  { id: "exploring", title: "Just exploring", blurb: "Quick what-if numbers", icon: Compass },
];

type Props = {
  onComplete: (answers: DebtJourneyAnswers) => void;
  onSkipToDashboard: () => void;
};

export default function DebtPayoffQuickJourney({ onComplete, onSkipToDashboard }: Props) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<DebtJourneyAnswers>({ ...DEBT_PAYOFF_JOURNEY_DEFAULTS });

  const setField = useCallback(<K extends keyof DebtJourneyAnswers>(key: K, value: DebtJourneyAnswers[K]) => {
    setA((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = useCallback((): boolean => {
    if (step === 2)
      return a.debt1Balance >= 100 && a.debt1Balance <= 200_000 && a.debt1Apr >= 0 && a.debt1Apr <= 36 && a.debt1Min >= 0 && a.debt1Min <= 5_000;
    if (step === 3)
      return a.debt2Balance >= 100 && a.debt2Balance <= 200_000 && a.debt2Apr >= 0 && a.debt2Apr <= 36 && a.debt2Min >= 0 && a.debt2Min <= 5_000;
    if (step === 4) return a.extraMonthly >= 0 && a.extraMonthly <= 10_000;
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
          <div className="absolute -top-24 left-1/2 h-72 w-[56rem] -translate-x-1/2 rounded-full bg-emerald-500/[0.06] blur-3xl dark:bg-emerald-400/[0.07]" />
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
              <span className="leading-snug text-center">{FACTS_DECK_DEBT_PAYOFF_TEST}</span>
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
            seriesTitle={FACTS_DECK_DEBT_PAYOFF_TEST}
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
                <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-emerald-400/30 via-teal-400/15 to-zinc-400/20 blur-2xl dark:from-emerald-500/20 dark:via-teal-500/10" />
                <div className="absolute inset-2 rounded-[2.25rem] border border-dashed border-zinc-300/60 dark:border-zinc-600/50" />
                <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 rounded-[2rem] border border-zinc-200/90 bg-white/95 shadow-2xl ring-1 ring-zinc-900/5 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/95 dark:ring-white/10">
                  <div className="flex items-center justify-center gap-2">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-xs font-black tracking-tight text-white shadow-inner dark:bg-zinc-100 dark:text-zinc-900">
                      FD
                    </span>
                    <Layers className="h-14 w-14 text-emerald-700 dark:text-emerald-400" strokeWidth={1.2} aria-hidden />
                  </div>
                  <div className="flex gap-1" aria-hidden>
                    <span className="h-1.5 w-8 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    <span className="h-1.5 w-12 rounded-full bg-emerald-500/80" />
                    <span className="h-1.5 w-5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  </div>
                </div>
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-emerald-800 dark:text-emerald-400/90">Facts Deck</p>
              <h1 className="font-display text-3xl font-bold leading-[1.12] tracking-tight text-zinc-900 text-balance dark:text-zinc-50 sm:text-5xl md:text-6xl">
                {FACTS_DECK_DEBT_PAYOFF_PLANNER}
              </h1>
              <p className="mt-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{FACTS_DECK_DEBT_PAYOFF_TEST}</p>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
                Two debts, minimums, and extra cash—see how snowball vs avalanche changes payoff time and interest.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Snowball</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Avalanche</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Compare</span>
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 1 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_DEBT_PAYOFF_TEST}
            stepIndex={1}
            totalSteps={TOTAL_STEPS}
            title="What do you want to see?"
            subtitle="You can switch strategies anytime in the full planner."
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
            seriesTitle={FACTS_DECK_DEBT_PAYOFF_TEST}
            stepIndex={2}
            totalSteps={TOTAL_STEPS}
            title="Debt 1"
            subtitle="Balance, APR, and minimum payment (monthly)."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-3xl sm:text-4xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                ${a.debt1Balance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
              <input
                type="range"
                min={500}
                max={50_000}
                step={100}
                value={Math.min(50_000, Math.max(500, a.debt1Balance))}
                onChange={(e) => setField("debt1Balance", Number(e.target.value))}
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-zinc-500">APR %</span>
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    max={36}
                    value={a.debt1Apr}
                    onChange={(e) => setField("debt1Apr", Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 font-semibold dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-zinc-500">Minimum / mo</span>
                  <input
                    type="number"
                    min={0}
                    max={5000}
                    step={5}
                    value={a.debt1Min}
                    onChange={(e) => setField("debt1Min", Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 font-semibold dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 3 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_DEBT_PAYOFF_TEST}
            stepIndex={3}
            totalSteps={TOTAL_STEPS}
            title="Debt 2"
            subtitle="Second balance — often a lower-rate loan or card."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-3xl sm:text-4xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                ${a.debt2Balance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
              <input
                type="range"
                min={500}
                max={80_000}
                step={100}
                value={Math.min(80_000, Math.max(500, a.debt2Balance))}
                onChange={(e) => setField("debt2Balance", Number(e.target.value))}
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-zinc-500">APR %</span>
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    max={36}
                    value={a.debt2Apr}
                    onChange={(e) => setField("debt2Apr", Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 font-semibold dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-zinc-500">Minimum / mo</span>
                  <input
                    type="number"
                    min={0}
                    max={5000}
                    step={5}
                    value={a.debt2Min}
                    onChange={(e) => setField("debt2Min", Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 font-semibold dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 4 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_DEBT_PAYOFF_TEST}
            stepIndex={4}
            totalSteps={TOTAL_STEPS}
            title="Extra toward debt"
            subtitle="On top of all minimums, each month."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-4xl sm:text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                ${a.extraMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
              <input
                type="range"
                min={0}
                max={3_000}
                step={25}
                value={Math.min(3_000, a.extraMonthly)}
                onChange={(e) => setField("extraMonthly", Number(e.target.value))}
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
              <input
                type="number"
                min={0}
                max={10_000}
                step={25}
                value={a.extraMonthly}
                onChange={(e) => setField("extraMonthly", Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </WizardSlideShell>
        )}

        {step === 5 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_DEBT_PAYOFF_TEST}
            stepIndex={5}
            totalSteps={TOTAL_STEPS}
            title="Ready for your snapshot"
            subtitle="Snowball vs avalanche — then open the full planner for more debts and exports."
            onBack={back}
            onNext={finish}
            nextLabel="See my snapshot"
            variant="finish"
            nextDisabled={!canProceed()}
          >
            <p className="text-center text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              We’ll compare payoff months and total interest. Minimums + extra are applied the same way in both strategies—only
              the order of attack changes.
            </p>
          </WizardSlideShell>
        )}
      </div>
    </div>
  );
}
