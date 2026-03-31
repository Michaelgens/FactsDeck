"use client";

import { useEffect, useMemo, useState, useCallback, type FormEvent } from "react";
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
  Loader2,
  Mail,
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
import type { MortgageSummaryPayload } from "../../lib/mortgage-summary-email";
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";

type Tab = "overview" | "schedule" | "afford" | "refi" | "lab";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "schedule", label: "Amortization", icon: LineChart },
  { id: "afford", label: "Affordability", icon: Target },
  { id: "refi", label: "Refinance", icon: GitCompare },
  { id: "lab", label: "What-if lab", icon: Sparkles },
];

export default function AdvancedMortgageCalculator() {
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

  const [emailSummaryAddr, setEmailSummaryAddr] = useState("");
  const [emailHp, setEmailHp] = useState("");
  const [emailSummarySending, setEmailSummarySending] = useState(false);
  const [emailSummaryNote, setEmailSummaryNote] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

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

  const buildSummaryPayload = useCallback((): MortgageSummaryPayload => {
    return {
      homePrice,
      downPercent,
      loanAmount,
      rate,
      termYears,
      monthlyPI: pi,
      pitiFirstMonth,
      totalInterest: schedule.totalInterest,
      totalPmi: schedule.totalPmi,
      payoffMonths: schedule.monthsToPayoff,
      ltv,
      extraMonthly,
      propertyTaxPercent,
      insuranceYearly,
      hoaMonthly,
      generatedAt: new Date().toISOString(),
    };
  }, [
    homePrice,
    downPercent,
    loanAmount,
    rate,
    termYears,
    pi,
    pitiFirstMonth,
    schedule.totalInterest,
    schedule.totalPmi,
    schedule.monthsToPayoff,
    ltv,
    extraMonthly,
    propertyTaxPercent,
    insuranceYearly,
    hoaMonthly,
  ]);

  const sendSummaryEmail = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setEmailSummaryNote(null);
      if (emailHp.trim()) return;

      const trimmed = emailSummaryAddr.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setEmailSummaryNote({ kind: "err", text: "Enter a valid email address." });
        return;
      }

      setEmailSummarySending(true);
      try {
        const res = await fetch("/api/tools/mortgage-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: trimmed,
            website: emailHp,
            summary: buildSummaryPayload(),
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          setEmailSummaryNote({
            kind: "err",
            text: data.error ?? "Could not send. Try again later.",
          });
          return;
        }
        setEmailSummaryNote({
          kind: "ok",
          text: "Sent. Check your inbox (and spam) for your summary.",
        });
      } catch {
        setEmailSummaryNote({ kind: "err", text: "Network error. Try again." });
      } finally {
        setEmailSummarySending(false);
      }
    },
    [emailHp, emailSummaryAddr, buildSummaryPayload]
  );

  const exportCsv = useCallback(() => {
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
    if (hasCompletedWalkthrough(TOUR_ID)) return;
    const t = window.setTimeout(() => setTourOpen(true), 450);
    return () => window.clearTimeout(t);
  }, []);

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
            <div className="rounded-xl border border-slate-200 dark:border-purple-500/30 bg-slate-50 dark:bg-dark-850/40 p-3 text-xs text-slate-600 dark:text-purple-200/90">
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
            <p className="text-xs text-slate-500 dark:text-purple-300/90">
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
            <p className="text-xs text-slate-500 dark:text-purple-300/90">
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
            <p className="text-xs text-slate-500 dark:text-purple-300/90">
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
            <p className="text-xs text-slate-500 dark:text-purple-300/90">
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
            <p className="text-xs text-slate-500 dark:text-purple-300/90">
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
            <p className="text-xs text-slate-500 dark:text-purple-300/90">
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
        id: "email",
        target: "[data-tour='mortgage-email']",
        title: "Email summary: send it to yourself",
        body: (
          <div className="space-y-2">
            <p>Want a record? Email yourself a quick summary of your inputs and key results.</p>
            <p className="text-xs text-slate-500 dark:text-purple-300/90">
              Tip: send a few scenarios (like 10% down vs 20%) and compare later.
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
                Export the <strong>schedule</strong> or email yourself a summary
              </li>
            </ol>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              Estimates only — always double-check with your lender and your local tax/insurance numbers.
            </div>
          </div>
        ),
      },
    ],
    [downPercent, pmiAnnualPercent, pitiFirstMonth, schedule.monthsToPayoff, scheduleBiweekly.monthsToPayoff, tab]
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:via-dark-900 dark:to-purple-950/40">
      <ToolWalkthrough
        id={TOUR_ID}
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onFinish={() => {
          setTab("overview");
          try {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          } catch {
            window.scrollTo(0, 0);
          }
        }}
        steps={walkthroughSteps}
      />
      <div className="relative overflow-hidden border-b border-purple-200/50 dark:border-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-amber-500/10 dark:from-purple-900/40 dark:via-transparent dark:to-amber-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <Link
            href="/"
            className="inline-flex items-center text-purple-600 dark:text-emerald-400/90 hover:text-purple-700 dark:hover:text-emerald-300 font-semibold text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10" data-tour="mortgage-hero">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Pro tool
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
                Advanced Mortgage Calculator
              </h1>
              <p className="text-slate-600 dark:text-purple-200/90 max-w-2xl text-lg leading-relaxed">
                Full PITI + PMI drop-off, extra payments, bi-weekly equivalence, refinance break-even,
                affordability from DTI, inflation-adjusted cost, and exportable schedules — in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2" data-tour="mortgage-tabs">
              <button
                type="button"
                onClick={() => setTourOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/70 dark:bg-dark-800/70 border border-slate-200 dark:border-purple-500/30 text-slate-800 dark:text-purple-200 hover:bg-white dark:hover:bg-purple-900/20 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Walk-through
              </button>
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30"
                        : "bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div
                className="rounded-2xl bg-white dark:bg-dark-800/80 border border-slate-200 dark:border-purple-500/30 p-6 shadow-xl shadow-purple-500/5"
                data-tour="mortgage-input-loan"
              >
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-500" />
                  Loan & property
                </h2>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 dark:text-purple-400 uppercase">
                      Home price
                    </span>
                    <input
                      type="number"
                      value={homePrice}
                      onChange={(e) => setHomePrice(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-purple-500/30 bg-slate-50 dark:bg-dark-900 px-4 py-3 text-slate-900 dark:text-white font-mono"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 dark:text-purple-400 uppercase">
                      Down payment ({downPercent.toFixed(1)}%)
                    </span>
                    <input
                      type="range"
                      min={3}
                      max={50}
                      step={0.5}
                      value={downPercent}
                      onChange={(e) => setDownPercent(Number(e.target.value))}
                      className="mt-2 w-full accent-purple-600"
                    />
                  </label>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-purple-300">
                    <span>Loan amount</span>
                    <span className="font-mono font-bold">{formatCurrency(loanAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-purple-300">
                    <span>LTV</span>
                    <span className="font-mono">{ltv.toFixed(1)}%</span>
                  </div>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 dark:text-purple-400 uppercase">
                      Interest rate (% APR)
                    </span>
                    <input
                      type="number"
                      step={0.001}
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-purple-500/30 bg-slate-50 dark:bg-dark-900 px-4 py-3"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 dark:text-purple-400 uppercase">
                      Term (years)
                    </span>
                    <select
                      value={termYears}
                      onChange={(e) => setTermYears(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-purple-500/30 bg-slate-50 dark:bg-dark-900 px-4 py-3"
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
                className="rounded-2xl bg-white dark:bg-dark-800/80 border border-slate-200 dark:border-purple-500/30 p-6 shadow-lg"
                data-tour="mortgage-input-escrow"
              >
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-amber-500" />
                  Taxes, insurance, HOA
                </h2>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 dark:text-purple-400">
                      Property tax (% of value / yr)
                    </span>
                    <input
                      type="number"
                      step={0.01}
                      value={propertyTaxPercent}
                      onChange={(e) => setPropertyTaxPercent(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-purple-500/30 bg-slate-50 dark:bg-dark-900 px-4 py-3"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 dark:text-purple-400">
                      Home insurance ($ / year)
                    </span>
                    <input
                      type="number"
                      value={insuranceYearly}
                      onChange={(e) => setInsuranceYearly(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-purple-500/30 bg-slate-50 dark:bg-dark-900 px-4 py-3"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 dark:text-purple-400">
                      HOA ($ / month)
                    </span>
                    <input
                      type="number"
                      value={hoaMonthly}
                      onChange={(e) => setHoaMonthly(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-purple-500/30 bg-slate-50 dark:bg-dark-900 px-4 py-3"
                    />
                  </label>
                  {needsPmi && (
                    <label className="block" data-tour="mortgage-input-pmi">
                      <span className="text-xs font-semibold text-slate-500 dark:text-purple-400">
                        PMI (% of loan / year, until 78% LTV)
                      </span>
                      <input
                        type="number"
                        step={0.01}
                        value={pmiAnnualPercent}
                        onChange={(e) => setPmiAnnualPercent(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-purple-500/30 bg-slate-50 dark:bg-dark-900 px-4 py-3"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div
                className="rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-dark-800 border border-purple-200 dark:border-purple-500/30 p-6"
                data-tour="mortgage-input-paydown"
              >
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-emerald-500" />
                  Pay down faster
                </h2>
                <label className="block mb-3">
                  <span className="text-xs font-semibold text-slate-600 dark:text-purple-300">
                    Extra to principal ($ / month)
                  </span>
                  <input
                    type="number"
                    value={extraMonthly}
                    onChange={(e) => setExtraMonthly(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-purple-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 px-4 py-3"
                  />
                </label>
                <label className="block mb-3">
                  <span className="text-xs font-semibold text-slate-600 dark:text-purple-300">
                    One-time extra at month 12 (bonus, tax refund…)
                  </span>
                  <input
                    type="number"
                    value={lumpYear1}
                    onChange={(e) => setLumpYear1(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-purple-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 px-4 py-3"
                  />
                </label>
                <p className="text-xs text-slate-600 dark:text-purple-400 leading-relaxed">
                  Bi-weekly schedule ≈ adding{" "}
                  <strong className="text-purple-700 dark:text-emerald-400">
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
                    <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-6 shadow-xl">
                      <p className="text-purple-200 text-sm font-medium mb-1">Principal & interest</p>
                      <p className="font-display text-3xl md:text-4xl font-bold">{formatCurrency2(pi)}</p>
                      <p className="text-purple-200/80 text-xs mt-2">Fixed payment (loan servicer)</p>
                    </div>
                    <div className="rounded-2xl bg-slate-900 dark:bg-dark-800 text-white p-6 border border-purple-500/20">
                      <p className="text-slate-400 text-sm font-medium mb-1">Estimated PITI + PMI + HOA</p>
                      <p className="font-display text-3xl md:text-4xl font-bold text-emerald-400">
                        {formatCurrency2(pitiFirstMonth)}
                      </p>
                      <p className="text-slate-500 text-xs mt-2">
                        Incl. escrow & PMI month 1 (PMI modeled to drop at 78% LTV)
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4" data-tour="mortgage-totals">
                    <div className="rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-800/50 p-5">
                      <PiggyBank className="h-8 w-8 text-amber-500 mb-2" />
                      <p className="text-xs text-slate-500 dark:text-purple-400 uppercase font-bold">
                        Total interest
                      </p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(schedule.totalInterest)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-800/50 p-5">
                      <Wallet className="h-8 w-8 text-purple-500 mb-2" />
                      <p className="text-xs text-slate-500 dark:text-purple-400 uppercase font-bold">
                        Total PMI (est.)
                      </p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(schedule.totalPmi)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-800/50 p-5">
                      <RefreshCw className="h-8 w-8 text-emerald-500 mb-2" />
                      <p className="text-xs text-slate-500 dark:text-purple-400 uppercase font-bold">
                        Payoff / months
                      </p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {schedule.monthsToPayoff} mo
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        vs {termMonths} scheduled → saves {Math.max(0, termMonths - schedule.monthsToPayoff)} mo
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-800/40 p-6">
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-purple-500" />
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
                            <div className="flex justify-between text-xs text-slate-600 dark:text-purple-300 mb-1">
                              <span>Year {y.year}</span>
                              <span className="font-mono">{formatCurrency(total)}</span>
                            </div>
                            <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-dark-900">
                              <div
                                className="bg-amber-400/90 h-full transition-all"
                                style={{ width: `${wInt}%` }}
                                title="Interest"
                              />
                              <div
                                className="bg-purple-500 h-full transition-all"
                                style={{ width: `${wPr}%` }}
                                title="Principal"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-purple-500 mt-3">
                      Amber = interest · Purple = principal (scaled to largest year)
                    </p>
                  </div>

                  <label
                    className="flex items-center justify-between rounded-xl border border-dashed border-purple-300 dark:border-purple-500/40 bg-purple-50/50 dark:bg-purple-900/10 px-4 py-3"
                    data-tour="mortgage-npv"
                  >
                    <span className="text-sm text-slate-700 dark:text-purple-200">
                      Inflation discount for NPV of payments (% / year)
                    </span>
                    <input
                      type="number"
                      step={0.1}
                      value={inflationDiscount}
                      onChange={(e) => setInflationDiscount(Number(e.target.value))}
                      className="w-24 rounded-lg border border-purple-200 dark:border-purple-500/30 px-3 py-2 text-right bg-white dark:bg-dark-900"
                    />
                  </label>
                  <p className="text-sm text-slate-600 dark:text-purple-300">
                    Approx. present value of all future PITI+PMI streams:{" "}
                    <strong className="text-purple-700 dark:text-emerald-400">
                      {formatCurrency(npvPayments)}
                    </strong>{" "}
                    (rough model; not tax advice)
                  </p>
                </>
              )}

              {tab === "schedule" && (
                <div className="rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-800/40 overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-purple-500/20">
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-purple-100">
                      Amortization schedule
                    </h3>
                    <button
                      data-tour="mortgage-export-csv"
                      type="button"
                      onClick={exportCsv}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </button>
                  </div>
                  <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-slate-100 dark:bg-dark-900 z-10">
                        <tr className="text-left text-xs uppercase text-slate-500 dark:text-purple-400">
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
                            className="border-t border-slate-100 dark:border-purple-500/10 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
                          >
                            <td className="px-4 py-2 font-mono text-slate-600 dark:text-purple-300">
                              {r.month}
                            </td>
                            <td className="px-4 py-2 font-mono">{formatCurrency2(r.principalPayment)}</td>
                            <td className="px-4 py-2 font-mono text-amber-700 dark:text-amber-400/90">
                              {formatCurrency2(r.interestPayment)}
                            </td>
                            <td className="px-4 py-2 font-mono text-slate-500">
                              {r.pmi > 0 ? formatCurrency2(r.pmi) : "—"}
                            </td>
                            <td className="px-4 py-2 font-mono">{formatCurrency2(r.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-purple-500 p-4">
                    Showing first {Math.min(360, schedule.rows.length)} months of {schedule.rows.length} total.
                  </p>
                </div>
              )}

              {tab === "afford" && (
                <div className="space-y-6" data-tour="mortgage-afford">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-xs font-bold text-slate-500 dark:text-purple-400 uppercase">
                        Gross monthly income
                      </span>
                      <input
                        type="number"
                        value={incomeMonthly}
                        onChange={(e) => setIncomeMonthly(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 px-4 py-3"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-500 dark:text-purple-400 uppercase">
                        Monthly debts (non-housing)
                      </span>
                      <input
                        type="number"
                        value={debtsMonthly}
                        onChange={(e) => setDebtsMonthly(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 px-4 py-3"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-500 dark:text-purple-400 uppercase">
                        Max housing DTI ({dtiHousing}%)
                      </span>
                      <input
                        type="range"
                        min={20}
                        max={40}
                        value={dtiHousing}
                        onChange={(e) => setDtiHousing(Number(e.target.value))}
                        className="mt-2 w-full accent-purple-600"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-500 dark:text-purple-400 uppercase">
                        Max total DTI ({dtiTotal}%)
                      </span>
                      <input
                        type="range"
                        min={36}
                        max={50}
                        value={dtiTotal}
                        onChange={(e) => setDtiTotal(Number(e.target.value))}
                        className="mt-2 w-full accent-purple-600"
                      />
                    </label>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-8 shadow-xl">
                    <p className="text-emerald-100 text-sm mb-2">Estimated max loan (P&amp;I only, rules-based)</p>
                    <p className="font-display text-4xl font-bold">{formatCurrency(maxAfford.maxLoan)}</p>
                    <p className="text-emerald-100/90 mt-4 text-sm">
                      Implied max home price at {downPercent}% down:{" "}
                      <strong className="text-white text-lg">{formatCurrency(maxHomeWithDown)}</strong>
                    </p>
                    <p className="text-emerald-200/80 text-xs mt-3">
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
                      <span className="text-xs font-bold text-slate-500 dark:text-purple-400 uppercase">
                        New rate (% APR)
                      </span>
                      <input
                        type="number"
                        step={0.001}
                        value={refiRate}
                        onChange={(e) => setRefiRate(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 px-4 py-3"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-500 dark:text-purple-400 uppercase">
                        New term (years)
                      </span>
                      <select
                        value={refiTermYears}
                        onChange={(e) => setRefiTermYears(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 px-4 py-3"
                      >
                        {[15, 20, 25, 30].map((y) => (
                          <option key={y} value={y}>
                            {y} years
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-500 dark:text-purple-400 uppercase">
                        Closing costs (% of loan)
                      </span>
                      <input
                        type="number"
                        step={0.1}
                        value={refiClosingPct}
                        onChange={(e) => setRefiClosingPct(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 px-4 py-3"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-500 dark:text-purple-400 uppercase">
                        Discount points (% of loan)
                      </span>
                      <input
                        type="number"
                        step={0.125}
                        value={pointsPercent}
                        onChange={(e) => setPointsPercent(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 px-4 py-3"
                      />
                    </label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-purple-500/30 p-6 bg-white dark:bg-dark-800/50">
                      <h4 className="font-bold text-slate-900 dark:text-purple-100 mb-3">Current loan</h4>
                      <p className="text-sm text-slate-600 dark:text-purple-300">
                        P&amp;I: <strong>{formatCurrency2(pi)}</strong>
                      </p>
                      <p className="text-sm text-slate-600 dark:text-purple-300 mt-2">
                        Remaining interest (est.):{" "}
                        <strong>{formatCurrency(schedule.totalInterest)}</strong>
                      </p>
                    </div>
                    <div className="rounded-2xl border border-purple-300 dark:border-purple-500/40 p-6 bg-purple-50 dark:bg-purple-900/20">
                      <h4 className="font-bold text-slate-900 dark:text-purple-100 mb-3">After refinance</h4>
                      <p className="text-sm text-slate-600 dark:text-purple-300">
                        New P&amp;I: <strong>{formatCurrency2(refiPi)}</strong>
                      </p>
                      <p className="text-sm text-slate-600 dark:text-purple-300 mt-2">
                        New total interest (est.):{" "}
                        <strong>{formatCurrency(refiSchedule.totalInterest)}</strong>
                      </p>
                    </div>
                  </div>
                  <div
                    className="rounded-2xl bg-slate-900 text-white p-6 border border-purple-500/30"
                    data-tour="mortgage-refi-break-even"
                  >
                    <p className="text-slate-400 text-sm">Monthly P&amp;I savings</p>
                    <p className="text-3xl font-bold text-emerald-400">{formatCurrency2(monthlySavings)}</p>
                    <p className="text-slate-400 text-sm mt-4">
                      Closing costs (~{formatCurrency(refiClosingCash)}): break-even in{" "}
                      <strong className="text-white">
                        {breakEvenRefi != null ? `${breakEvenRefi} months` : "N/A"}
                      </strong>
                    </p>
                    {bePoints != null && (
                      <p className="text-slate-400 text-sm mt-2">
                        Buying {pointsPercent}% points (~{formatCurrency(pointsDollar)}) for ~{pointsPercent * 0.25}
                        % rate drop → break-even in <strong className="text-white">{bePoints} months</strong>{" "}
                        (illustrative)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {tab === "lab" && (
                <div className="space-y-6 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-800/40 p-6">
                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-purple-100 flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-purple-500" />
                    What-if lab
                  </h3>
                  <p className="text-slate-600 dark:text-purple-300 text-sm leading-relaxed">
                    Compare baseline payoff ({schedule.monthsToPayoff} mo) vs paying bi-weekly equivalent (
                    {scheduleBiweekly.monthsToPayoff} mo). Extra principal snowballs — even small bi-weekly
                    equivalence trims years off.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-slate-50 dark:bg-dark-900 p-4 border border-slate-200 dark:border-purple-500/20">
                      <p className="text-xs uppercase font-bold text-slate-500 dark:text-purple-400">
                        Baseline payoff
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                        {schedule.monthsToPayoff} mo
                      </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4 border border-emerald-200 dark:border-emerald-500/30">
                      <p className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-400">
                        + bi-weekly equivalent
                      </p>
                      <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">
                        {scheduleBiweekly.monthsToPayoff} mo
                      </p>
                      <p className="text-xs text-emerald-700/80 dark:text-emerald-400/90 mt-1">
                        Saves {Math.max(0, schedule.monthsToPayoff - scheduleBiweekly.monthsToPayoff)} months
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      data-tour="mortgage-copy-json"
                      type="button"
                      onClick={() => {
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
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-200 text-sm font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/30"
                    >
                      <Save className="h-4 w-4" />
                      Copy scenario JSON
                    </button>
                    <Link
                      href="/post?category=Real%20Estate&q=mortgage"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
                    >
                      Real estate guides
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <section
            className="mt-12 max-w-xl mx-auto rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-slate-50/80 dark:bg-dark-800/60 p-6 shadow-lg shadow-purple-500/5"
            aria-labelledby="email-summary-heading"
            data-tour="mortgage-email"
          >
            <h2
              id="email-summary-heading"
              className="font-display font-bold text-lg text-slate-900 dark:text-purple-100 flex items-center gap-2 mb-2"
            >
              <Mail className="h-5 w-5 text-purple-500 shrink-0" aria-hidden />
              Email this summary
            </h2>
            <p className="text-slate-600 dark:text-purple-300/90 text-sm mb-4 leading-relaxed">
              Get a plain-text and HTML snapshot of your current inputs and key results (P&amp;I, PITI, payoff,
              interest, PMI totals).
            </p>
            <form onSubmit={sendSummaryEmail} className="space-y-3">
              <label className="sr-only" htmlFor="mortgage-summary-email">
                Email address
              </label>
              <input
                id="mortgage-summary-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={emailSummaryAddr}
                onChange={(e) => setEmailSummaryAddr(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 px-4 py-3 text-slate-900 dark:text-white text-sm"
                disabled={emailSummarySending}
              />
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={emailHp}
                onChange={(e) => setEmailHp(e.target.value)}
                className="hidden"
                aria-hidden
              />
              <button
                type="submit"
                disabled={emailSummarySending}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-60 disabled:pointer-events-none"
              >
                {emailSummarySending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Sending…
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" aria-hidden />
                    Email me the summary
                  </>
                )}
              </button>
              {emailSummaryNote && (
                <p
                  role="status"
                  className={`text-sm ${
                    emailSummaryNote.kind === "ok"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {emailSummaryNote.text}
                </p>
              )}
            </form>
          </section>

          <p className="text-center text-xs text-slate-500 dark:text-purple-500 mt-12 max-w-3xl mx-auto leading-relaxed">
            Educational estimates only — not financial, tax, or legal advice. PMI removal, DTI limits, and
            refinance terms depend on your lender, credit profile, and program. Rates and costs change daily.
          </p>
        </div>
      </div>
    </div>
  );
}
