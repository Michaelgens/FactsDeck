"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Gem, Map, Sparkles, Telescope } from "lucide-react";
import WizardSlideShell from "../mortgage/WizardSlideShell";
import type { FiSnapshotGoal, FiSnapshotJourneyAnswers } from "./fi-snapshot-journey-types";
import {
  FI_SNAPSHOT_JOURNEY_DEFAULTS,
  FACTS_DECK_FI_SNAPSHOT_TOOL,
  FACTS_DECK_FI_SNAPSHOT_TEST,
} from "./fi-snapshot-journey-types";

const TOTAL_STEPS = 6;

const GOALS: { id: FiSnapshotGoal; title: string; blurb: string; icon: typeof Gem }[] = [
  { id: "freedom", title: "Freedom runway", blurb: "I want the math for walking away on my terms", icon: Telescope },
  { id: "clarity", title: "Clarity", blurb: "I need one honest snapshot of where I stand", icon: Map },
  { id: "milestone", title: "Milestone check", blurb: "I’m comparing this year to last", icon: Gem },
  { id: "exploring", title: "Just exploring", blurb: "Curious what FI might look like", icon: Compass },
];

type Props = {
  onComplete: (answers: FiSnapshotJourneyAnswers) => void;
  onSkipToDashboard: () => void;
};

