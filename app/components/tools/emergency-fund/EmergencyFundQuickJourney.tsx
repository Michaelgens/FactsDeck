"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, Compass, Home, Shield, Sparkles, Umbrella } from "lucide-react";
import WizardSlideShell from "../mortgage/WizardSlideShell";
import type { EmergencyFundGoal, EmergencyFundJourneyAnswers } from "./emergency-fund-journey-types";
import {
  EMERGENCY_FUND_JOURNEY_DEFAULTS,
  FACTS_DECK_EMERGENCY_FUND_CALCULATOR,
  FACTS_DECK_EMERGENCY_FUND_TEST,
} from "./emergency-fund-journey-types";

const TOTAL_STEPS = 6;

const GOALS: { id: EmergencyFundGoal; title: string; blurb: string; icon: typeof Home }[] = [
  { id: "essentials", title: "Cover monthly essentials", blurb: "Rent, food, utilities, minimums", icon: Home },
  { id: "job_buffer", title: "Job-loss buffer", blurb: "Bridge between paychecks", icon: Briefcase },
  { id: "peace", title: "Peace of mind", blurb: "Sleep better with a cushion", icon: Shield },
  { id: "exploring", title: "Just exploring", blurb: "See runway and targets", icon: Compass },
];

type Props = {
  onComplete: (answers: EmergencyFundJourneyAnswers) => void;
  onSkipToDashboard: () => void;
};

