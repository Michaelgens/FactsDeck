"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Compass, DoorOpen, GraduationCap, Scale, Sparkles } from "lucide-react";
import WizardSlideShell from "../mortgage/WizardSlideShell";
import type { StudentLoanPathGoal, StudentLoanJourneyAnswers } from "./student-loan-journey-types";
import {
  STUDENT_LOAN_JOURNEY_DEFAULTS,
  FACTS_DECK_STUDENT_LOAN_SNAPSHOT,
  FACTS_DECK_STUDENT_LOAN_TEST,
} from "./student-loan-journey-types";
import { STUDENT_LOAN_SLUG, trackToolEvent } from "../../../lib/tool-analytics-client";

const TOTAL_STEPS = 5;

const GOALS: { id: StudentLoanPathGoal; title: string; blurb: string; icon: typeof GraduationCap }[] = [
  { id: "standard", title: "Standard repayment", blurb: "Level payment over a fixed term (often 10 years)", icon: BookOpen },
  { id: "idr", title: "Income-driven (illustrative)", blurb: "Payment tied to income & family size—simplified here", icon: Scale },
  { id: "compare", title: "Compare both", blurb: "See standard vs IDR-style side by side", icon: GraduationCap },
  { id: "exploring", title: "Just exploring", blurb: "What-if on balance and income", icon: Compass },
];

type Props = {
  onComplete: (answers: StudentLoanJourneyAnswers) => void;
  onSkipToDashboard: () => void;
};

export default function StudentLoanQuickJourney({ onComplete, onSkipToDashboard }: Props) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<StudentLoanJourneyAnswers>({ ...STUDENT_LOAN_JOURNEY_DEFAULTS });

  const setField = useCallback(<K extends keyof StudentLoanJourneyAnswers>(key: K, value: StudentLoanJourneyAnswers[K]) => {
    setA((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = useCallback((): boolean => {
    if (step === 2) return a.balance >= 1_000 && a.balance <= 500_000 && a.aprPercent >= 0 && a.aprPercent <= 15;
    if (step === 3) return a.annualIncome >= 0 && a.annualIncome <= 400_000 && a.familySize >= 1 && a.familySize <= 8;
    return true;
  }, [step, a]);

  const finish = useCallback(() => onComplete({ ...a }), [a, onComplete]);

  const next = useCallback(() => {
    if (step === 0) {
      trackToolEvent(STUDENT_LOAN_SLUG, "journey_start", undefined, true);
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
          <div className="absolute -top-24 left-1/2 h-72 w-[56rem] -translate-x-1/2 rounded-full bg-emerald-500/[0.06] blur-3xl dark:bg-emerald-400/[0.08]" />
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
              <span className="leading-snug text-center">{FACTS_DECK_STUDENT_LOAN_TEST}</span>
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
                Skip to full snapshot
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="transition-opacity duration-300" key={step}>
        {step === 0 && (
          <WizardSlideShell
            layout="hero"
            seriesTitle={FACTS_DECK_STUDENT_LOAN_TEST}
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
                <div className="absolute inset-2 rounded-[2.25rem] border border-dashed border-emerald-300/60 dark:border-emerald-600/50" />
                <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 rounded-[2rem] border border-zinc-200/90 bg-white/95 shadow-2xl ring-1 ring-emerald-900/5 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/95 dark:ring-emerald-400/10">
                  <GraduationCap className="h-16 w-16 text-emerald-700 dark:text-emerald-400" strokeWidth={1.2} aria-hidden />
                </div>
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-emerald-800 dark:text-emerald-400/90">Facts Deck</p>
              <h1 className="font-display text-2xl font-bold leading-[1.12] tracking-tight text-zinc-900 text-balance dark:text-zinc-50 sm:text-4xl md:text-5xl">
                {FACTS_DECK_STUDENT_LOAN_SNAPSHOT}
              </h1>
              <p className="mt-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{FACTS_DECK_STUDENT_LOAN_TEST}</p>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
                Standard level payment vs an illustrative income-driven payment—plus when the balance could grow under a low
                payment. Not federal servicer math.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">10-yr standard</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">IDR-style</span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800/80">Discretionary income</span>
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 1 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_STUDENT_LOAN_TEST}
            stepIndex={1}
            totalSteps={TOTAL_STEPS}
            title="What do you want to compare?"
            subtitle="You can change every assumption in the full snapshot."
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
                    aria-pressed={on}
                    className={`text-left rounded-2xl border-2 p-5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ${
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
            seriesTitle={FACTS_DECK_STUDENT_LOAN_TEST}
            stepIndex={2}
            totalSteps={TOTAL_STEPS}
            title="Loan balance & rate"
            subtitle="Weighted average interest if you have multiple loans."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-8">
              <div>
                <p className="text-center text-3xl sm:text-4xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                  ${a.balance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </p>
                <input
                  type="range"
                  min={5_000}
                  max={120_000}
                  step={500}
                  value={Math.min(120_000, Math.max(5_000, a.balance))}
                  onChange={(e) => setField("balance", Number(e.target.value))}
                  aria-label="Loan balance"
                  className="mt-4 w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
              <div>
                <p className="text-center text-4xl sm:text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                  {a.aprPercent.toFixed(2)}%
                </p>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={0.05}
                  value={a.aprPercent}
                  onChange={(e) => setField("aprPercent", Number(e.target.value))}
                  aria-label="APR percent"
                  className="mt-4 w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 3 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_STUDENT_LOAN_TEST}
            stepIndex={3}
            totalSteps={TOTAL_STEPS}
            title="Income & household"
            subtitle="Used only for the illustrative IDR-style payment (150% of poverty line deduction)."
            onBack={back}
            onNext={next}
            nextDisabled={!canProceed()}
          >
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>Adjusted gross income (annual, rough)</span>
                  <span className="tabular-nums">${a.annualIncome.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={150_000}
                  step={500}
                  value={Math.min(150_000, a.annualIncome)}
                  onChange={(e) => setField("annualIncome", Number(e.target.value))}
                  aria-label="Annual income"
                  className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                  <span>Family size (for poverty line)</span>
                  <span className="tabular-nums">{a.familySize}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={a.familySize}
                  onChange={(e) => setField("familySize", Number(e.target.value))}
                  aria-label="Family size"
                  className="w-full h-3 accent-zinc-900 dark:accent-zinc-100 rounded-full"
                />
              </div>
            </div>
          </WizardSlideShell>
        )}

        {step === 4 && (
          <WizardSlideShell
            seriesTitle={FACTS_DECK_STUDENT_LOAN_TEST}
            stepIndex={4}
            totalSteps={TOTAL_STEPS}
            title="Ready for your snapshot"
            subtitle="Standard amortization vs a simplified IDR-style payment—then open the workspace to tune terms and %."
            onBack={back}
            onNext={finish}
            nextLabel="See my snapshot"
            variant="finish"
            nextDisabled={!canProceed()}
          >
            <p className="text-center text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              Real federal plans have different rules, caps, and forgiveness timelines. Use this as a directional map—not a
              bill from your servicer.
            </p>
          </WizardSlideShell>
        )}
      </div>
    </div>
  );
}
