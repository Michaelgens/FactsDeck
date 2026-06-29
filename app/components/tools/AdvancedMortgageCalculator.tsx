"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Calculator,
  ChevronRight,
  Download,
  GitCompare,
  Home,
  Landmark,
  LineChart,
  PiggyBank,
  RefreshCw,
  Save,
  Sparkles,
  Target,
  TrendingDown,
  Wallet,
} from "lucide-react";
import {
  biweeklyExtraEquivalentMonthly,
  breakEvenMonthsForPoints,
  buildAmortizationSchedule,
  formatCurrency,
  formatCurrency2,
  maxLoanFromIncome,
  monthlyPI,
  monthlyPmiFromLoan,
  npvOfStream,
  pmiCancellationBalance,
  type ScheduleResult,
} from "../../lib/mortgage-math";
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";
import {
  FACTS_DECK_MORTGAGE_CALCULATOR,
  FACTS_DECK_MORTGAGE_TEST,
  JOURNEY_DEFAULTS,
  type BuyerGoal,
} from "./mortgage/mortgage-journey-types";
import { computeMortgageReadinessFromBands } from "./mortgage/compute-journey-metrics";
import {
  loadMortgageState,
  saveMortgageState,
} from "./mortgage/mortgage-storage";
import ToolDashboardTestCta from "./ToolDashboardTestCta";
import { MORTGAGE_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";
import {
  ToolDashboardGridBackdrop,
  ToolDashboardHeroBackdrop,
  tdGhostBtn,
  tdHero,
  tdHeroInnerNarrow,
  tdIconTile,
  tdNavLink,
  tdPage,
  tdPanel,
} from "./tool-dashboard-ui";

export type MortgageCalculatorInitialValues = {
  goal?: BuyerGoal;
  homePrice?: number;
  downPercent?: number;
  rate?: number;
  termYears?: number;
  propertyTaxPercent?: number;
  insuranceYearly?: number;
  hoaMonthly?: number;
  pmiAnnualPercent?: number;
  extraMonthly?: number;
  incomeMonthly?: number;
  debtsMonthly?: number;
  fromJourney?: boolean;
};

type AdvancedMortgageCalculatorProps = {
  initialValues?: MortgageCalculatorInitialValues;
  /** When true, do not auto-open the product tour (e.g. user arrived from the quick journey). */
  deferWalkthrough?: boolean;
};

type Tab = "overview" | "schedule" | "afford" | "refi" | "lab";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "schedule", label: "Amortization", icon: LineChart },
  { id: "afford", label: "Affordability", icon: Target },
  { id: "refi", label: "Refinance", icon: GitCompare },
  { id: "lab", label: "What-if lab", icon: Sparkles },
];

const GOAL_LABEL: Record<BuyerGoal, string> = {
  buying: "Buying a home",
  refinancing: "Refinancing",
  exploring: "Exploring",
};

function resolveInitialState(initialValues?: MortgageCalculatorInitialValues) {
  const saved = typeof window !== "undefined" ? loadMortgageState() : null;
  const d = JOURNEY_DEFAULTS;

  if (initialValues?.fromJourney) {
    return {
      goal: initialValues.goal ?? d.goal,
      homePrice: initialValues.homePrice ?? d.homePrice,
      downPercent: initialValues.downPercent ?? d.downPercent,
      rate: initialValues.rate ?? d.rate,
      termYears: initialValues.termYears ?? d.termYears,
      propertyTaxPercent: initialValues.propertyTaxPercent ?? 1.15,
      insuranceYearly: initialValues.insuranceYearly ?? Math.round((initialValues.homePrice ?? d.homePrice) * 0.0035),
      hoaMonthly: initialValues.hoaMonthly ?? 0,
      pmiAnnualPercent: initialValues.pmiAnnualPercent ?? 0.65,
      extraMonthly: initialValues.extraMonthly ?? d.extraMonthly,
      incomeMonthly: initialValues.incomeMonthly ?? d.incomeMonthly,
      debtsMonthly: initialValues.debtsMonthly ?? 0,
    };
  }

  if (saved) {
    return {
      goal: saved.goal,
      homePrice: saved.homePrice,
      downPercent: saved.downPercent,
      rate: saved.rate,
      termYears: saved.termYears,
      propertyTaxPercent: saved.propertyTaxPercent,
      insuranceYearly: saved.insuranceYearly,
      hoaMonthly: saved.hoaMonthly,
      pmiAnnualPercent: saved.pmiAnnualPercent,
      extraMonthly: saved.extraMonthly,
      incomeMonthly: saved.incomeMonthly,
      debtsMonthly: saved.debtsMonthly,
    };
  }

  return {
    goal: initialValues?.goal ?? d.goal,
    homePrice: initialValues?.homePrice ?? 425_000,
    downPercent: initialValues?.downPercent ?? 10,
    rate: initialValues?.rate ?? 6.75,
    termYears: initialValues?.termYears ?? 30,
    propertyTaxPercent: initialValues?.propertyTaxPercent ?? 1.15,
    insuranceYearly: initialValues?.insuranceYearly ?? 1800,
    hoaMonthly: initialValues?.hoaMonthly ?? 0,
    pmiAnnualPercent: initialValues?.pmiAnnualPercent ?? 0.65,
    extraMonthly: initialValues?.extraMonthly ?? 0,
    incomeMonthly: initialValues?.incomeMonthly ?? 9_500,
    debtsMonthly: initialValues?.debtsMonthly ?? 450,
  };
}