export default function EmergencyFundQuickJourney({ onComplete, onSkipToDashboard }: Props) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<EmergencyFundJourneyAnswers>({ ...EMERGENCY_FUND_JOURNEY_DEFAULTS });

  const setField = useCallback(<K extends keyof EmergencyFundJourneyAnswers>(key: K, value: EmergencyFundJourneyAnswers[K]) => {
    setA((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = useCallback((): boolean => {
    if (step === 2) return a.monthlyEssentials >= 500 && a.monthlyEssentials <= 100_000;
    if (step === 3) return a.currentFund >= 0 && a.currentFund <= 5_000_000;
    if (step === 4) return a.monthlyContribution >= 0 && a.monthlyContribution <= 50_000;
    if (step === 5) return a.targetMonths >= 1 && a.targetMonths <= 36;
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
              <span className="leading-snug text-center">{FACTS_DECK_EMERGENCY_FUND_TEST}</span>
            </span>
          </div>
          <div className="flex-1 flex justify-end min-w-0">
            <button
              type="button"
              onClick={onSkipToDashboard}
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white underline-offset-2 hover:underline text-right"
            >
              Skip to full calculator
            </button>
          </div>
        </div>
      </div>

      <div className="transition-opacity duration-300" key={step}>
        {step === 0 && (
          <WizardSlideShell
            layout="hero"
            seriesTitle={FACTS_DECK_EMERGENCY_FUND_TEST}
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
                <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-sky-400/30 via-cyan-400/20 to-zinc-300/25 blur-2xl dark:from-sky-500/20 dark:via-cyan-500/15 dark:to-zinc-500/15" />
                <div className="absolute inset-2 rounded-[2.25rem] border border-dashed border-zinc-300/60 dark:border-zinc-600/50" />
                <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 rounded-[2rem] border border-zinc-200/90 bg-white/95 shadow-2xl ring-1 ring-zinc-900/5 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/95 dark:ring-white/10">
                  <div className="flex items-center justify-center gap-2">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-xs font-black tracking-tight text-white shadow-inner dark:bg-zinc-100 dark:text-zinc-900">
                      FD
                    </span>
                    <Umbrella className="h-14 w-14 text-sky-700 dark:text-sky-400" strokeWidth={1.2} aria-hidden />
                  </div>
                  <div className="flex h-8 w-full items-end justify-center gap-0.5 px-5" aria-hidden>
                    {[12, 20, 16, 24, 18].map((px, i) => (
                      <span
                        key={i}
                        className="w-1.5 rounded-sm bg-gradient-to-t from-zinc-300 to-sky-500 dark:from-zinc-600 dark:to-sky-400"
                        style={{ height: px }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-sky-800 dark:text-sky-400/90">Facts Deck</p>
              <h1 className="font-display text-2xl font-bold leading-[1.12] tracking-tight text-zinc-900 text-balance dark:text-zinc-50 sm:text-4xl md:text-5xl">
                {FACTS_DECK_EMERGENCY_FUND_CALCULATOR}
              </h1>
              <p className="mt-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{FACTS_DECK_EMERGENCY_FUND_TEST}</p>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
                Turn monthly essentials into runway months, a clear savings target, and an estimated time to fully fund
                it.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Runway</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Target</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Time to goal</span>
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 1 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_EMERGENCY_FUND_TEST}
            stepIndex={1}
            totalSteps={TOTAL_STEPS}
            title="What are you saving for?"
            subtitle="Labels only — the math is the same."
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
            seriesTitle={FACTS_DECK_EMERGENCY_FUND_TEST}
            stepIndex={2}
            totalSteps={TOTAL_STEPS}
            title="Monthly essential expenses"
            subtitle="Must-pay costs if income stopped: housing, food, utilities, minimums."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-4xl sm:text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                ${a.monthlyEssentials.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                <span className="text-lg font-semibold text-zinc-500">/mo</span>
              </p>
              <input
                type="range"
                min={1_000}
                max={20_000}
                step={100}
                value={Math.min(20_000, Math.max(1_000, a.monthlyEssentials))}
                onChange={(e) => setField("monthlyEssentials", Number(e.target.value))}
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
              <input
                type="number"
                min={500}
                max={200_000}
                step={50}
                value={a.monthlyEssentials}
                onChange={(e) => setField("monthlyEssentials", Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </WizardSlideShell>
        )}

        {step === 3 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_EMERGENCY_FUND_TEST}
            stepIndex={3}
            totalSteps={TOTAL_STEPS}
            title="Current emergency fund"
            subtitle="Cash you’d tap in a crisis (high-yield savings, etc.)."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-4xl sm:text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                ${a.currentFund.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
              <input
                type="range"
                min={0}
                max={200_000}
                step={500}
                value={Math.min(200_000, a.currentFund)}
                onChange={(e) => setField("currentFund", Number(e.target.value))}
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
              <input
                type="number"
                min={0}
                max={10_000_000}
                step={100}
                value={a.currentFund}
                onChange={(e) => setField("currentFund", Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </WizardSlideShell>
        )}

        {step === 4 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_EMERGENCY_FUND_TEST}
            stepIndex={4}
            totalSteps={TOTAL_STEPS}
            title="Monthly contribution"
            subtitle="How much you add to the fund each month (can be $0)."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-4xl sm:text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                ${a.monthlyContribution.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                <span className="text-lg font-semibold text-zinc-500">/mo</span>
              </p>
              <input
                type="range"
                min={0}
                max={5_000}
                step={25}
                value={Math.min(5_000, a.monthlyContribution)}
                onChange={(e) => setField("monthlyContribution", Number(e.target.value))}
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
              <input
                type="number"
                min={0}
                max={100_000}
                step={25}
                value={a.monthlyContribution}
                onChange={(e) => setField("monthlyContribution", Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </WizardSlideShell>
        )}

        {step === 5 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_EMERGENCY_FUND_TEST}
            stepIndex={5}
            totalSteps={TOTAL_STEPS}
            title="Target runway"
            subtitle="How many months of essential spending you want banked."
            onBack={back}
            onNext={finish}
            nextLabel="See my snapshot"
            variant="finish"
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <div className="flex flex-wrap justify-center gap-2">
                {[3, 6, 9, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setField("targetMonths", m)}
                    className={`px-5 py-3 rounded-xl text-sm font-bold border-2 transition-colors ${
                      a.targetMonths === m
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200"
                    }`}
                  >
                    {m} mo
                  </button>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>Custom (months)</span>
                  <span className="tabular-nums">{a.targetMonths}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={24}
                  step={1}
                  value={Math.min(24, Math.max(1, a.targetMonths))}
                  onChange={(e) => setField("targetMonths", Number(e.target.value))}
                  className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
            </div>
          </WizardSlideShell>
        )}
      </div>
    </div>
  );
}
