"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, DoorOpen, Flame, Sparkles, TrendingUp, Wallet } from "lucide-react";
import WizardSlideShell from "../mortgage/WizardSlideShell";
import {
  FACTS_DECK_INVESTMENT_CALCULATOR,
  FACTS_DECK_INVESTMENT_TEST,
  INVESTMENT_JOURNEY_DEFAULTS,
  type InvestmentGoal,
  type InvestmentJourneyAnswers,
} from "./investment-journey-types";
import { INVESTMENT_SLUG, trackToolEvent } from "../../../lib/tool-analytics-client";

const TOTAL_STEPS = 6;
const SERIES = FACTS_DECK_INVESTMENT_TEST;

const GOALS: { id: InvestmentGoal; title: string; blurb: string; icon: typeof TrendingUp }[] = [
  { id: "wealth", title: "Build long-term wealth", blurb: "Grow a portfolio with steady contributions", icon: TrendingUp },
  { id: "fire", title: "Retirement / FIRE", blurb: "Estimate a path toward financial independence", icon: Flame },
  { id: "exploring", title: "Just exploring", blurb: "See how compounding might look", icon: Wallet },
];

type Props = {
  onComplete: (answers: InvestmentJourneyAnswers) => void;
  onSkipToDashboard: () => void;
};

