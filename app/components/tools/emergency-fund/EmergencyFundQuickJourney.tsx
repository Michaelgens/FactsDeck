"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, Compass, DoorOpen, Home, Layers, Shield, Sparkles, Umbrella, Zap } from "lucide-react";
import WizardSlideShell from "../mortgage/WizardSlideShell";
import type { EmergencyFundGoal, EmergencyFundJourneyAnswers, EmergencyFundPlanMode } from "./emergency-fund-journey-types";
import {
  EMERGENCY_FUND_JOURNEY_DEFAULTS,
  FACTS_DECK_EMERGENCY_FUND_CALCULATOR,
  FACTS_DECK_EMERGENCY_FUND_TEST,
  recommendedTargetMonths,
} from "./emergency-fund-journey-types";
import { GOAL_LABEL, PLAN_MODE_LABEL } from "./compute-emergency-fund-journey-metrics";
import { EMERGENCY_FUND_SLUG, trackToolEvent } from "../../../lib/tool-analytics-client";

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

  const selectGoal = useCallback((g: EmergencyFundGoal) => {
    setA((prev) => ({
      ...prev,
      goal: g,
      targetMonths: recommendedTargetMonths(g),
    }));
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
    if (step === 0) {
      trackToolEvent(EMERGENCY_FUND_SLUG, "journey_start", undefined, true);
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
          <div className="absolute -top-24 left-1/2 h-72 w-[56rem] -translate-x-1/2 rounded-full bg-sky-500/[0.06] blur-3xl dark:bg-sky-400/[0.08]" />
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
                <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-sky-400/30 via-cyan-400/20 to-teal-300/25 blur-2xl dark:from-sky-500/20 dark:via-cyan-500/15 dark:to-teal-500/15" />
                <div className="absolute inset-2 rounded-[2.25rem] border border-dashed border-sky-300/60 dark:border-sky-600/50" />
                <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 rounded-[2rem] border border-zinc-200/90 bg-white/95 shadow-2xl ring-1 ring-sky-900/5 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/95 dark:ring-sky-400/10">
                  <Umbrella className="h-16 w-16 text-sky-700 dark:text-sky-400" strokeWidth={1.2} aria-hidden />
                </div>
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-sky-800 dark:text-sky-400/90">Facts Deck</p>
              <h1 className="font-display text-2xl font-bold leading-[1.12] tracking-tight text-zinc-900 text-balance dark:text-zinc-50 sm:text-4xl md:text-5xl">
                {FACTS_DECK_EMERGENCY_FUND_CALCULATOR}
              </h1>
              <p className="mt-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{FACTS_DECK_EMERGENCY_FUND_TEST}</p>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
                Turn monthly essentials into runway months, a resilience score, and a clear path to your target cushion.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <span className="rounded-full bg-sky-50 px-3 py-1 dark:bg-sky-950/40">Runway</span>
                <span className="rounded-full bg-sky-50 px-3 py-1 dark:bg-sky-950/40">Resilience</span>
                <span className="rounded-full bg-sky-50 px-3 py-1 dark:bg-sky-950/40">Time to goal</span>
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
            subtitle={`Your focus shapes target months and starter suggestions — ${GOAL_LABEL[a.goal]}.`}
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
                    onClick={() => selectGoal(g.id)}
                    className={`text-left rounded-2xl border-2 p-5 transition-all ${
                      on
                        ? "border-sky-700 bg-sky-50/80 shadow-md dark:border-sky-400 dark:bg-sky-950/40"
                        : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          on
                            ? "bg-sky-700 text-white dark:bg-sky-500"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <div>
                        <p className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50">{g.title}</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{g.blurb}</p>
                        {on ? (
                          <p className="text-xs font-semibold text-sky-800 dark:text-sky-300 mt-2">
                            Suggested target: {recommendedTargetMonths(g.id)} months
                          </p>
                        ) : null}
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
            subtitle="Must-pay costs if income stopped — or use essentials builder in the full workspace."
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
                className="w-full h-3 accent-sky-700 dark:accent-sky-400 rounded-full"
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
            subtitle="Cash you'd tap in a crisis (high-yield savings, etc.)."
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
                className="w-full h-3 accent-sky-700 dark:accent-sky-400 rounded-full"
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
                className="w-full h-3 accent-sky-700 dark:accent-sky-400 rounded-full"
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
            title="Target runway & workspace style"
            subtitle="Pick months banked and how you'll model essentials in the full calculator."
            onBack={back}
            onNext={finish}
            nextLabel="See my snapshot"
            variant="finish"
            nextDisabled={!canProceed()}
          >
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Target months</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[3, 6, 9, 12].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setField("targetMonths", m)}
                      className={`px-5 py-3 rounded-xl text-sm font-bold border-2 transition-colors ${
                        a.targetMonths === m
                          ? "border-sky-700 bg-sky-700 text-white dark:border-sky-400 dark:bg-sky-500"
                          : "border-zinc-200 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200"
                      }`}
                    >
                      {m} mo
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                    <span>Custom</span>
                    <span className="tabular-nums">{a.targetMonths}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={24}
                    step={1}
                    value={Math.min(24, Math.max(1, a.targetMonths))}
                    onChange={(e) => setField("targetMonths", Number(e.target.value))}
                    className="w-full h-3 accent-sky-700 dark:accent-sky-400 rounded-full"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Workspace style</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(
                    [
                      {
                        id: "runway_math" as EmergencyFundPlanMode,
                        icon: Zap,
                        title: PLAN_MODE_LABEL.runway_math,
                        blurb: "One essentials number — fast tweaks",
                      },
                      {
                        id: "essentials_builder" as EmergencyFundPlanMode,
                        icon: Layers,
                        title: PLAN_MODE_LABEL.essentials_builder,
                        blurb: "Line items by category — detailed runway",
                      },
                    ] as const
                  ).map(({ id, icon: Icon, title, blurb }) => {
                    const on = a.planMode === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setField("planMode", id)}
                        className={`text-left rounded-2xl border-2 p-4 transition-all ${
                          on
                            ? "border-sky-700 bg-sky-50 dark:border-sky-400 dark:bg-sky-950/40"
                            : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800"
                        }`}
                      >
                        <Icon className={`h-5 w-5 mb-2 ${on ? "text-sky-700 dark:text-sky-400" : "text-zinc-500"}`} />
                        <p className="font-bold text-sm">{title}</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{blurb}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </WizardSlideShell>
        )}
      </div>
    </div>
  );
}
