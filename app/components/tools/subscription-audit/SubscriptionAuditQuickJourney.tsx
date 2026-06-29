"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, DoorOpen, Layers, Repeat, Scissors, Sparkles, Target, Zap } from "lucide-react";
import WizardSlideShell from "../mortgage/WizardSlideShell";
import type { SubscriptionAuditGoal, SubscriptionAuditMode, SubscriptionJourneyAnswers } from "./subscription-audit-journey-types";
import {
  SUBSCRIPTION_AUDIT_JOURNEY_DEFAULTS,
  FACTS_DECK_SUBSCRIPTION_AUDIT_TOOL,
  FACTS_DECK_SUBSCRIPTION_AUDIT_TEST,
  recommendedTrimPercent,
} from "./subscription-audit-journey-types";
import { GOAL_LABEL, MODE_LABEL } from "./compute-subscription-audit-metrics";
import { SUBSCRIPTION_AUDIT_SLUG, trackToolEvent } from "../../../lib/tool-analytics-client";

const TOTAL_STEPS = 5;

const GOALS: { id: SubscriptionAuditGoal; title: string; blurb: string; icon: typeof Repeat }[] = [
  { id: "leaks", title: "Find the leaks", blurb: "See what autopay costs per year", icon: Target },
  { id: "cut", title: "Cut something", blurb: "Model savings if I trim recurring", icon: Scissors },
  { id: "exploring", title: "Just exploring", blurb: "Ballpark my subscription load", icon: Compass },
];

type Props = {
  onComplete: (answers: SubscriptionJourneyAnswers) => void;
  onSkipToDashboard: () => void;
};

