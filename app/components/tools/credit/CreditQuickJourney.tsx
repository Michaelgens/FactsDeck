"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, BookOpen, Compass, Sparkles, TrendingUp } from "lucide-react";
import WizardSlideShell from "../mortgage/WizardSlideShell";
import type { CreditJourneyGoal, CreditJourneyAnswers } from "./credit-journey-types";
import {
  CREDIT_JOURNEY_DEFAULTS,
  FACTS_DECK_CREDIT_SCORE_SIMULATOR,
  FACTS_DECK_CREDIT_TEST,
} from "./credit-journey-types";

const TOTAL_STEPS = 6;

const GOALS: { id: CreditJourneyGoal; title: string; blurb: string; icon: typeof TrendingUp }[] = [
  { id: "improve", title: "Improve my score", blurb: "See what moves the needle", icon: TrendingUp },
  { id: "learn", title: "Learn the factors", blurb: "Weights, tradeoffs, habits", icon: BookOpen },
  { id: "exploring", title: "Just exploring", blurb: "Play with the model", icon: Compass },
];

type Props = {
  onComplete: (answers: CreditJourneyAnswers) => void;
  onSkipToDashboard: () => void;
};

export default function CreditQuickJourney({ onComplete, onSkipToDashboard }: Props) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<CreditJourneyAnswers>({ ...CREDIT_JOURNEY_DEFAULTS });

  const setField = useCallback(<K extends keyof CreditJourneyAnswers>(key: K, value: CreditJourneyAnswers[K]) => {
    setA((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = useCallback((): boolean => {
    if (step === 2) return a.utilizationPct >= 0 && a.utilizationPct <= 100;
    if (step === 3) return a.onTimePct >= 0 && a.onTimePct <= 100;
    if (step === 4) return a.avgAgeYears >= 0 && a.avgAgeYears <= 30;
    if (step === 5)
      return a.hardInquiries12m >= 0 && a.hardInquiries12m <= 20 && a.accountTypes >= 1 && a.accountTypes <= 6;
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
              <span className="leading-snug text-center">{FACTS_DECK_CREDIT_TEST}</span>
            </span>
          </div>
          <div className="flex-1 flex justify-end min-w-0">
            <button
              type="button"
              onClick={onSkipToDashboard}
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white underline-offset-2 hover:underline text-right"
            >
              Skip to full simulator
            </button>
          </div>
        </div>
      </div>

      <div className="transition-opacity duration-300" key={step}>
        {step === 0 && (
          <WizardSlideShell
            layout="hero"
            seriesTitle={FACTS_DECK_CREDIT_TEST}
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
                <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-zinc-400/30 via-zinc-300/20 to-zinc-500/25 blur-2xl dark:from-zinc-500/20 dark:via-zinc-600/15 dark:to-zinc-400/15" />
                <div className="absolute inset-2 rounded-[2.25rem] border border-dashed border-zinc-300/60 dark:border-zinc-600/50" />
                <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 rounded-[2rem] border border-zinc-200/90 bg-white/95 shadow-2xl ring-1 ring-zinc-900/5 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/95 dark:ring-white/10">
                  <div className="flex items-center justify-center gap-2">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-xs font-black tracking-tight text-white shadow-inner dark:bg-zinc-100 dark:text-zinc-900">
                      FD
                    </span>
                    <Activity className="h-14 w-14 text-zinc-800 dark:text-zinc-100" strokeWidth={1.2} aria-hidden />
                  </div>
                  <div className="flex h-8 w-full items-end justify-center gap-0.5 px-4" aria-hidden>
                    {[10, 18, 14, 22, 16].map((px, i) => (
                      <span
                        key={i}
                        className="w-1.5 rounded-sm bg-zinc-300 dark:bg-zinc-600"
                        style={{ height: px }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-zinc-600 dark:text-zinc-400">Facts Deck</p>
              <h1 className="font-display text-3xl font-bold leading-[1.12] tracking-tight text-zinc-900 text-balance dark:text-zinc-50 sm:text-5xl md:text-6xl">
                {FACTS_DECK_CREDIT_SCORE_SIMULATOR}
              </h1>
              <p className="mt-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{FACTS_DECK_CREDIT_TEST}</p>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
                Illustrative score only — not a real bureau score. A quick path to see how habits might move the
                needle, then explore presets and what-ifs in the full simulator.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Utilization</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Payment history</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Inquiries</span>
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 1 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_CREDIT_TEST}
            stepIndex={1}
            totalSteps={TOTAL_STEPS}
            title="What brings you here?"
            subtitle="Labels only — the model is the same for everyone."
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
            seriesTitle={FACTS_DECK_CREDIT_TEST}
            stepIndex={2}
            totalSteps={TOTAL_STEPS}
            title="Revolving utilization"
            subtitle="Balance ÷ limits on cards — lower often helps in real scores."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-4xl sm:text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {a.utilizationPct}%
              </p>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={a.utilizationPct}
                onChange={(e) => setField("utilizationPct", Number(e.target.value))}
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
            </div>
          </WizardSlideShell>
        )}

        {step === 3 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_CREDIT_TEST}
            stepIndex={3}
            totalSteps={TOTAL_STEPS}
            title="On-time payment history"
            subtitle="Percent of payments on time (illustrative)."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-4xl sm:text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {a.onTimePct}%
              </p>
              <input
                type="range"
                min={50}
                max={100}
                step={1}
                value={a.onTimePct}
                onChange={(e) => setField("onTimePct", Number(e.target.value))}
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
            </div>
          </WizardSlideShell>
        )}

        {step === 4 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_CREDIT_TEST}
            stepIndex={4}
            totalSteps={TOTAL_STEPS}
            title="Average age of accounts"
            subtitle="Years — older history often helps."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-4xl sm:text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {a.avgAgeYears.toFixed(1)} yr
              </p>
              <input
                type="range"
                min={0}
                max={25}
                step={0.5}
                value={a.avgAgeYears}
                onChange={(e) => setField("avgAgeYears", Number(e.target.value))}
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
            </div>
          </WizardSlideShell>
        )}

        {step === 5 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_CREDIT_TEST}
            stepIndex={5}
            totalSteps={TOTAL_STEPS}
            title="Inquiries & mix"
            subtitle="Hard inquiries (12 mo) and number of account types."
            onBack={back}
            onNext={finish}
            nextLabel="See my snapshot"
            variant="finish"
            nextDisabled={!canProceed()}
          >
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>Hard inquiries (12 months)</span>
                  <span className="tabular-nums">{a.hardInquiries12m}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={1}
                  value={a.hardInquiries12m}
                  onChange={(e) => setField("hardInquiries12m", Number(e.target.value))}
                  className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>Account types (1–6)</span>
                  <span className="tabular-nums">{a.accountTypes}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  value={a.accountTypes}
                  onChange={(e) => setField("accountTypes", Number(e.target.value))}
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