export default function FiSnapshotQuickJourney({ onComplete, onSkipToDashboard }: Props) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<FiSnapshotJourneyAnswers>({ ...FI_SNAPSHOT_JOURNEY_DEFAULTS });

  const setField = useCallback(<K extends keyof FiSnapshotJourneyAnswers>(key: K, value: FiSnapshotJourneyAnswers[K]) => {
    setA((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = useCallback((): boolean => {
    if (step === 2)
      return a.liquidCash >= 0 && a.liquidCash <= 2_000_000 && a.invested >= 0 && a.invested <= 5_000_000;
    if (step === 3)
      return a.otherAssets >= 0 && a.otherAssets <= 5_000_000 && a.liabilities >= 0 && a.liabilities <= 3_000_000;
    if (step === 4)
      return a.monthlyExpenses >= 500 && a.monthlyExpenses <= 50_000 && a.monthlyInvesting >= 0 && a.monthlyInvesting <= 50_000;
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
              <span className="leading-snug text-center">{FACTS_DECK_FI_SNAPSHOT_TEST}</span>
            </span>
          </div>
          <div className="flex-1 flex justify-end min-w-0">
            <button
              type="button"
              onClick={onSkipToDashboard}
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white underline-offset-2 hover:underline text-right"
            >
              Skip to full snapshot
            </button>
          </div>
        </div>
      </div>

      <div className="transition-opacity duration-300" key={step}>
        {step === 0 && (
          <WizardSlideShell
            layout="hero"
            seriesTitle={FACTS_DECK_FI_SNAPSHOT_TEST}
            stepIndex={0}
            totalSteps={TOTAL_STEPS}
            title=""
            showBack={false}
            onNext={next}
            nextLabel="Plot my orbit"
            secondaryLabel="Skip to workspace"
            onSecondary={onSkipToDashboard}
          >
            <div className="relative text-center">
              <div className="relative mx-auto mb-10 flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
                <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-emerald-400/35 via-sky-400/20 to-amber-300/25 blur-2xl dark:from-emerald-500/25 dark:via-sky-500/15 dark:to-amber-400/20" />
                <div className="absolute inset-3 rounded-[2.5rem] border border-dashed border-zinc-300/60 dark:border-zinc-600/50" />
                <div className="absolute inset-3 rounded-[2.25rem] border border-zinc-200/90 bg-white/95 shadow-2xl ring-1 ring-zinc-900/5 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/95 dark:ring-white/10">
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-xs font-black tracking-tight text-white shadow-inner dark:bg-zinc-100 dark:text-zinc-900">
                        FD
                      </span>
                      <Gem className="h-14 w-14 text-violet-700 dark:text-violet-400" strokeWidth={1.1} aria-hidden />
                    </div>
                    <div className="flex justify-center gap-1.5" aria-hidden>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600"
                          style={{ width: `${10 + i * 6}px` }}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">Orbit check</p>
                  </div>
                </div>
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-violet-800 dark:text-violet-400/90">Facts Deck</p>
              <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-tight text-balance text-zinc-900 dark:text-zinc-50 sm:text-5xl md:text-6xl">
                {FACTS_DECK_FI_SNAPSHOT_TOOL}
              </h1>
              <p className="mt-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{FACTS_DECK_FI_SNAPSHOT_TEST}</p>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
                Net worth, a classic FI target from your spend, and a playful “freedom band”—then open the workspace for
                tiers, rates, and JSON export.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Net worth</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">FI number</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Freedom band</span>
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 1 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_FI_SNAPSHOT_TEST}
            stepIndex={1}
            totalSteps={TOTAL_STEPS}
            title="What brought you here?"
            subtitle="No wrong answer—this just sets the tone for your snapshot."
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
            seriesTitle={FACTS_DECK_FI_SNAPSHOT_TEST}
            stepIndex={2}
            totalSteps={TOTAL_STEPS}
            title="Liquid & invested"
            subtitle="Cash you could tap soon vs stuff you’re growing for later."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>Cash &amp; bank</span>
                  <span className="tabular-nums">${a.liquidCash.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={250_000}
                  step={500}
                  value={Math.min(250_000, a.liquidCash)}
                  onChange={(e) => setField("liquidCash", Number(e.target.value))}
                  className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>Investments (401k, brokerage, etc.)</span>
                  <span className="tabular-nums">${a.invested.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={800_000}
                  step={1000}
                  value={Math.min(800_000, a.invested)}
                  onChange={(e) => setField("invested", Number(e.target.value))}
                  className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 3 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_FI_SNAPSHOT_TEST}
            stepIndex={3}
            totalSteps={TOTAL_STEPS}
            title="Other assets & debts"
            subtitle="Rough equity or paid-off value counts—then everything you still owe."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>Other assets (e.g. home equity ballpark)</span>
                  <span className="tabular-nums">${a.otherAssets.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={400_000}
                  step={1000}
                  value={Math.min(400_000, a.otherAssets)}
                  onChange={(e) => setField("otherAssets", Number(e.target.value))}
                  className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>Total liabilities</span>
                  <span className="tabular-nums">${a.liabilities.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200_000}
                  step={500}
                  value={Math.min(200_000, a.liabilities)}
                  onChange={(e) => setField("liabilities", Number(e.target.value))}
                  className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 4 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_FI_SNAPSHOT_TEST}
            stepIndex={4}
            totalSteps={TOTAL_STEPS}
            title="Monthly spend & investing"
            subtitle="Spend drives your FI number; investing fuels the timeline."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>Monthly expenses (all-in)</span>
                  <span className="tabular-nums">${a.monthlyExpenses.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={1500}
                  max={20_000}
                  step={100}
                  value={Math.min(20_000, Math.max(1500, a.monthlyExpenses))}
                  onChange={(e) => setField("monthlyExpenses", Number(e.target.value))}
                  className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>New money to investments / month</span>
                  <span className="tabular-nums">${a.monthlyInvesting.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12_000}
                  step={50}
                  value={Math.min(12_000, a.monthlyInvesting)}
                  onChange={(e) => setField("monthlyInvesting", Number(e.target.value))}
                  className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 5 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_FI_SNAPSHOT_TEST}
            stepIndex={5}
            totalSteps={TOTAL_STEPS}
            title="Ready to see your orbit"
            subtitle="We’ll chart net worth, FI progress, and a freedom band—then you can go deeper in the workspace."
            onBack={back}
            onNext={finish}
            nextLabel="Reveal my snapshot"
            variant="finish"
            nextDisabled={!canProceed()}
          >
            <p className="text-center text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              FI number here uses a classic withdrawal-rate shortcut (you’ll tune the % in the full tool). This is
              education, not a promise about the future.
            </p>
          </WizardSlideShell>
        )}
      </div>
    </div>
  );
}
