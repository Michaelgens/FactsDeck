"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Coins, Compass, Sparkles, Zap } from "lucide-react";
import WizardSlideShell from "../mortgage/WizardSlideShell";
import type { CompoundingMode, CryptoYieldGoal, CryptoYieldJourneyAnswers } from "./crypto-yield-journey-types";
import {
  CRYPTO_YIELD_JOURNEY_DEFAULTS,
  FACTS_DECK_CRYPTO_YIELD_LAB,
  FACTS_DECK_CRYPTO_YIELD_TEST,
} from "./crypto-yield-journey-types";

const TOTAL_STEPS = 5;

const GOALS: { id: CryptoYieldGoal; title: string; blurb: string; icon: typeof Coins }[] = [
  { id: "compounding", title: "See compounding", blurb: "How often rewards restake matters", icon: Zap },
  { id: "compare", title: "Compare frequencies", blurb: "Daily vs monthly vs annual (same headline %)", icon: Coins },
  { id: "exploring", title: "Just exploring", blurb: "Play with APY and time", icon: Compass },
];

const COMP_LABEL: Record<CompoundingMode, string> = {
  daily: "Daily",
  monthly: "Monthly",
  annual: "Annual",
};

type Props = {
  onComplete: (answers: CryptoYieldJourneyAnswers) => void;
  onSkipToDashboard: () => void;
};

export default function CryptoYieldQuickJourney({ onComplete, onSkipToDashboard }: Props) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<CryptoYieldJourneyAnswers>({ ...CRYPTO_YIELD_JOURNEY_DEFAULTS });

  const setField = useCallback(<K extends keyof CryptoYieldJourneyAnswers>(key: K, value: CryptoYieldJourneyAnswers[K]) => {
    setA((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = useCallback((): boolean => {
    if (step === 2) return a.principal >= 10 && a.principal <= 500_000 && a.apyPercent >= 0 && a.apyPercent <= 100;
    if (step === 3) return a.months >= 1 && a.months <= 360;
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
              <span className="leading-snug text-center">{FACTS_DECK_CRYPTO_YIELD_TEST}</span>
            </span>
          </div>
          <div className="flex-1 flex justify-end min-w-0">
            <button
              type="button"
              onClick={onSkipToDashboard}
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white underline-offset-2 hover:underline text-right"
            >
              Skip to full lab
            </button>
          </div>
        </div>
      </div>

      <div className="transition-opacity duration-300" key={step}>
        {step === 0 && (
          <WizardSlideShell
            layout="hero"
            seriesTitle={FACTS_DECK_CRYPTO_YIELD_TEST}
            stepIndex={0}
            totalSteps={TOTAL_STEPS}
            title=""
            showBack={false}
            onNext={next}
            nextLabel="Open the lab"
            secondaryLabel="Skip to workspace"
            onSecondary={onSkipToDashboard}
          >
            <div className="relative text-center">
              <div className="relative mx-auto mb-8 flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
                <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-emerald-400/35 via-sky-400/20 to-amber-300/25 blur-2xl dark:from-emerald-500/25 dark:via-sky-500/15 dark:to-amber-400/20" />
                <div className="absolute inset-2 rounded-[2.25rem] border border-dashed border-zinc-300/60 dark:border-zinc-600/50" />
                <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 rounded-[2rem] border border-zinc-200/90 bg-white/95 shadow-2xl ring-1 ring-zinc-900/5 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/95 dark:ring-white/10">
                  <div className="flex items-center justify-center gap-2">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-xs font-black tracking-tight text-white shadow-inner dark:bg-zinc-100 dark:text-zinc-900">
                      FD
                    </span>
                    <Coins className="h-14 w-14 text-amber-700 dark:text-amber-400" strokeWidth={1.2} aria-hidden />
                  </div>
                  <div className="flex gap-1" aria-hidden>
                    <span className="h-1.5 w-8 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    <span className="h-1.5 w-12 rounded-full bg-amber-500/80" />
                    <span className="h-1.5 w-5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  </div>
                </div>
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-amber-800 dark:text-amber-400/90">Facts Deck</p>
              <h1 className="font-display text-3xl font-bold leading-[1.12] tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl md:text-6xl">
                {FACTS_DECK_CRYPTO_YIELD_LAB}
              </h1>
              <p className="mt-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{FACTS_DECK_CRYPTO_YIELD_TEST}</p>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
                Compound the same headline APY on different schedules—learn why “APY” isn’t one number in real life.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Staking literacy</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Compounding</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Not price prediction</span>
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 1 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_CRYPTO_YIELD_TEST}
            stepIndex={1}
            totalSteps={TOTAL_STEPS}
            title="What do you want to explore?"
            subtitle="You can switch everything in the full lab."
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
            seriesTitle={FACTS_DECK_CRYPTO_YIELD_TEST}
            stepIndex={2}
            totalSteps={TOTAL_STEPS}
            title="Principal & headline APY"
            subtitle="We treat this as a nominal annual rate for math—not a promise from any protocol."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-8">
              <div>
                <p className="text-center text-3xl sm:text-4xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                  ${a.principal.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </p>
                <input
                  type="range"
                  min={100}
                  max={50_000}
                  step={50}
                  value={Math.min(50_000, Math.max(100, a.principal))}
                  onChange={(e) => setField("principal", Number(e.target.value))}
                  className="mt-4 w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
              <div>
                <p className="text-center text-4xl sm:text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{a.apyPercent.toFixed(2)}%</p>
                <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-1">Nominal APY (illustrative)</p>
                <input
                  type="range"
                  min={0}
                  max={25}
                  step={0.1}
                  value={a.apyPercent}
                  onChange={(e) => setField("apyPercent", Number(e.target.value))}
                  className="mt-4 w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 3 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_CRYPTO_YIELD_TEST}
            stepIndex={3}
            totalSteps={TOTAL_STEPS}
            title="Time & compounding"
            subtitle="How often rewards are notionally reinvested in this model."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>Horizon (months)</span>
                  <span className="tabular-nums">{a.months} mo</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={60}
                  step={1}
                  value={a.months}
                  onChange={(e) => setField("months", Number(e.target.value))}
                  className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Compounding</p>
                <div className="flex flex-wrap gap-2">
                  {(["daily", "monthly", "annual"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setField("compounding", c)}
                      className={`rounded-full px-4 py-2 text-sm font-bold border transition-colors ${
                        a.compounding === c
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                          : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-500"
                      }`}
                    >
                      {COMP_LABEL[c]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 4 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_CRYPTO_YIELD_TEST}
            stepIndex={4}
            totalSteps={TOTAL_STEPS}
            title="Ready to see yields"
            subtitle="Next: ending balance, interest, and a frequency comparison—then the full lab for APR↔APY."
            onBack={back}
            onNext={finish}
            nextLabel="Show results"
            variant="finish"
            nextDisabled={!canProceed()}
          >
            <p className="text-center text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              No protocol fees, slashing, smart-contract risk, or taxes modeled—pure time-value sandbox.
            </p>
          </WizardSlideShell>
        )}
      </div>
    </div>
  );
}
