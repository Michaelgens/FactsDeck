"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Repeat, Scissors, Sparkles, Target } from "lucide-react";
import WizardSlideShell from "../mortgage/WizardSlideShell";
import type { SubscriptionAuditGoal, SubscriptionJourneyAnswers } from "./subscription-audit-journey-types";
import {
  SUBSCRIPTION_AUDIT_JOURNEY_DEFAULTS,
  FACTS_DECK_SUBSCRIPTION_AUDIT_TOOL,
  FACTS_DECK_SUBSCRIPTION_AUDIT_TEST,
} from "./subscription-audit-journey-types";

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

  const canProceed = useCallback((): boolean => {
    if (step === 2) return a.estimatedMonthlyRecurring >= 0 && a.estimatedMonthlyRecurring <= 5_000;
    if (step === 3) return a.subscriptionCount >= 1 && a.subscriptionCount <= 40;
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
              <span className="leading-snug text-center">{FACTS_DECK_SUBSCRIPTION_AUDIT_TEST}</span>
            </span>
          </div>
          <div className="flex-1 flex justify-end min-w-0">
            <button
              type="button"
              onClick={onSkipToDashboard}
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white underline-offset-2 hover:underline text-right"
            >
              Skip to full audit
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
            nextLabel="Start audit"
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
                    <Repeat className="h-14 w-14 text-rose-700 dark:text-rose-400" strokeWidth={1.2} aria-hidden />
                  </div>
                  <div className="flex gap-1" aria-hidden>
                    <span className="h-1.5 w-8 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    <span className="h-1.5 w-12 rounded-full bg-rose-500/80" />
                    <span className="h-1.5 w-5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  </div>
                </div>
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-rose-800 dark:text-rose-400/90">Facts Deck</p>
              <h1 className="font-display text-3xl font-bold leading-[1.12] tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl md:text-6xl">
                {FACTS_DECK_SUBSCRIPTION_AUDIT_TOOL}
              </h1>
              <p className="mt-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{FACTS_DECK_SUBSCRIPTION_AUDIT_TEST}</p>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
                Autopay is quiet—annualize it, compare cuts, then build a real line-by-line list in the full audit.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Monthly → yearly</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Cut scenarios</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">JSON export</span>
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 1 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_SUBSCRIPTION_AUDIT_TEST}
            stepIndex={1}
            totalSteps={TOTAL_STEPS}
            title="What’s the mission?"
            subtitle="You can change everything later."
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
            seriesTitle={FACTS_DECK_SUBSCRIPTION_AUDIT_TEST}
            stepIndex={2}
            totalSteps={TOTAL_STEPS}
            title="Estimated monthly recurring"
            subtitle="Apps, streaming, cloud, gym—anything that hits your card on a schedule."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-4xl sm:text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                ${a.estimatedMonthlyRecurring.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                <span className="text-xl font-semibold text-zinc-500">/mo</span>
              </p>
              <input
                type="range"
                min={0}
                max={800}
                step={2}
                value={Math.min(800, a.estimatedMonthlyRecurring)}
                onChange={(e) => setField("estimatedMonthlyRecurring", Number(e.target.value))}
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
              <input
                type="number"
                min={0}
                max={5000}
                step={5}
                value={a.estimatedMonthlyRecurring}
                onChange={(e) => setField("estimatedMonthlyRecurring", Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold tabular-nums text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </WizardSlideShell>
        )}

        {step === 3 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_SUBSCRIPTION_AUDIT_TEST}
            stepIndex={3}
            totalSteps={TOTAL_STEPS}
            title="How many active subscriptions?"
            subtitle="Rough count—including annual plans divided mentally (we’ll refine in the full audit)."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-6">
              <p className="text-center text-5xl sm:text-6xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{a.subscriptionCount}</p>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={a.subscriptionCount}
                onChange={(e) => setField("subscriptionCount", Number(e.target.value))}
                className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
              />
            </div>
          </WizardSlideShell>
        )}

        {step === 4 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_SUBSCRIPTION_AUDIT_TEST}
            stepIndex={4}
            totalSteps={TOTAL_STEPS}
            title="Ready to annualize the pain"
            subtitle="Next: yearly cost, daily cost, and cut scenarios—then line items in the workspace."
            onBack={back}
            onNext={finish}
            nextLabel="See my snapshot"
            variant="finish"
            nextDisabled={!canProceed()}
          >
            <p className="text-center text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              This is awareness, not shame—small recurring charges are designed to be forgettable.
            </p>
          </WizardSlideShell>
        )}
      </div>
    </div>
  );
}