export default function InvestmentQuickJourney({ onComplete, onSkipToDashboard }: Props) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<InvestmentJourneyAnswers>({ ...INVESTMENT_JOURNEY_DEFAULTS });

  const setField = useCallback(<K extends keyof InvestmentJourneyAnswers>(key: K, value: InvestmentJourneyAnswers[K]) => {
    setA((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = useCallback((): boolean => {
    if (step === 2) return a.initial >= 0 && a.initial <= 500_000_000;
    if (step === 3) return a.monthly >= 0;
    if (step === 4) return a.years >= 5 && a.years <= 45 && a.nominal >= 0 && a.nominal <= 20;
    if (step === 5) return a.annualSpend >= 0 && a.swr >= 1 && a.swr <= 10 && a.inflation >= 0 && a.inflation <= 10;
    return true;
  }, [step, a]);

  const finish = useCallback(() => onComplete({ ...a }), [a, onComplete]);

  const next = useCallback(() => {
    if (step === 0) {
      trackToolEvent(INVESTMENT_SLUG, "journey_start", undefined, true);
    }
    if (step >= TOTAL_STEPS - 1) {
      finish();
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  }, [step, finish]);

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  return (
    <div className="relative overflow-x-hidden overflow-y-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[4rem_4rem] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[42rem] w-[min(90rem,200%)] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-200/35 via-orange-100/15 to-transparent blur-3xl dark:from-violet-950/50 dark:via-fuchsia-950/30 dark:to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-[28rem] right-[-10%] h-96 w-96 rounded-full bg-orange-100/30 blur-3xl dark:bg-amber-950/25"
        aria-hidden
      />

      <div className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/2 h-72 w-[56rem] -translate-x-1/2 rounded-full bg-violet-500/[0.06] blur-3xl dark:bg-violet-400/[0.08]" />
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
              <span className="leading-snug text-center">{SERIES}</span>
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
                Skip to full calculator
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="transition-opacity duration-300" key={step}>
        {step === 0 && (
          <WizardSlideShell
            layout="hero"
            seriesTitle={SERIES}
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
                <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-violet-400/30 via-fuchsia-400/15 to-amber-400/20 blur-2xl dark:from-violet-500/20 dark:via-fuchsia-500/10" />
                <div className="absolute inset-2 rounded-[2.25rem] border border-dashed border-violet-300/60 dark:border-violet-600/50" />
                <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 rounded-[2rem] border border-zinc-200/90 bg-white/95 shadow-2xl ring-1 ring-violet-900/5 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/95 dark:ring-violet-400/10">
                  <BarChart3 className="h-16 w-16 text-violet-700 dark:text-violet-400" strokeWidth={1.2} aria-hidden />
                </div>
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-violet-800 dark:text-violet-400/90">Facts Deck</p>
              <h1 className="font-display text-2xl font-bold leading-[1.12] tracking-tight text-zinc-900 text-balance dark:text-zinc-50 sm:text-4xl md:text-5xl">
                {FACTS_DECK_INVESTMENT_CALCULATOR}
              </h1>
              <p className="mt-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{FACTS_DECK_INVESTMENT_TEST}</p>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
                A short guided path to a compounding snapshot — then unlock the full workspace to refine fees, scenarios, and goals.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Growth</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">FIRE</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Inflation</span>
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 1 && (
          <WizardSlideShell
            seriesTitle={SERIES}
            stepIndex={1}
            totalSteps={TOTAL_STEPS}
            title="What's your main focus?"
            subtitle="We'll tune labels on your results — about a minute."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
            nextLabel="Continue"
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
                    aria-pressed={on}
                    className={`text-left rounded-2xl border-2 p-5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 ${
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
            seriesTitle={SERIES}
            stepIndex={2}
            totalSteps={TOTAL_STEPS}
            title="Starting balance"
            subtitle="Current invested amount in this scenario (401(k), brokerage, etc.)."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-4xl sm:text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                ${a.initial.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
              <input
                type="range"
                min={0}
                max={500_000}
                step={1000}
                value={Math.min(500_000, a.initial)}
                onChange={(e) => setField("initial", Number(e.target.value))}
                aria-label="Starting balance"
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
              <label className="block">
                <span className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Exact amount</span>
                <input
                  type="number"
                  min={0}
                  max={500_000_000}
                  step={100}
                  value={a.initial}
                  onChange={(e) => setField("initial", Number(e.target.value) || 0)}
                  aria-label="Exact starting balance"
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
            </div>
          </WizardSlideShell>
        )}

        {step === 3 && (
          <WizardSlideShell
            seriesTitle={SERIES}
            stepIndex={3}
            totalSteps={TOTAL_STEPS}
            title="Monthly contribution"
            subtitle="How much you plan to add each month on average."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-4xl sm:text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                ${a.monthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                <span className="text-lg font-semibold text-zinc-500">/mo</span>
              </p>
              <input
                type="range"
                min={0}
                max={15_000}
                step={50}
                value={Math.min(15_000, a.monthly)}
                onChange={(e) => setField("monthly", Number(e.target.value))}
                aria-label="Monthly contribution"
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
              <input
                type="number"
                min={0}
                max={500_000}
                step={50}
                value={a.monthly}
                onChange={(e) => setField("monthly", Number(e.target.value) || 0)}
                aria-label="Exact monthly contribution"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </WizardSlideShell>
        )}

        {step === 4 && (
          <WizardSlideShell
            seriesTitle={SERIES}
            stepIndex={4}
            totalSteps={TOTAL_STEPS}
            title="Horizon & expected return"
            subtitle="Illustrative nominal return before fund fees — you'll refine fees in the full tool."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>Years</span>
                  <span className="tabular-nums">{a.years} yr</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={45}
                  step={1}
                  value={a.years}
                  onChange={(e) => setField("years", Number(e.target.value))}
                  aria-label="Investment horizon in years"
                  className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>Expected nominal return (before fees)</span>
                  <span className="tabular-nums">{a.nominal.toFixed(2)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={14}
                  step={0.25}
                  value={a.nominal}
                  onChange={(e) => setField("nominal", Number(e.target.value))}
                  aria-label="Expected nominal return percent"
                  className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 5 && (
          <WizardSlideShell
            seriesTitle={SERIES}
            stepIndex={5}
            totalSteps={TOTAL_STEPS}
            title="Spending, withdrawal rule & inflation"
            subtitle="Used for FIRE-style targets and today's dollars. Expense ratio is fixed at 0.08% for this snapshot."
            onBack={back}
            onNext={finish}
            nextLabel="See my snapshot"
            variant="finish"
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  Annual spending (today&apos;s dollars)
                </span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={a.annualSpend || ""}
                  onChange={(e) => setField("annualSpend", Number(e.target.value) || 0)}
                  aria-label="Annual spending"
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400 mb-2">Withdrawal rate (SWR)</p>
                <div className="flex flex-wrap gap-2">
                  {[3, 3.5, 4, 4.5].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setField("swr", pct)}
                      aria-pressed={a.swr === pct}
                      className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 ${
                        a.swr === pct
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                          : "border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>Inflation</span>
                  <span className="tabular-nums">{a.inflation.toFixed(2)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={8}
                  step={0.1}
                  value={a.inflation}
                  onChange={(e) => setField("inflation", Number(e.target.value))}
                  aria-label="Inflation percent"
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
