"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Home, RefreshCw, Sparkles, Compass } from "lucide-react";
import WizardSlideShell from "./WizardSlideShell";
import type { BuyerGoal, MortgageJourneyAnswers } from "./mortgage-journey-types";
import { FACTS_DECK_MORTGAGE_CALCULATOR, FACTS_DECK_MORTGAGE_TEST, JOURNEY_DEFAULTS } from "./mortgage-journey-types";

const TOTAL_STEPS = 6;

const GOALS: { id: BuyerGoal; title: string; blurb: string; icon: typeof Home }[] = [
  { id: "buying", title: "Buying a home", blurb: "First purchase or next move", icon: Home },
  { id: "refinancing", title: "Refinancing", blurb: "Lower rate or cash-out", icon: RefreshCw },
  { id: "exploring", title: "Just exploring", blurb: "See what numbers could look like", icon: Compass },
];

type Props = {
  onComplete: (answers: MortgageJourneyAnswers) => void;
  onSkipToDashboard: () => void;
};

export default function MortgageQuickJourney({ onComplete, onSkipToDashboard }: Props) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<MortgageJourneyAnswers>({ ...JOURNEY_DEFAULTS });

  const setField = useCallback(<K extends keyof MortgageJourneyAnswers>(key: K, value: MortgageJourneyAnswers[K]) => {
    setA((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = useCallback((): boolean => {
    if (step === 2) return a.homePrice >= 50_000 && a.homePrice <= 25_000_000;
    if (step === 3) return a.downPercent >= 0 && a.downPercent <= 100;
    if (step === 4) return a.rate >= 0.1 && a.rate <= 20 && a.termYears >= 10 && a.termYears <= 40;
    if (step === 5) return a.incomeMonthly >= 0;
    return true;
  }, [step, a]);

  const finish = useCallback(() => {
    onComplete({ ...a });
  }, [a, onComplete]);

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
              <span className="leading-snug text-center">{FACTS_DECK_MORTGAGE_TEST}</span>
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
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-black tracking-tight text-white shadow-inner dark:bg-zinc-100 dark:text-zinc-900">
                      FD
                    </span>
                    <Building2 className="h-14 w-14 text-emerald-700 dark:text-emerald-400" strokeWidth={1.25} aria-hidden />
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
                {FACTS_DECK_MORTGAGE_CALCULATOR}
              </h1>
              <p className="mt-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{FACTS_DECK_MORTGAGE_TEST}</p>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
                Five quick questions, then a personalized payment snapshot — before you open the full workspace.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">PITI</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">PMI</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Affordability</span>
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 1 && (
          <WizardSlideShell
            stepIndex={1}
            totalSteps={TOTAL_STEPS}
            title="What brings you here today?"
            subtitle="We’ll personalize labels and your summary — takes about a minute."
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
            stepIndex={2}
            totalSteps={TOTAL_STEPS}
            title="What’s the home price or target budget?"
            subtitle="Use your best guess — you can refine everything in the full calculator later."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-4xl sm:text-5xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
                  ${a.homePrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Drag the slider or type a value</p>
              </div>
              <input
                type="range"
                min={100_000}
                max={2_000_000}
                step={5000}
                value={Math.min(2_000_000, Math.max(100_000, a.homePrice))}
                onChange={(e) => setField("homePrice", Number(e.target.value))}
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
              <label className="block">
                <span className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Exact amount</span>
                <input
                  type="number"
                  min={50_000}
                  max={25_000_000}
                  step={1000}
                  value={a.homePrice}
                  onChange={(e) => setField("homePrice", Number(e.target.value) || 0)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
            </div>
          </WizardSlideShell>
        )}

        {step === 3 && (
          <WizardSlideShell
            stepIndex={3}
            totalSteps={TOTAL_STEPS}
            title="How much are you putting down?"
            subtitle="Under 20% usually means PMI — we’ll model that automatically."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20, 25].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setField("downPercent", pct)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors ${
                      a.downPercent === pct
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>Down payment</span>
                  <span className="tabular-nums">{a.downPercent.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={0.5}
                  value={a.downPercent}
                  onChange={(e) => setField("downPercent", Number(e.target.value))}
                  className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 4 && (
          <WizardSlideShell
            stepIndex={4}
            totalSteps={TOTAL_STEPS}
            title="Rate & loan length"
            subtitle="Market rates change — we’ll use your numbers for a snapshot."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>Interest rate (APR)</span>
                  <span className="tabular-nums">{a.rate.toFixed(2)}%</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={12}
                  step={0.125}
                  value={a.rate}
                  onChange={(e) => setField("rate", Number(e.target.value))}
                  className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-3">Term</p>
                <div className="flex flex-wrap gap-2">
                  {[15, 20, 30].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setField("termYears", y)}
                      className={`px-5 py-3 rounded-xl text-sm font-bold border-2 transition-colors ${
                        a.termYears === y
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                          : "border-zinc-200 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200"
                      }`}
                    >
                      {y} years
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 5 && (
          <WizardSlideShell
            stepIndex={5}
            totalSteps={TOTAL_STEPS}
            title="Income & extra toward principal"
            subtitle="Gross monthly household income helps us show a simple affordability check. Extra payment is optional."
            onBack={back}
            onNext={finish}
            nextLabel="See my estimate"
            variant="finish"
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  Gross monthly income
                </span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={a.incomeMonthly || ""}
                  onChange={(e) => setField("incomeMonthly", Number(e.target.value) || 0)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  Extra monthly principal (optional)
                </span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={a.extraMonthly || ""}
                  onChange={(e) => setField("extraMonthly", Number(e.target.value) || 0)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
            </div>
          </WizardSlideShell>
        )}
      </div>
    </div>
  );
}