export default function AdvancedMortgageCalculator({
  initialValues,
  deferWalkthrough = false,
}: AdvancedMortgageCalculatorProps = {}) {
  const [hydrated, setHydrated] = useState(false);
  const [goal, setGoal] = useState<BuyerGoal>("buying");
  const [tab, setTab] = useState<Tab>("overview");
  const [tourOpen, setTourOpen] = useState(false);

  const TOUR_ID = "mortgage-calculator";

  const [homePrice, setHomePrice] = useState(425_000);
  const [downPercent, setDownPercent] = useState(10);
  const [rate, setRate] = useState(6.75);
  const [termYears, setTermYears] = useState(30);
  const [propertyTaxPercent, setPropertyTaxPercent] = useState(1.15);
  const [insuranceYearly, setInsuranceYearly] = useState(1800);
  const [hoaMonthly, setHoaMonthly] = useState(0);
  const [pmiAnnualPercent, setPmiAnnualPercent] = useState(0.65);
  const [extraMonthly, setExtraMonthly] = useState(0);
  const [lumpYear1, setLumpYear1] = useState(0);
  const [inflationDiscount, setInflationDiscount] = useState(2.5);

  const [refiRate, setRefiRate] = useState(5.99);
  const [refiTermYears, setRefiTermYears] = useState(30);
  const [refiClosingPct, setRefiClosingPct] = useState(2.5);
  const [pointsPercent, setPointsPercent] = useState(1.0);

  const [incomeMonthly, setIncomeMonthly] = useState(9_500);
  const [debtsMonthly, setDebtsMonthly] = useState(450);
  const [dtiHousing, setDtiHousing] = useState(28);
  const [dtiTotal, setDtiTotal] = useState(43);

  useEffect(() => {
    const state = resolveInitialState(initialValues);
    setGoal(state.goal);
    setHomePrice(state.homePrice);
    setDownPercent(state.downPercent);
    setRate(state.rate);
    setTermYears(state.termYears);
    setPropertyTaxPercent(state.propertyTaxPercent);
    setInsuranceYearly(state.insuranceYearly);
    setHoaMonthly(state.hoaMonthly);
    setPmiAnnualPercent(state.pmiAnnualPercent);
    setExtraMonthly(state.extraMonthly);
    setIncomeMonthly(state.incomeMonthly);
    setDebtsMonthly(state.debtsMonthly);
    setHydrated(true);
  }, [initialValues]);

  useEffect(() => {
    if (!hydrated) return;
    saveMortgageState({
      goal,
      homePrice,
      downPercent,
      rate,
      termYears,
      propertyTaxPercent,
      insuranceYearly,
      hoaMonthly,
      pmiAnnualPercent,
      extraMonthly,
      incomeMonthly,
      debtsMonthly,
    });
  }, [
    hydrated,
    goal,
    homePrice,
    downPercent,
    rate,
    termYears,
    propertyTaxPercent,
    insuranceYearly,
    hoaMonthly,
    pmiAnnualPercent,
    extraMonthly,
    incomeMonthly,
    debtsMonthly,
  ]);

  const loanAmount = useMemo(
    () => Math.max(0, homePrice * (1 - downPercent / 100)),
    [homePrice, downPercent]
  );
  const ltv = useMemo(
    () => (homePrice > 0 ? (loanAmount / homePrice) * 100 : 0),
    [homePrice, loanAmount]
  );
  const needsPmi = downPercent < 20;
  const termMonths = termYears * 12;

  const escrowTaxMonthly = (homePrice * (propertyTaxPercent / 100)) / 12;
  const escrowInsMonthly = insuranceYearly / 12;

  const scheduleInput = useMemo(() => {
    const lumps = new Map<number, number>();
    if (lumpYear1 > 0) lumps.set(12, lumpYear1);
    const pmiM =
      needsPmi && loanAmount > 0 ? monthlyPmiFromLoan(loanAmount, pmiAnnualPercent) : 0;
    const pmiDrop = needsPmi && homePrice > 0 ? pmiCancellationBalance(homePrice) : null;
    return {
      principal: loanAmount,
      annualRatePercent: rate,
      termMonths,
      extraMonthly,
      lumpSums: lumps,
      pmiMonthly: pmiM,
      pmiUntilBalanceLte: pmiDrop,
    };
  }, [
    loanAmount,
    rate,
    termMonths,
    extraMonthly,
    lumpYear1,
    needsPmi,
    pmiAnnualPercent,
    homePrice,
  ]);

  const schedule: ScheduleResult = useMemo(
    () => buildAmortizationSchedule(scheduleInput),
    [scheduleInput]
  );

  const pi = useMemo(
    () => monthlyPI(loanAmount, rate, termMonths),
    [loanAmount, rate, termMonths]
  );

  const pmiThisMonth =
    needsPmi && loanAmount > 0 ? monthlyPmiFromLoan(loanAmount, pmiAnnualPercent) : 0;

  const pitiFirstMonth =
    pi + escrowTaxMonthly + escrowInsMonthly + hoaMonthly + (schedule.rows[0]?.pmi ?? 0);

  const housingDtiPct = incomeMonthly > 0 ? (pitiFirstMonth / incomeMonthly) * 100 : 0;
  const readinessScore = useMemo(
    () => computeMortgageReadinessFromBands(housingDtiPct, downPercent, ltv),
    [housingDtiPct, downPercent, ltv]
  );

  const biweeklyExtra = useMemo(
    () => biweeklyExtraEquivalentMonthly(loanAmount, rate, termMonths),
    [loanAmount, rate, termMonths]
  );

  const scheduleBiweekly: ScheduleResult = useMemo(
    () =>
      buildAmortizationSchedule({
        ...scheduleInput,
        extraMonthly: scheduleInput.extraMonthly + biweeklyExtra,
      }),
    [scheduleInput, biweeklyExtra]
  );

  const yearlyBreakdown = useMemo(() => {
    const map = new Map<number, { interest: number; principal: number }>();
    for (const row of schedule.rows) {
      const yr = Math.ceil(row.month / 12);
      const cur = map.get(yr) ?? { interest: 0, principal: 0 };
      cur.interest += row.interestPayment;
      cur.principal += row.principalPayment;
      map.set(yr, cur);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, v]) => ({ year, ...v }));
  }, [schedule.rows]);

  const maxAfford = useMemo(
    () =>
      maxLoanFromIncome(
        incomeMonthly,
        debtsMonthly,
        dtiTotal,
        dtiHousing,
        escrowTaxMonthly + escrowInsMonthly + hoaMonthly + (needsPmi ? pmiThisMonth : 0),
        rate,
        termMonths
      ),
    [
      incomeMonthly,
      debtsMonthly,
      dtiTotal,
      dtiHousing,
      escrowTaxMonthly,
      escrowInsMonthly,
      hoaMonthly,
      needsPmi,
      pmiThisMonth,
      rate,
      termMonths,
    ]
  );

  const maxHomeWithDown = maxAfford.maxLoan / (1 - downPercent / 100);

  const refiLoan = loanAmount;
  const refiClosingCash = refiLoan * (refiClosingPct / 100);
  const refiPi = monthlyPI(refiLoan, refiRate, refiTermYears * 12);
  const refiSchedule = useMemo(
    () =>
      buildAmortizationSchedule({
        principal: refiLoan,
        annualRatePercent: refiRate,
        termMonths: refiTermYears * 12,
        extraMonthly: 0,
        lumpSums: new Map(),
        pmiMonthly: needsPmi ? monthlyPmiFromLoan(refiLoan, pmiAnnualPercent) : 0,
        pmiUntilBalanceLte: needsPmi && homePrice > 0 ? pmiCancellationBalance(homePrice) : null,
      }),
    [refiLoan, refiRate, refiTermYears, needsPmi, pmiAnnualPercent, homePrice]
  );

  const monthlySavings = pi - refiPi;
  const breakEvenRefi =
    monthlySavings > 0 ? Math.ceil(refiClosingCash / monthlySavings) : null;

  const pointsDollar = loanAmount * (pointsPercent / 100);
  const rateWithPoints = Math.max(0.1, rate - pointsPercent * 0.25);
  const bePoints = breakEvenMonthsForPoints(
    loanAmount,
    pointsDollar,
    rate,
    rateWithPoints,
    termMonths
  );

  const npvPayments = useMemo(() => {
    return npvOfStream(
      schedule.rows.map((r) => r.monthlyPI + r.pmi + escrowTaxMonthly + escrowInsMonthly + hoaMonthly),
      inflationDiscount
    );
  }, [schedule.rows, escrowTaxMonthly, escrowInsMonthly, hoaMonthly, inflationDiscount]);

  const exportCsv = useCallback(() => {
    trackToolEvent(MORTGAGE_SLUG, "export_text");
    const header = "Month,Principal,Interest,Balance,PMI\n";
    const lines = schedule.rows
      .map(
        (r) =>
          `${r.month},${r.principalPayment.toFixed(2)},${r.interestPayment.toFixed(2)},${r.balance.toFixed(2)},${r.pmi.toFixed(2)}`
      )
      .join("\n");
    const blob = new Blob([header + lines], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "factsdeck-amortization.csv";
    a.click();
  }, [schedule.rows]);

  useEffect(() => {
    if (!hydrated || deferWalkthrough) return;
    if (hasCompletedWalkthrough(TOUR_ID)) return;
    const t = window.setTimeout(() => {
      trackToolEvent(MORTGAGE_SLUG, "walkthrough_open", undefined, true);
      setTourOpen(true);
    }, 450);
    return () => window.clearTimeout(t);
  }, [deferWalkthrough, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      trackToolEvent(
        MORTGAGE_SLUG,
        "session_telemetry",
        {
          goal,
          score: readinessScore,
          homePrice: Math.round(homePrice),
          downPercent,
          rate,
          ltv: Math.round(ltv * 10) / 10,
          housingDtiPct: Math.round(housingDtiPct * 10) / 10,
          pitiFirstMonth: Math.round(pitiFirstMonth),
          highDti: housingDtiPct > 36,
          needsPmi,
        },
        true
      );
    }, 4000);
    return () => window.clearTimeout(t);
  }, [
    hydrated,
    goal,
    readinessScore,
    homePrice,
    downPercent,
    rate,
    ltv,
    housingDtiPct,
    pitiFirstMonth,
    needsPmi,
  ]);

  const openWalkthrough = () => {
    trackToolEvent(MORTGAGE_SLUG, "walkthrough_open", undefined, true);
    setTourOpen(true);
  };

  const walkthroughSteps: WalkthroughStep[] = useMemo(
    () => [
      {
        id: "welcome",
        placement: "center",
        title: "Welcome — let’s build your mortgage",
        body: (
          <div className="space-y-3">
            <p>
              This tool helps you estimate your monthly home cost. It includes <strong>P&amp;I</strong> (the loan
              payment), plus <strong>taxes</strong>, <strong>insurance</strong>, <strong>HOA</strong>, and{" "}
              <strong>PMI</strong> when needed.
            </p>
            <p>
              You can <strong>skip anytime</strong>. And you can replay this later using the{" "}
              <strong>Walk-through</strong> button.
            </p>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              Tip: use <strong>←</strong> / <strong>→</strong> to move between steps.
            </div>
          </div>
        ),
      },
      {
        id: "tabs",
        target: "[data-tour='mortgage-tabs']",
        title: "Tabs: pick what you want to explore",
        body: (
          <div className="space-y-2">
            <p>Use these tabs to switch views:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Overview</strong>: your monthly payment and key totals.
              </li>
              <li>
                <strong>Amortization</strong>: month-by-month schedule (and export).
              </li>
              <li>
                <strong>Affordability</strong>: a “what can I afford?” estimate using DTI.
              </li>
              <li>
                <strong>Refinance</strong>: compare a new rate and see break-even.
              </li>
              <li>
                <strong>What-if lab</strong>: quick comparisons + copy a snapshot.
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "loan-property",
        target: "[data-tour='mortgage-input-loan']",
        title: "Loan & property: start here",
        body: (
          <div className="space-y-2">
            <p>These inputs shape almost everything you see on the right.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Home price</strong> + <strong>down payment</strong> set your loan amount.
              </li>
              <li>
                <strong>Rate</strong> + <strong>term</strong> set how your payment is split (interest vs principal).
              </li>
            </ul>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Keep an eye on LTV — it often affects PMI and refi decisions.
            </p>
          </div>
        ),
      },
      {
        id: "escrow",
        target: "[data-tour='mortgage-input-escrow']",
        title: "Taxes, insurance, HOA: the “missing” monthly costs",
        body: (
          <div className="space-y-2">
            <p>These are often why your real monthly cost is higher than you expect.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Property taxes</strong> (as a % per year)
              </li>
              <li>
                <strong>Home insurance</strong> (yearly → monthly)
              </li>
              <li>
                <strong>HOA</strong> (monthly)
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "paydown",
        target: "[data-tour='mortgage-input-paydown']",
        title: "Pay down faster: extra principal",
        body: (
          <div className="space-y-2">
            <p>
              Paying a little extra toward principal can save a lot of interest over time.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Extra monthly</strong>: a simple monthly add-on
              </li>
              <li>
                <strong>One-time extra</strong>: like a bonus or refund
              </li>
              <li>
                <strong>Bi-weekly equivalence</strong>: a common payoff trick (modeled as extra monthly principal)
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "overview-cards",
        target: "[data-tour='mortgage-overview-cards']",
        onEnter: () => setTab("overview"),
        title: "Overview: your two main monthly numbers",
        body: (
          <div className="space-y-2">
            <p>You’ll usually care about these two:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Principal &amp; interest</strong>: the loan payment.
              </li>
              <li>
                <strong>PITI (+ PMI + HOA)</strong>: a more realistic “monthly cost to live here.”
              </li>
            </ul>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Budget with PITI. P&amp;I is only part of the story.
            </p>
          </div>
        ),
      },
      {
        id: "totals",
        target: "[data-tour='mortgage-totals']",
        onEnter: () => setTab("overview"),
        title: "Totals: what this loan costs over time",
        body: (
          <div className="space-y-2">
            <p>These tiles show the “big picture” totals.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Total interest</strong>: what you pay the lender over the life of the loan.
              </li>
              <li>
                <strong>Total PMI</strong>: what PMI adds up to (if you have it).
              </li>
              <li>
                <strong>Payoff months</strong>: how long until it’s paid off.
              </li>
            </ul>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Lower monthly payments can mean more interest if the loan lasts longer.
            </p>
          </div>
        ),
      },
      {
        id: "npv",
        target: "[data-tour='mortgage-npv']",
        onEnter: () => setTab("overview"),
        title: "Present value (NPV): a “today’s dollars” view",
        body: (
          <div className="space-y-2">
            <p>
              This is a rough way to compare future payments in “today’s dollars,” using an inflation discount.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Think of it as a planning helper (not advice).
            </p>
          </div>
        ),
      },
      {
        id: "schedule-export",
        target: "[data-tour='mortgage-export-csv']",
        onEnter: () => setTab("schedule"),
        title: "Amortization: the month-by-month table",
        body: (
          <div className="space-y-2">
            <p>
              This shows, month by month, how much goes to <strong>principal</strong>, <strong>interest</strong>,{" "}
              and <strong>PMI</strong>, plus your remaining balance.
            </p>
            <p>
              Use <strong>Export CSV</strong> if you want to save it or share it.
            </p>
          </div>
        ),
      },
      {
        id: "affordability",
        target: "[data-tour='mortgage-afford']",
        onEnter: () => setTab("afford"),
        title: "Affordability: a quick DTI check",
        body: (
          <div className="space-y-2">
            <p>This section gives a quick “can I afford this?” estimate.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Housing DTI</strong>: housing cost vs income
              </li>
              <li>
                <strong>Total DTI</strong>: housing + other debts vs income
              </li>
            </ul>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Try lowering the DTI limits to be more conservative.
            </p>
          </div>
        ),
      },
      {
        id: "refi",
        target: "[data-tour='mortgage-refi']",
        onEnter: () => setTab("refi"),
        title: "Refinance: compare a new rate",
        body: (
          <div className="space-y-2">
            <p>
              Refinancing usually means paying closing costs to (hopefully) get a lower payment.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              If you move before you break even, it may not be worth it.
            </p>
          </div>
        ),
      },
      {
        id: "refi-break-even",
        target: "[data-tour='mortgage-refi-break-even']",
        onEnter: () => setTab("refi"),
        title: "Break-even: when the refi “pays for itself”",
        body: (
          <div className="space-y-2">
            <p>
              Simple idea: <strong>closing costs</strong> ÷ <strong>monthly savings</strong> ≈{" "}
              <strong>months to break-even</strong>.
            </p>
            <p>
              Points are also shown as an optional upfront cost, with their own break-even.
            </p>
          </div>
        ),
      },
      {
        id: "lab-json",
        target: "[data-tour='mortgage-copy-json']",
        onEnter: () => setTab("lab"),
        title: "What-if lab: quick compare",
        body: (
          <div className="space-y-2">
            <p>Use this area to compare a couple of payoff ideas quickly.</p>
            <p>
              Use <strong>Copy scenario JSON</strong> if you want to save/share your setup.
            </p>
          </div>
        ),
      },
      {
        id: "finish",
        placement: "center",
        title: "All set",
        body: (
          <div className="space-y-3">
            <p>Here’s a simple way to use this tool:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Set <strong>price</strong>, <strong>down</strong>, <strong>rate</strong>, and <strong>term</strong>
              </li>
              <li>
                Add <strong>tax/insurance/HOA</strong> (so PITI is realistic)
              </li>
              <li>
                Try a small <strong>extra principal</strong>
              </li>
              <li>
                Export the <strong>schedule</strong> or copy scenario JSON from the lab
              </li>
            </ol>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              Estimates only — always double-check with your lender and your local tax/insurance numbers.
            </div>
          </div>
        ),
      },
    ],
    [downPercent, pmiAnnualPercent, pitiFirstMonth, schedule.monthsToPayoff, scheduleBiweekly.monthsToPayoff, tab]
  );

  if (!hydrated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500 text-sm font-medium">
        Loading calculator…
      </div>
    );
  }

  return (
    <div className={tdPage}>
      <ToolDashboardGridBackdrop />
      <ToolWalkthrough
        id={TOUR_ID}
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onFinish={() => {
          trackToolEvent(MORTGAGE_SLUG, "walkthrough_complete", undefined, true);
          setTab("overview");
          try {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          } catch {
            window.scrollTo(0, 0);
          }
        }}
        steps={walkthroughSteps}
      />
      <section className={tdHero}>
        <ToolDashboardHeroBackdrop accent="emerald" />

        <div className={tdHeroInnerNarrow}>
          <div className="flex items-center justify-between gap-3 flex-wrap" data-tour="mortgage-top-nav">
            <Link href="/" className={tdNavLink}>
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link href="/post?category=Personal%20Finance&q=mortgage" className={tdNavLink}>
              Read mortgage guides
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 sm:mt-8" data-tour="mortgage-hero">
            <div className="flex items-center gap-3">
              <span className={tdIconTile}>
                <Building2 className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 bg-clip-text text-transparent dark:from-emerald-300 dark:via-cyan-300 dark:to-sky-300">
                    {FACTS_DECK_MORTGAGE_CALCULATOR}
                  </span>
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  <span className="hidden sm:inline">
                    Focus: <strong className="text-zinc-800 dark:text-zinc-200">{GOAL_LABEL[goal]}</strong> — full PITI, amortization, refinance break-even, and affordability.
                  </span>
                  <span className="sm:hidden">
                    Focus: <strong className="text-zinc-800 dark:text-zinc-200">{GOAL_LABEL[goal]}</strong> — PITI & schedules
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={openWalkthrough} className={tdGhostBtn}>
                <BookOpen className="h-4 w-4" />
                Walk-through
              </button>
            </div>

            <div className="mt-6">
              <ToolDashboardTestCta
                toolSlug="mortgage-calculator"
                testLabel={FACTS_DECK_MORTGAGE_TEST}
                blurb="Run the short interactive flow again—fresh answers, results snapshot, then land back here with the full workspace."
              />
            </div>

            <div
              className="mt-5 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
              data-tour="mortgage-tabs"
            >
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`inline-flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/15 ring-1 ring-zinc-900/10 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-lg dark:ring-white/20"
                        : "bg-zinc-100/90 text-zinc-700 hover:bg-zinc-200/90 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-7 sm:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div
                className={tdPanel}
                data-tour="mortgage-input-loan"
              >
                <h2 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                  Loan & property
                </h2>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                      Home price
                    </span>
                    <input
                      type="number"
                      value={homePrice}
                      onChange={(e) => setHomePrice(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 font-mono focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                      Down payment ({downPercent.toFixed(1)}%)
                    </span>
                    <input
                      type="range"
                      min={3}
                      max={50}
                      step={0.5}
                      value={downPercent}
                      onChange={(e) => setDownPercent(Number(e.target.value))}
                      className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
                    />
                  </label>
                  <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-300">
                    <span>Loan amount</span>
                    <span className="font-mono font-bold">{formatCurrency(loanAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-300">
                    <span>LTV</span>
                    <span className="font-mono">{ltv.toFixed(1)}%</span>
                  </div>
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                      Interest rate (% APR)
                    </span>
                    <input
                      type="number"
                      step={0.001}
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                      Term (years)
                    </span>
                    <select
                      value={termYears}
                      onChange={(e) => setTermYears(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                    >
                      {[10, 15, 20, 25, 30].map((y) => (
                        <option key={y} value={y}>
                          {y} years
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div
                className={tdPanel}
                data-tour="mortgage-input-escrow"
              >
                <h2 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                  Taxes, insurance, HOA
                </h2>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Property tax (% of value / yr)
                    </span>
                    <input
                      type="number"
                      step={0.01}
                      value={propertyTaxPercent}
                      onChange={(e) => setPropertyTaxPercent(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Home insurance ($ / year)
                    </span>
                    <input
                      type="number"
                      value={insuranceYearly}
                      onChange={(e) => setInsuranceYearly(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      HOA ($ / month)
                    </span>
                    <input
                      type="number"
                      value={hoaMonthly}
                      onChange={(e) => setHoaMonthly(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                    />
                  </label>
                  {needsPmi && (
                    <label className="block" data-tour="mortgage-input-pmi">
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        PMI (% of loan / year, until 78% LTV)
                      </span>
                      <input
                        type="number"
                        step={0.01}
                        value={pmiAnnualPercent}
                        onChange={(e) => setPmiAnnualPercent(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div
                className="rounded-2xl bg-zinc-50 border border-zinc-200 p-6 dark:bg-zinc-950 dark:border-zinc-800"
                data-tour="mortgage-input-paydown"
              >
                <h2 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                  Pay down faster
                </h2>
                <label className="block mb-3">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Extra to principal ($ / month)
                  </span>
                  <input
                    type="number"
                    value={extraMonthly}
                    onChange={(e) => setExtraMonthly(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                  />
                </label>
                <label className="block mb-3">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    One-time extra at month 12 (bonus, tax refund…)
                  </span>
                  <input
                    type="number"
                    value={lumpYear1}
                    onChange={(e) => setLumpYear1(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                  />
                </label>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Bi-weekly schedule ≈ adding{" "}
                  <strong className="text-zinc-900 dark:text-zinc-100">
                    {formatCurrency2(biweeklyExtra)}
                  </strong>{" "}
                  / month to principal (26 half-payments per year).
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              {tab === "overview" && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4" data-tour="mortgage-overview-cards">
                    <div className="rounded-2xl bg-zinc-900 text-white p-6 shadow-sm dark:bg-zinc-950">
                      <p className="text-white/70 text-sm font-medium mb-1">Principal & interest</p>
                      <p className="font-display text-3xl md:text-4xl font-bold">{formatCurrency2(pi)}</p>
                      <p className="text-white/70 text-xs mt-2">Fixed payment (loan servicer)</p>
                    </div>
                    <div className="rounded-2xl bg-white text-zinc-900 p-6 border border-zinc-200 dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800">
                      <p className="text-zinc-600 dark:text-zinc-300 text-sm font-medium mb-1">Estimated PITI + PMI + HOA</p>
                      <p className="font-display text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency2(pitiFirstMonth)}
                      </p>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-2">
                        Incl. escrow & PMI month 1 (PMI modeled to drop at 78% LTV)
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4" data-tour="mortgage-totals">
                    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-5">
                      <PiggyBank className="h-8 w-8 text-zinc-900 dark:text-zinc-100 mb-2" />
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold">
                        Total interest
                      </p>
                      <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(schedule.totalInterest)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-5">
                      <Wallet className="h-8 w-8 text-zinc-900 dark:text-zinc-100 mb-2" />
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold">
                        Total PMI (est.)
                      </p>
                      <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(schedule.totalPmi)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-5">
                      <RefreshCw className="h-8 w-8 text-zinc-900 dark:text-zinc-100 mb-2" />
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold">
                        Payoff / months
                      </p>
                      <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {schedule.monthsToPayoff} mo
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        vs {termMonths} scheduled → saves {Math.max(0, termMonths - schedule.monthsToPayoff)} mo
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                    <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                      Interest vs principal (by calendar year)
                    </h3>
                    <div className="space-y-3">
                      {yearlyBreakdown.slice(0, 12).map((y) => {
                        const max = Math.max(
                          ...yearlyBreakdown.map((x) => x.interest + x.principal),
                          1
                        );
                        const total = y.interest + y.principal;
                        const wInt = (y.interest / max) * 100;
                        const wPr = (y.principal / max) * 100;
                        return (
                          <div key={y.year}>
                            <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300 mb-1">
                              <span>Year {y.year}</span>
                              <span className="font-mono">{formatCurrency(total)}</span>
                            </div>
                            <div className="flex h-3 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                              <div
                                className="bg-zinc-300 dark:bg-zinc-700 h-full transition-all"
                                style={{ width: `${wInt}%` }}
                                title="Interest"
                              />
                              <div
                                className="bg-zinc-900 dark:bg-zinc-100 h-full transition-all"
                                style={{ width: `${wPr}%` }}
                                title="Principal"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3">
                      Dark = principal · Light = interest (scaled to largest year)
                    </p>
                  </div>

                  <label
                    className="flex items-center justify-between rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/40"
                    data-tour="mortgage-npv"
                  >
                    <span className="text-sm text-zinc-700 dark:text-zinc-200">
                      Inflation discount for NPV of payments (% / year)
                    </span>
                    <input
                      type="number"
                      step={0.1}
                      value={inflationDiscount}
                      onChange={(e) => setInflationDiscount(Number(e.target.value))}
                      className="w-24 rounded-lg border border-zinc-200 px-3 py-2 text-right bg-white text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                    />
                  </label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    Approx. present value of all future PITI+PMI streams:{" "}
                    <strong className="text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(npvPayments)}
                    </strong>{" "}
                    (rough model; not tax advice)
                  </p>
                </>
              )}

              {tab === "schedule" && (
                <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100">
                      Amortization schedule
                    </h3>
                    <button
                      data-tour="mortgage-export-csv"
                      type="button"
                      onClick={exportCsv}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </button>
                  </div>
                  <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-zinc-100 dark:bg-zinc-950 z-10">
                        <tr className="text-left text-xs uppercase text-zinc-500 dark:text-zinc-400">
                          <th className="px-4 py-3">#</th>
                          <th className="px-4 py-3">Principal</th>
                          <th className="px-4 py-3">Interest</th>
                          <th className="px-4 py-3">PMI</th>
                          <th className="px-4 py-3">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.rows.slice(0, 360).map((r) => (
                          <tr
                            key={r.month}
                            className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                          >
                            <td className="px-4 py-2 font-mono text-zinc-600 dark:text-zinc-300">
                              {r.month}
                            </td>
                            <td className="px-4 py-2 font-mono">{formatCurrency2(r.principalPayment)}</td>
                            <td className="px-4 py-2 font-mono">
                              {formatCurrency2(r.interestPayment)}
                            </td>
                            <td className="px-4 py-2 font-mono text-zinc-500 dark:text-zinc-400">
                              {r.pmi > 0 ? formatCurrency2(r.pmi) : "—"}
                            </td>
                            <td className="px-4 py-2 font-mono">{formatCurrency2(r.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 p-4">
                    Showing first {Math.min(360, schedule.rows.length)} months of {schedule.rows.length} total.
                  </p>
                </div>
              )}

              {tab === "afford" && (
                <div className="space-y-6" data-tour="mortgage-afford">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                        Gross monthly income
                      </span>
                      <input
                        type="number"
                        value={incomeMonthly}
                        onChange={(e) => setIncomeMonthly(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                        Monthly debts (non-housing)
                      </span>
                      <input
                        type="number"
                        value={debtsMonthly}
                        onChange={(e) => setDebtsMonthly(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                        Max housing DTI ({dtiHousing}%)
                      </span>
                      <input
                        type="range"
                        min={20}
                        max={40}
                        value={dtiHousing}
                        onChange={(e) => setDtiHousing(Number(e.target.value))}
                        className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                        Max total DTI ({dtiTotal}%)
                      </span>
                      <input
                        type="range"
                        min={36}
                        max={50}
                        value={dtiTotal}
                        onChange={(e) => setDtiTotal(Number(e.target.value))}
                        className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
                      />
                    </label>
                  </div>
                  <div className="rounded-2xl bg-zinc-900 text-white p-8 shadow-sm dark:bg-zinc-950">
                    <p className="text-white/70 text-sm mb-2">Estimated max loan (P&amp;I only, rules-based)</p>
                    <p className="font-display text-4xl font-bold">{formatCurrency(maxAfford.maxLoan)}</p>
                    <p className="text-white/80 mt-4 text-sm">
                      Implied max home price at {downPercent}% down:{" "}
                      <strong className="text-white text-lg">{formatCurrency(maxHomeWithDown)}</strong>
                    </p>
                    <p className="text-white/70 text-xs mt-3">
                      Uses front-end ({dtiHousing}%) &amp; back-end ({dtiTotal}%) caps with your escrow + PMI
                      estimate. Lender results vary.
                    </p>
                  </div>
                </div>
              )}

              {tab === "refi" && (
                <div className="space-y-6" data-tour="mortgage-refi">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                        New rate (% APR)
                      </span>
                      <input
                        type="number"
                        step={0.001}
                        value={refiRate}
                        onChange={(e) => setRefiRate(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                        New term (years)
                      </span>
                      <select
                        value={refiTermYears}
                        onChange={(e) => setRefiTermYears(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                      >
                        {[15, 20, 25, 30].map((y) => (
                          <option key={y} value={y}>
                            {y} years
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                        Closing costs (% of loan)
                      </span>
                      <input
                        type="number"
                        step={0.1}
                        value={refiClosingPct}
                        onChange={(e) => setRefiClosingPct(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                        Discount points (% of loan)
                      </span>
                      <input
                        type="number"
                        step={0.125}
                        value={pointsPercent}
                        onChange={(e) => setPointsPercent(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                      />
                    </label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-zinc-200 p-6 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">Current loan</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">
                        P&amp;I: <strong>{formatCurrency2(pi)}</strong>
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
                        Remaining interest (est.):{" "}
                        <strong>{formatCurrency(schedule.totalInterest)}</strong>
                      </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 p-6 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">After refinance</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">
                        New P&amp;I: <strong>{formatCurrency2(refiPi)}</strong>
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
                        New total interest (est.):{" "}
                        <strong>{formatCurrency(refiSchedule.totalInterest)}</strong>
                      </p>
                    </div>
                  </div>
                  <div
                    className="rounded-2xl bg-zinc-900 text-white p-6 border border-zinc-800 dark:bg-zinc-950"
                    data-tour="mortgage-refi-break-even"
                  >
                    <p className="text-white/70 text-sm">Monthly P&amp;I savings</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency2(monthlySavings)}</p>
                    <p className="text-white/70 text-sm mt-4">
                      Closing costs (~{formatCurrency(refiClosingCash)}): break-even in{" "}
                      <strong className="text-white">
                        {breakEvenRefi != null ? `${breakEvenRefi} months` : "N/A"}
                      </strong>
                    </p>
                    {bePoints != null && (
                      <p className="text-white/70 text-sm mt-2">
                        Buying {pointsPercent}% points (~{formatCurrency(pointsDollar)}) for ~{pointsPercent * 0.25}
                        % rate drop → break-even in <strong className="text-white">{bePoints} months</strong>{" "}
                        (illustrative)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {tab === "lab" && (
                <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                  <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
                    What-if lab
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
                    Compare baseline payoff ({schedule.monthsToPayoff} mo) vs paying bi-weekly equivalent (
                    {scheduleBiweekly.monthsToPayoff} mo). Extra principal snowballs — even small bi-weekly
                    equivalence trims years off.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs uppercase font-bold text-zinc-500 dark:text-zinc-400">
                        Baseline payoff
                      </p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                        {schedule.monthsToPayoff} mo
                      </p>
                    </div>
                    <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs uppercase font-bold text-zinc-600 dark:text-zinc-300">
                        + bi-weekly equivalent
                      </p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                        {scheduleBiweekly.monthsToPayoff} mo
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Saves {Math.max(0, schedule.monthsToPayoff - scheduleBiweekly.monthsToPayoff)} months
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      data-tour="mortgage-copy-json"
                      type="button"
                      onClick={() => {
                        trackToolEvent(MORTGAGE_SLUG, "export_json");
                        navigator.clipboard.writeText(
                          JSON.stringify(
                            {
                              homePrice,
                              downPercent,
                              rate,
                              termYears,
                              loanAmount,
                              piti: pitiFirstMonth,
                              payoffMonths: schedule.monthsToPayoff,
                            },
                            null,
                            2
                          )
                        );
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900/40"
                    >
                      <Save className="h-4 w-4" />
                      Copy scenario JSON
                    </button>
                    <Link
                      href="/post?category=Real%20Estate&q=mortgage"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    >
                      Real estate guides
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-12 max-w-3xl mx-auto leading-relaxed">
            Educational estimates only — not financial, tax, or legal advice. PMI removal, DTI limits, and
            refinance terms depend on your lender, credit profile, and program. Rates and costs change daily.
          </p>
        </div>
      </section>
    </div>
  );
}
