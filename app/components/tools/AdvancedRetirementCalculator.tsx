"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Target,
  Calendar,
  Shield,
  Sparkles,
  TrendingUp,
  PiggyBank,
  Copy,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";

type Account = {
  id: string;
  name: string;
  balance: number;
  contributionMonthly: number;
  employerMatchMonthly: number;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function money(n: number) {
  if (!Number.isFinite(n)) return "$0";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function pct(n: number) {
  if (!Number.isFinite(n)) return "0%";
  return `${(n * 100).toFixed(1)}%`;
}

type ProjectionRow = {
  age: number;
  year: number;
  balanceNominal: number;
  balanceReal: number;
};

export default function AdvancedRetirementCalculator() {
  const [tourOpen, setTourOpen] = useState(false);
  const TOUR_ID = "retirement-calculator";

  const [currentAge, setCurrentAge] = useState(32);
  const [retireAge, setRetireAge] = useState(60);
  const [lifeExpectancy, setLifeExpectancy] = useState(92);

  const [inflation, setInflation] = useState(0.025);
  const [returnNominal, setReturnNominal] = useState(0.07);
  const [withdrawalRate, setWithdrawalRate] = useState(0.04);

  const [annualSpendingToday, setAnnualSpendingToday] = useState(72000);
  const [socialSecurityAnnualAtRetire, setSocialSecurityAnnualAtRetire] = useState(24000);
  const [oneTimeAtRetire, setOneTimeAtRetire] = useState(0);

  const [accounts, setAccounts] = useState<Account[]>([
    { id: uid(), name: "401(k)", balance: 52000, contributionMonthly: 650, employerMatchMonthly: 250 },
    { id: uid(), name: "Roth IRA", balance: 14000, contributionMonthly: 250, employerMatchMonthly: 0 },
    { id: uid(), name: "Brokerage", balance: 8000, contributionMonthly: 200, employerMatchMonthly: 0 },
  ]);

  const [copied, setCopied] = useState(false);

  const yearsToRetire = Math.max(0, retireAge - currentAge);
  const yearsInRetirement = Math.max(0, lifeExpectancy - retireAge);

  const totals = useMemo(() => {
    const startBalance = accounts.reduce((s, a) => s + (Number(a.balance) || 0), 0);
    const contribMonthly = accounts.reduce((s, a) => s + (Number(a.contributionMonthly) || 0), 0);
    const matchMonthly = accounts.reduce((s, a) => s + (Number(a.employerMatchMonthly) || 0), 0);
    return { startBalance, contribMonthly, matchMonthly };
  }, [accounts]);

  const spendAtRetireNominal = useMemo(() => {
    const f = Math.pow(1 + clamp(inflation, 0, 0.2), yearsToRetire);
    return annualSpendingToday * f;
  }, [annualSpendingToday, inflation, yearsToRetire]);

  const netSpendingNeedAtRetire = useMemo(() => {
    return Math.max(0, spendAtRetireNominal - Math.max(0, socialSecurityAnnualAtRetire));
  }, [spendAtRetireNominal, socialSecurityAnnualAtRetire]);

  const fiNumberAtRetire = useMemo(() => {
    const wr = clamp(withdrawalRate, 0.01, 0.1);
    return netSpendingNeedAtRetire / wr;
  }, [netSpendingNeedAtRetire, withdrawalRate]);

  const projection = useMemo(() => {
    const startYear = new Date().getFullYear();
    const r = clamp(returnNominal, -0.2, 0.3);
    const inf = clamp(inflation, 0, 0.2);
    const contribAnnual = (totals.contribMonthly + totals.matchMonthly) * 12;

    const rows: ProjectionRow[] = [];
    let bal = totals.startBalance;
    for (let i = 0; i <= Math.min(70, retireAge - currentAge); i++) {
      const age = currentAge + i;
      const year = startYear + i;
      if (i > 0) {
        // Simple sequence: growth on prior year balance, then contributions
        bal = bal * (1 + r) + contribAnnual;
      }
      const deflator = Math.pow(1 + inf, i);
      const real = deflator > 0 ? bal / deflator : bal;
      rows.push({ age, year, balanceNominal: bal, balanceReal: real });
    }

    // Apply one-time at retire (e.g. pension lump sum, home sale, inheritance)
    if (rows.length > 0) {
      const last = rows[rows.length - 1];
      last.balanceNominal += Math.max(0, oneTimeAtRetire);
      last.balanceReal += Math.max(0, oneTimeAtRetire) / Math.pow(1 + inf, rows.length - 1);
    }

    return rows;
  }, [currentAge, retireAge, returnNominal, inflation, totals, oneTimeAtRetire]);

  const balanceAtRetire = projection.length ? projection[projection.length - 1].balanceNominal : totals.startBalance;

  const isOnTrack = balanceAtRetire >= fiNumberAtRetire;

  const suggestedRetireAge = useMemo(() => {
    // Find first age where projected balance >= FI number
    const r = clamp(returnNominal, -0.2, 0.3);
    const inf = clamp(inflation, 0, 0.2);
    const contribAnnual = (totals.contribMonthly + totals.matchMonthly) * 12;

    let bal = totals.startBalance;
    const startYear = new Date().getFullYear();
    for (let i = 0; i <= 70; i++) {
      const age = currentAge + i;
      if (i > 0) bal = bal * (1 + r) + contribAnnual;
      const atThisAge = i === yearsToRetire ? bal + Math.max(0, oneTimeAtRetire) : bal;
      const spendNom = annualSpendingToday * Math.pow(1 + inf, i);
      const need = Math.max(0, spendNom - Math.max(0, socialSecurityAnnualAtRetire));
      const fi = need / clamp(withdrawalRate, 0.01, 0.1);
      if (atThisAge >= fi) return { age, year: startYear + i };
    }
    return null;
  }, [
    annualSpendingToday,
    currentAge,
    inflation,
    oneTimeAtRetire,
    returnNominal,
    socialSecurityAnnualAtRetire,
    totals,
    withdrawalRate,
    yearsToRetire,
  ]);

  const miniBars = useMemo(() => {
    const vals = projection.map((r) => r.balanceReal);
    const max = Math.max(1, ...vals);
    return vals.map((v) => Math.round((v / max) * 100));
  }, [projection]);

  const addAccount = () =>
    setAccounts((prev) => [
      ...prev,
      { id: uid(), name: "New account", balance: 0, contributionMonthly: 0, employerMatchMonthly: 0 },
    ]);

  const removeAccount = (id: string) => setAccounts((prev) => prev.filter((a) => a.id !== id));

  const updateAccount = (id: string, patch: Partial<Account>) =>
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const exportPayload = useMemo(() => {
    return {
      tool: "Advanced Retirement Calculator",
      inputs: {
        currentAge,
        retireAge,
        lifeExpectancy,
        inflation,
        returnNominal,
        withdrawalRate,
        annualSpendingToday,
        socialSecurityAnnualAtRetire,
        oneTimeAtRetire,
        accounts,
      },
      outputs: {
        yearsToRetire,
        spendAtRetireNominal: Math.round(spendAtRetireNominal),
        netSpendingNeedAtRetire: Math.round(netSpendingNeedAtRetire),
        fiNumberAtRetire: Math.round(fiNumberAtRetire),
        projectedBalanceAtRetire: Math.round(balanceAtRetire),
        onTrack: isOnTrack,
        suggestedRetireAge,
      },
      createdAt: new Date().toISOString(),
    };
  }, [
    accounts,
    annualSpendingToday,
    balanceAtRetire,
    currentAge,
    fiNumberAtRetire,
    inflation,
    isOnTrack,
    lifeExpectancy,
    netSpendingNeedAtRetire,
    oneTimeAtRetire,
    retireAge,
    returnNominal,
    socialSecurityAnnualAtRetire,
    spendAtRetireNominal,
    suggestedRetireAge,
    withdrawalRate,
    yearsToRetire,
  ]);

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

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
        title: "Welcome — let’s map your retirement plan",
        body: (
          <div className="space-y-3">
            <p>
              This tool estimates a retirement target (your <strong>FI number</strong>) and projects your accounts to
              your retirement age. It’s meant to be simple, clear, and easy to tweak.
            </p>
            <p>
              You can <strong>skip anytime</strong>. To replay later, use the <strong>Walk-through</strong> button.
            </p>
          </div>
        ),
      },
      {
        id: "top-cards",
        target: "[data-tour='retire-top-cards']",
        title: "Top cards: FI number, projection, status",
        body: (
          <div className="space-y-2">
            <p>These cards answer the big questions:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>FI number</strong>: the target portfolio at retirement.
              </li>
              <li>
                <strong>Projected at your retire age</strong>: where you might land.
              </li>
              <li>
                <strong>Status</strong>: on track vs gap, plus an “earliest” estimate.
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "assumptions",
        target: "[data-tour='retire-assumptions']",
        title: "Assumptions: ages, inflation, return, withdrawal rate",
        body: (
          <div className="space-y-2">
            <p>These settings control the whole model.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Inflation</strong> changes “future spending.”
              </li>
              <li>
                <strong>Return</strong> changes growth.
              </li>
              <li>
                <strong>Withdrawal rate</strong> changes your FI number.
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "spending",
        target: "[data-tour='retire-spending']",
        title: "Spending: what you want to live on",
        body: (
          <div className="space-y-2">
            <p>
              Start with annual spending in today’s dollars. We inflate it to your retirement year, then subtract Social
              Security to estimate what your portfolio needs to cover.
            </p>
          </div>
        ),
      },
      {
        id: "social",
        target: "[data-tour='retire-social-onetime']",
        title: "Social Security + one-time at retire",
        body: (
          <div className="space-y-2">
            <p>
              Add any income you expect at retirement (Social Security) and any one-time amount (like a home sale or a
              lump sum). This can reduce how much you need to withdraw from investments.
            </p>
          </div>
        ),
      },
      {
        id: "copy",
        target: "[data-tour='retire-copy-json']",
        title: "Copy JSON: save this scenario",
        body: <p>Copy a snapshot so you can compare different plans later.</p>,
      },
      {
        id: "timeline",
        target: "[data-tour='retire-timeline']",
        title: "Timeline: real dollars over time",
        body: (
          <div className="space-y-2">
            <p>This mini chart shows your inflation-adjusted (real) balance growing toward retirement.</p>
          </div>
        ),
      },
      {
        id: "retire-summary",
        target: "[data-tour='retire-retirement-summary']",
        title: "At retirement: spending and FI target",
        body: <p>These boxes summarize your spending at retirement and the FI target based on your withdrawal rule.</p>,
      },
      {
        id: "accounts",
        target: "[data-tour='retire-accounts']",
        title: "Accounts: balances + contributions + match",
        body: (
          <div className="space-y-2">
            <p>
              Add every account that matters. Contributions and employer match are a huge part of the plan—especially
              early on.
            </p>
          </div>
        ),
      },
      {
        id: "account-row",
        target: "[data-tour='retire-account-row']",
        title: "Edit an account: name, balance, contributions",
        body: <p>Adjust the numbers here and watch the top cards and timeline update instantly.</p>,
      },
      {
        id: "add-account",
        target: "[data-tour='retire-add-account']",
        title: "Add account: model your real life",
        body: <p>Add more accounts (HSA, 457(b), taxable brokerage, etc.). Keep it simple and accurate.</p>,
      },
      {
        id: "finish",
        placement: "center",
        title: "All set",
        body: (
          <div className="space-y-3">
            <p>Quick workflow:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Set retire age, inflation, return, withdrawal rate</li>
              <li>Set spending + Social Security</li>
              <li>Add accounts + contributions + match</li>
              <li>Check “Status” and tweak until it feels realistic</li>
            </ol>
          </div>
        ),
      },
    ],
    [
      currentAge,
      retireAge,
      lifeExpectancy,
      inflation,
      returnNominal,
      withdrawalRate,
      annualSpendingToday,
      socialSecurityAnnualAtRetire,
      oneTimeAtRetire,
      accounts.length,
    ]
  );

  const pill = (ok: boolean, yes: string, no: string) => (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
        ok
          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200"
          : "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200"
      }`}
    >
      {ok ? yes : no}
    </span>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:to-dark-900">
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 via-transparent to-purple-600/10 dark:from-indigo-900/35 dark:to-purple-900/25" />
        <div className="absolute top-16 left-10 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-16 right-10 w-80 h-80 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-indigo-700 dark:text-purple-200 font-semibold hover:text-indigo-800 dark:hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href="/post?category=Retirement&q=401k"
              className="inline-flex items-center gap-2 text-slate-700 dark:text-purple-200 font-semibold hover:text-indigo-800 dark:hover:text-emerald-300 transition-colors"
            >
              Read retirement guides
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl">
                  <Target className="h-6 w-6 text-white" />
                </span>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-purple-100">
                    Advanced Retirement Calculator
                  </h1>
                  <p className="text-slate-600 dark:text-purple-200/80 mt-1">
                    Plan your “work optional” date with a clear FI number, realistic inflation, and employer match.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setTourOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-dark-900/40 border border-slate-200 dark:border-purple-500/20 text-slate-900 dark:text-purple-100 font-bold hover:bg-white dark:hover:bg-purple-900/20 transition-colors"
                  aria-label="Open retirement calculator walk-through"
                >
                  <BookOpen className="h-4 w-4" />
                  Walk-through
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3" data-tour="retire-top-cards">
                <div className="rounded-2xl border border-slate-200 dark:border-purple-500/20 bg-white/90 dark:bg-dark-800/40 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                    FI number at retire
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-purple-100">
                    {money(fiNumberAtRetire)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-purple-200/80">
                    Net need {money(netSpendingNeedAtRetire)}/yr @ {pct(withdrawalRate)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-purple-500/20 bg-white/90 dark:bg-dark-800/40 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                    Projected at {retireAge}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-purple-100">
                    {money(balanceAtRetire)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-purple-200/80">
                    Starting {money(totals.startBalance)} + {money((totals.contribMonthly + totals.matchMonthly) * 12)}/yr
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-purple-500/20 bg-white/90 dark:bg-dark-800/40 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                    Status
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {pill(isOnTrack, "On track", "Gap")}
                    {suggestedRetireAge ? (
                      <span className="text-xs text-slate-600 dark:text-purple-200/80">
                        Earliest: {suggestedRetireAge.age} ({suggestedRetireAge.year})
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600 dark:text-purple-200/80">Not within 70 years</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-purple-200/80">
                    {yearsToRetire} yrs to retire · {yearsInRetirement} yrs in retirement
                  </p>
                </div>
              </div>
            </div>

            <div
              className="rounded-3xl border border-slate-200 dark:border-purple-500/20 bg-white/90 dark:bg-dark-800/40 p-6 shadow-lg"
              data-tour="retire-assumptions"
            >
              <p className="text-sm font-bold text-slate-900 dark:text-purple-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Assumptions
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                    Current age
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-slate-900 dark:text-purple-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                    Retire age
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={retireAge}
                    onChange={(e) => setRetireAge(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-slate-900 dark:text-purple-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                    Inflation
                  </span>
                  <input
                    type="number"
                    step={0.1}
                    value={(inflation * 100).toFixed(1)}
                    onChange={(e) => setInflation(Number(e.target.value) / 100)}
                    className="mt-1 w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-slate-900 dark:text-purple-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                    Return (nominal)
                  </span>
                  <input
                    type="number"
                    step={0.1}
                    value={(returnNominal * 100).toFixed(1)}
                    onChange={(e) => setReturnNominal(Number(e.target.value) / 100)}
                    className="mt-1 w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-slate-900 dark:text-purple-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                    Withdrawal rate
                  </span>
                  <input
                    type="number"
                    step={0.1}
                    value={(withdrawalRate * 100).toFixed(1)}
                    onChange={(e) => setWithdrawalRate(Number(e.target.value) / 100)}
                    className="mt-1 w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-slate-900 dark:text-purple-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                    Life expectancy
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={lifeExpectancy}
                    onChange={(e) => setLifeExpectancy(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-slate-900 dark:text-purple-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </label>
              </div>

              <div className="mt-4" data-tour="retire-spending">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                  Annual spending (today’s dollars)
                </label>
                <input
                  type="number"
                  step={500}
                  min={0}
                  value={annualSpendingToday}
                  onChange={(e) => setAnnualSpendingToday(Number(e.target.value))}
                  className="mt-1 w-full px-4 py-2 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-slate-900 dark:text-purple-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-purple-200/70 flex items-start gap-2">
                  <Shield className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  We inflate spending to your retirement year, then subtract Social Security (if any).
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3" data-tour="retire-social-onetime">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                    Social Security (annual)
                  </span>
                  <input
                    type="number"
                    step={500}
                    min={0}
                    value={socialSecurityAnnualAtRetire}
                    onChange={(e) => setSocialSecurityAnnualAtRetire(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-slate-900 dark:text-purple-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                    One-time at retire
                  </span>
                  <input
                    type="number"
                    step={1000}
                    min={0}
                    value={oneTimeAtRetire}
                    onChange={(e) => setOneTimeAtRetire(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-slate-900 dark:text-purple-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={copyJson}
                className="mt-5 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900/40 text-slate-900 dark:text-purple-100 font-bold hover:bg-slate-50 dark:hover:bg-purple-900/20 transition-colors"
                data-tour="retire-copy-json"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied JSON" : "Copy JSON"}
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section
              className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-purple-500/20 bg-white/90 dark:bg-dark-800/40 p-6 shadow-lg"
              data-tour="retire-timeline"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <p className="text-sm font-bold text-slate-900 dark:text-purple-100 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  Timeline (real dollars)
                </p>
                <span className="text-xs text-slate-500 dark:text-purple-200/70 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Through age {retireAge}
                </span>
              </div>

              <div className="flex items-end gap-1 h-20 rounded-2xl border border-slate-200 dark:border-purple-500/20 bg-white dark:bg-dark-900/40 p-3 overflow-hidden">
                {miniBars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-md bg-gradient-to-t from-indigo-600 to-purple-500/70"
                    style={{ height: `${Math.max(4, h)}%` }}
                    title={`Age ${projection[i].age}: ${money(projection[i].balanceReal)} (real)`}
                  />
                ))}
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4" data-tour="retire-retirement-summary">
                <div className="rounded-2xl border border-slate-200 dark:border-purple-500/20 bg-white dark:bg-dark-900/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                    At retirement (nominal)
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-purple-100">
                    Spend {money(spendAtRetireNominal)}/yr
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-purple-200/80">
                    After Social Security: {money(netSpendingNeedAtRetire)}/yr
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-purple-500/20 bg-white dark:bg-dark-900/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                    Safe withdrawal
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-purple-100">
                    {money(fiNumberAtRetire)} target
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-purple-200/80">
                    Rule of thumb: portfolio × {pct(withdrawalRate)} covers net needs
                  </p>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <section
                className="rounded-3xl border border-slate-200 dark:border-purple-500/20 bg-white/90 dark:bg-dark-800/40 p-6 shadow-lg"
                data-tour="retire-accounts"
              >
                <p className="text-sm font-bold text-slate-900 dark:text-purple-100 flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-emerald-500" />
                  Accounts
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-purple-200/80">
                  Add accounts, contributions, and employer match. This tool sums everything into one projection.
                </p>

                <div className="mt-4 space-y-3">
                  {accounts.map((a, idx) => (
                    <div
                      key={a.id}
                      className="rounded-2xl border border-slate-200 dark:border-purple-500/20 bg-white dark:bg-dark-900/40 p-3"
                      data-tour={idx === 0 ? "retire-account-row" : undefined}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          value={a.name}
                          onChange={(e) => updateAccount(a.id, { name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-slate-900 dark:text-purple-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => removeAccount(a.id)}
                          className="h-10 w-10 inline-flex items-center justify-center rounded-xl text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                          aria-label="Remove account"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <label className="block">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                            Balance
                          </span>
                          <input
                            type="number"
                            min={0}
                            step={500}
                            value={a.balance}
                            onChange={(e) => updateAccount(a.id, { balance: Number(e.target.value) })}
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-slate-900 dark:text-purple-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right font-mono"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                            Contrib/mo
                          </span>
                          <input
                            type="number"
                            min={0}
                            step={50}
                            value={a.contributionMonthly}
                            onChange={(e) => updateAccount(a.id, { contributionMonthly: Number(e.target.value) })}
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-slate-900 dark:text-purple-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right font-mono"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                            Match/mo
                          </span>
                          <input
                            type="number"
                            min={0}
                            step={50}
                            value={a.employerMatchMonthly}
                            onChange={(e) => updateAccount(a.id, { employerMatchMonthly: Number(e.target.value) })}
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-slate-900 dark:text-purple-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right font-mono"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addAccount}
                  className="mt-4 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:from-indigo-700 hover:to-purple-700 transition-colors"
                  data-tour="retire-add-account"
                >
                  <Plus className="h-4 w-4" />
                  Add account
                </button>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