export default function SubscriptionAuditQuickJourney({ onComplete, onSkipToDashboard }: Props) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<SubscriptionJourneyAnswers>({ ...SUBSCRIPTION_AUDIT_JOURNEY_DEFAULTS });

  const setField = useCallback(<K extends keyof SubscriptionJourneyAnswers>(key: K, value: SubscriptionJourneyAnswers[K]) => {
    setA((prev) => ({ ...prev, [key]: value }));
  }, []);

  const selectGoal = useCallback((g: SubscriptionAuditGoal) => {
    setA((prev) => ({
      ...prev,
      goal: g,
      targetTrimPercent: recommendedTrimPercent(g),
    }));
  }, []);

  const canProceed = useCallback((): boolean => {
    if (step === 2) return a.estimatedMonthlyRecurring >= 0 && a.estimatedMonthlyRecurring <= 5_000;
    if (step === 3) return a.subscriptionCount >= 1 && a.subscriptionCount <= 40;
    return true;
  }, [step, a]);

  const finish = useCallback(() => onComplete({ ...a }), [a, onComplete]);

  const next = useCallback(() => {
    if (step === 0) {
      trackToolEvent(SUBSCRIPTION_AUDIT_SLUG, "journey_start", undefined, true);
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
        className="pointer-events-none absolute -top-32 left-1/2 h-[42rem] w-[min(90rem,200%)] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-200/35 via-orange-100/15 to-transparent blur-3xl dark:from-emerald-950/50 dark:via-blue-950/30 dark:to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-[28rem] right-[-10%] h-96 w-96 rounded-full bg-orange-100/30 blur-3xl dark:bg-cyan-950/25"
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
              <span className="leading-snug text-center">{FACTS_DECK_SUBSCRIPTION_AUDIT_TEST}</span>
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
                Skip to full audit
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="transition-opacity duration-300" key={step}>
        {step === 0 && (
          <WizardSlideShell
            layout="hero"
            seriesTitle={FACTS_DECK_SUBSCRIPTION_AUDIT_TEST}
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
                <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-violet-400/30 via-rose-400/20 to-fuchsia-300/25 blur-2xl dark:from-violet-500/20 dark:via-rose-500/15 dark:to-fuchsia-500/15" />
                <div className="absolute inset-2 rounded-[2.25rem] border border-dashed border-violet-300/60 dark:border-violet-600/50" />
                <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 rounded-[2rem] border border-zinc-200/90 bg-white/95 shadow-2xl ring-1 ring-violet-900/5 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/95 dark:ring-violet-400/10">
                  <Repeat className="h-16 w-16 text-violet-700 dark:text-violet-400" strokeWidth={1.2} aria-hidden />
                </div>
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-violet-800 dark:text-violet-400/90">Facts Deck</p>
              <h1 className="font-display text-2xl font-bold leading-[1.12] tracking-tight text-zinc-900 text-balance dark:text-zinc-50 sm:text-4xl md:text-5xl">
                {FACTS_DECK_SUBSCRIPTION_AUDIT_TOOL}
              </h1>
              <p className="mt-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{FACTS_DECK_SUBSCRIPTION_AUDIT_TEST}</p>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
                Autopay is quiet — annualize it, set a trim target, then build a real line-by-line list with an awareness score.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Annualize</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Trim target</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Line items</span>
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 1 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_SUBSCRIPTION_AUDIT_TEST}
            stepIndex={1}
            totalSteps={TOTAL_STEPS}
            title="What's the mission?"
            subtitle={`Your focus shapes trim targets and starter suggestions — ${GOAL_LABEL[a.goal]}.`}
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
                    className={`text-left rounded-2xl border-2 p-5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 ${
                      on
                        ? "border-violet-700 bg-violet-50/80 shadow-md dark:border-violet-400 dark:bg-violet-950/40"
                        : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          on
                            ? "bg-violet-700 text-white dark:bg-violet-500"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <div>
                        <p className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50">{g.title}</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{g.blurb}</p>
                        {on ? (
                          <p className="text-xs font-semibold text-violet-800 dark:text-violet-300 mt-2">
                            Suggested trim: {recommendedTrimPercent(g.id)}%
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
            seriesTitle={FACTS_DECK_SUBSCRIPTION_AUDIT_TEST}
            stepIndex={2}
            totalSteps={TOTAL_STEPS}
            title="Estimated monthly recurring"
            subtitle="Apps, streaming, cloud, gym — anything on autopay."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-4xl sm:text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                ${a.estimatedMonthlyRecurring.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                <span className="text-lg font-semibold text-zinc-500">/mo</span>
              </p>
              <input
                type="range"
                min={0}
                max={800}
                step={2}
                value={Math.min(800, a.estimatedMonthlyRecurring)}
                onChange={(e) => setField("estimatedMonthlyRecurring", Number(e.target.value))}
                aria-label="Estimated monthly recurring spend"
                aria-valuetext={`$${Number(a.estimatedMonthlyRecurring).toLocaleString()} per month`}
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
              <label className="block">
                <span className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Exact amount</span>
                <input
                  type="number"
                  min={0}
                  max={5000}
                  step={5}
                  value={a.estimatedMonthlyRecurring}
                  onChange={(e) => setField("estimatedMonthlyRecurring", Number(e.target.value) || 0)}
                  aria-label="Exact monthly recurring spend"
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
                />
              </label>
            </div>
          </WizardSlideShell>
        )}

        {step === 3 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_SUBSCRIPTION_AUDIT_TEST}
            stepIndex={3}
            totalSteps={TOTAL_STEPS}
            title="How many active subscriptions?"
            subtitle="Rough count — you'll name each one in the full audit."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-4xl sm:text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {a.subscriptionCount}
              </p>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={a.subscriptionCount}
                onChange={(e) => setField("subscriptionCount", Number(e.target.value))}
                aria-label="Number of active subscriptions"
                aria-valuetext={`${a.subscriptionCount} subscriptions`}
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
              <label className="block">
                <span className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Exact count</span>
                <input
                  type="number"
                  min={1}
                  max={40}
                  step={1}
                  value={a.subscriptionCount}
                  onChange={(e) => setField("subscriptionCount", Math.min(40, Math.max(1, Number(e.target.value) || 1)))}
                  aria-label="Exact subscription count"
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
                />
              </label>
            </div>
          </WizardSlideShell>
        )}

        {step === 4 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_SUBSCRIPTION_AUDIT_TEST}
            stepIndex={4}
            totalSteps={TOTAL_STEPS}
            title="Workspace style & trim target"
            subtitle="Choose how you'll build the list in the full audit."
            onBack={back}
            onNext={finish}
            nextLabel="See my snapshot"
            variant="finish"
            nextDisabled={!canProceed()}
          >
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Trim target</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[10, 15, 25].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setField("targetTrimPercent", p)}
                      className={`px-5 py-3 rounded-xl text-sm font-bold border-2 transition-colors ${
                        a.targetTrimPercent === p
                          ? "border-violet-700 bg-violet-700 text-white dark:border-violet-400 dark:bg-violet-500"
                          : "border-zinc-200 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200"
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                    <span>Custom</span>
                    <span className="tabular-nums">{a.targetTrimPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={1}
                    value={a.targetTrimPercent}
                    onChange={(e) => setField("targetTrimPercent", Number(e.target.value))}
                    aria-label="Custom trim target percentage"
                    className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Workspace style</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(
                    [
                      { id: "quick_estimate" as SubscriptionAuditMode, icon: Zap, blurb: "Keep a ballpark number" },
                      { id: "line_item_audit" as SubscriptionAuditMode, icon: Layers, blurb: "Name every charge" },
                    ] as const
                  ).map(({ id, icon: Icon, blurb }) => {
                    const on = a.mode === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setField("mode", id)}
                        className={`text-left rounded-2xl border-2 p-4 transition-all ${
                          on
                            ? "border-violet-700 bg-violet-50 dark:border-violet-400 dark:bg-violet-950/40"
                            : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800"
                        }`}
                      >
                        <Icon className={`h-5 w-5 mb-2 ${on ? "text-violet-700 dark:text-violet-400" : "text-zinc-500"}`} />
                        <p className="font-bold text-sm">{MODE_LABEL[id]}</p>
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
