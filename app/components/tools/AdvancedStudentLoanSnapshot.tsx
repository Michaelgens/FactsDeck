"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check, ChevronRight, Copy, GraduationCap, Sparkles } from "lucide-react";
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";
import {
  STUDENT_LOAN_JOURNEY_DEFAULTS,
  FACTS_DECK_STUDENT_LOAN_SNAPSHOT,
} from "./student-loan/student-loan-journey-types";
import type { StudentLoanJourneyAnswers } from "./student-loan/student-loan-journey-types";
import ToolDashboardTestCta from "./ToolDashboardTestCta";
import {
  computeStudentLoanJourneyMetrics,
  formatSlMoney,
} from "./student-loan/compute-student-loan-metrics";
import {
  ToolDashboardHeroBackdrop,
  tdGhostBtn,
  tdHero,
  tdHeroInner,
  tdIconTile,
  tdNavLink,
  tdPage,
} from "./tool-dashboard-ui";

export type StudentLoanSnapshotInitialValues = Partial<
  Pick<StudentLoanJourneyAnswers, "balance" | "aprPercent" | "annualIncome" | "familySize">
> & {
  standardTermYears?: number;
  idrPercentOfDiscretionary?: number;
  idrHorizonYears?: number;
};

type Props = {
  initialValues?: StudentLoanSnapshotInitialValues;
  deferWalkthrough?: boolean;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export default function AdvancedStudentLoanSnapshot({
  initialValues,
  deferWalkthrough = false,
}: Props = {}) {
  const d = STUDENT_LOAN_JOURNEY_DEFAULTS;
  const [balance, setBalance] = useState(initialValues?.balance ?? d.balance);
  const [aprPercent, setAprPercent] = useState(initialValues?.aprPercent ?? d.aprPercent);
  const [annualIncome, setAnnualIncome] = useState(initialValues?.annualIncome ?? d.annualIncome);
  const [familySize, setFamilySize] = useState(initialValues?.familySize ?? d.familySize);
  const [standardTermYears, setStandardTermYears] = useState(initialValues?.standardTermYears ?? 10);
  const [idrPercentOfDiscretionary, setIdrPercentOfDiscretionary] = useState(
    initialValues?.idrPercentOfDiscretionary ?? 10
  );
  const [idrHorizonYears, setIdrHorizonYears] = useState(initialValues?.idrHorizonYears ?? 20);

  const [copied, setCopied] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const TOUR_ID = "student-loan-snapshot";

  const answers: StudentLoanJourneyAnswers = useMemo(
    () => ({
      goal: "exploring",
      balance,
      aprPercent,
      annualIncome,
      familySize,
    }),
    [balance, aprPercent, annualIncome, familySize]
  );

  const m = useMemo(
    () =>
      computeStudentLoanJourneyMetrics(answers, {
        standardTermYears,
        idrPercentOfDiscretionary,
        idrHorizonYears,
      }),
    [answers, standardTermYears, idrPercentOfDiscretionary, idrHorizonYears]
  );

  const exportPayload = useMemo(
    () => ({
      tool: FACTS_DECK_STUDENT_LOAN_SNAPSHOT,
      inputs: {
        balance: Math.round(balance),
        aprPercent: Math.round(aprPercent * 100) / 100,
        annualIncome: Math.round(annualIncome),
        familySize: Math.round(familySize),
        standardTermYears,
        idrPercentOfDiscretionary,
        idrHorizonYears,
      },
      results: {
        discretionaryAnnual: Math.round(m.discretionaryAnnual),
        standardMonthly: Math.round(m.standardMonthly * 100) / 100,
        standardTotalInterest: Math.round(m.standardTotalInterest),
        idrMonthly: Math.round(m.idrMonthly * 100) / 100,
        idrBelowInterest: m.idrBelowInterest,
        idrEndingBalanceAtHorizon: Math.round(m.idrAtHorizon.endingBalance),
      },
      disclaimer: "Educational illustration only—not federal servicer calculations.",
      createdAt: new Date().toISOString(),
    }),
    [balance, aprPercent, annualIncome, familySize, standardTermYears, idrPercentOfDiscretionary, idrHorizonYears, m]
  );

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  useEffect(() => {
    if (deferWalkthrough) return;
    if (hasCompletedWalkthrough(TOUR_ID)) return;
    const t = window.setTimeout(() => setTourOpen(true), 450);
    return () => window.clearTimeout(t);
  }, [deferWalkthrough]);

  const walkthroughSteps: WalkthroughStep[] = useMemo(
    () => [
      {
        id: "welcome",
        placement: "center",
        title: "Welcome to the workspace",
        body: (
          <div className="space-y-3">
            <p>
              If you took the <strong>Facts Deck Student Loan Path Test</strong>, your balance, rate, income, and
              household size are loaded. Tune standard term and IDR assumptions—this is still not your servicer’s
              portal.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Replay anytime from Walk-through.</p>
          </div>
        ),
      },
      {
        id: "compare",
        target: "[data-tour='sl-compare']",
        title: "Standard vs illustrative IDR",
        body: (
          <p>
            <strong>Standard</strong> uses a level payment over the term you pick. <strong>IDR</strong> uses estimated
            discretionary income × a percentage you set—real plans have more rules.
          </p>
        ),
      },
      {
        id: "inputs",
        target: "[data-tour='sl-inputs']",
        title: "Loan & household inputs",
        body: <p>Balance and weighted APR on the left; income and family size drive the poverty-line deduction.</p>,
      },
      {
        id: "idr",
        target: "[data-tour='sl-idr']",
        title: "IDR % & horizon",
        body: (
          <p>
            Adjust what fraction of discretionary income goes to the loan (illustrative) and how long to run the IDR
            simulation.
          </p>
        ),
      },
      {
        id: "copy",
        target: "[data-tour='sl-copy-json']",
        title: "Copy JSON",
        body: <p>Export numbers for spreadsheets or a certified planner—never for legal filings alone.</p>,
      },
      {
        id: "finish",
        placement: "center",
        title: "Remember",
        body: (
          <p className="text-left">
            For real payments, IDR recertification, and forgiveness programs, your loan servicer and StudentAid.gov are the
            sources of truth.
          </p>
        ),
      },
    ],
    []
  );

  return (
    <div className={tdPage}>
      <ToolWalkthrough
        id={TOUR_ID}
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onFinish={() => {
          try {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          } catch {
            window.scrollTo(0, 0);
          }
        }}
        steps={walkthroughSteps}
      />

      <section className={tdHero}>
        <ToolDashboardHeroBackdrop />

        <div className={tdHeroInner}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className={tdNavLink}>
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link href="/tools" className={tdNavLink}>
              All tools
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <span className={tdIconTile}>
                <GraduationCap className="h-7 w-7" />
              </span>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {FACTS_DECK_STUDENT_LOAN_SNAPSHOT}
                </h1>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                  Standard amortization vs a simplified income-driven payment—discretionary income uses 150% of the
                  federal poverty line (approximate).
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setTourOpen(true)}
                    className={tdGhostBtn}
                  >
                    <BookOpen className="h-4 w-4" />
                    Walk-through
                  </button>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500">
                    <Sparkles className="h-3.5 w-3.5" />
                    Not federal servicer math
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              data-tour="sl-copy-json"
              onClick={copyJson}
              className={`${tdGhostBtn} px-5`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy JSON"}
            </button>
          </div>

          <ToolDashboardTestCta toolSlug="student-loan-snapshot" testLabel={FACTS_DECK_STUDENT_LOAN_SNAPSHOT} />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-10">
        <div data-tour="sl-compare" className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Standard payment</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{formatSlMoney(m.standardMonthly)}/mo</p>
            <p className="mt-1 text-xs text-zinc-500">{standardTermYears} yr level · Total interest ≈ {formatSlMoney(m.standardTotalInterest)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Illustrative IDR</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{formatSlMoney(m.idrMonthly)}/mo</p>
            <p className="mt-1 text-xs text-zinc-500">{idrPercentOfDiscretionary}% of discretionary / yr</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Check</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {m.idrBelowInterest ? "IDR payment below monthly interest (balance can grow)." : "IDR covers first-month interest (simplified)."}
            </p>
          </div>
        </div>

        <div data-tour="sl-inputs" className="grid gap-8 lg:grid-cols-2 rounded-3xl border border-zinc-200 bg-zinc-50/80 p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold">Loan</h2>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Balance</span>
              <input
                type="number"
                min={0}
                step={100}
                value={balance}
                onChange={(e) => setBalance(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-semibold tabular-nums dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">APR %</span>
              <input
                type="number"
                step={0.01}
                min={0}
                max={20}
                value={aprPercent}
                onChange={(e) => setAprPercent(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-semibold tabular-nums dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <div>
              <div className="flex justify-between text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                <span>Standard term</span>
                <span>{standardTermYears} years</span>
              </div>
              <input
                type="range"
                min={10}
                max={25}
                step={5}
                value={standardTermYears}
                onChange={(e) => setStandardTermYears(Number(e.target.value))}
                className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold">Household (for IDR estimate)</h2>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Annual income (AGI, rough)</span>
              <input
                type="number"
                min={0}
                step={500}
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-semibold tabular-nums dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Family size</span>
              <input
                type="number"
                min={1}
                max={8}
                step={1}
                value={familySize}
                onChange={(e) => setFamilySize(clamp(Math.round(Number(e.target.value) || 1), 1, 8))}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-semibold tabular-nums dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Estimated discretionary income: <strong>{formatSlMoney(m.discretionaryAnnual)}</strong>/yr (
              {formatSlMoney(m.discretionaryMonthly)}/mo).
            </p>
          </div>
        </div>

        <div data-tour="sl-idr" className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="font-display text-lg font-bold mb-4">IDR assumptions (illustrative)</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="flex justify-between text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                <span>% of discretionary income / year</span>
                <span>{idrPercentOfDiscretionary}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={20}
                step={1}
                value={idrPercentOfDiscretionary}
                onChange={(e) => setIdrPercentOfDiscretionary(Number(e.target.value))}
                className="mt-2 w-full accent-zinc-800 dark:accent-zinc-200"
              />
              <p className="mt-2 text-xs text-zinc-500">PAYE-like plans often use 10% for grad debt; SAVE uses lower % for undergrad—this is a dial, not a form.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">IDR simulation length</p>
              <div className="flex gap-2">
                {[20, 25].map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setIdrHorizonYears(y)}
                    className={`rounded-full px-4 py-2 text-sm font-bold border transition-colors ${
                      idrHorizonYears === y
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                    }`}
                  >
                    {y} years
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                Ending balance after {idrHorizonYears} yrs (no forgiveness modeled):{" "}
                <strong className="tabular-nums">{formatSlMoney(m.idrAtHorizon.endingBalance)}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
