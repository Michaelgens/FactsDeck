"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  PiggyBank,
  Wallet,
  Sparkles,
  Target,
  Shield,
  Plus,
  Trash2,
  Check,
  Copy,
} from "lucide-react";
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";
import { FACTS_DECK_BUDGET_PLANNER } from "./budget/budget-journey-types";
import ToolDashboardTestCta from "./ToolDashboardTestCta";
import {
  ToolDashboardHeroBackdrop,
  tdGhostBtn,
  tdHero,
  tdHeroInner,
  tdIconTile,
  tdNavLink,
  tdPage,
  tdPanelLg,
  tdStatCard,
} from "./tool-dashboard-ui";

type ExpenseGroup = "Needs" | "Wants" | "Savings" | "Debt";

type ExpenseItem = {
  id: string;
  name: string;
  group: ExpenseGroup;
  amountMonthly: number;
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
  return `${Math.round(n * 100)}%`;
}

export type BudgetPlannerInitialValues = {
  mode?: "50-30-20" | "zero-based";
  incomeMonthly?: number;
  bufferPct?: number;
};

type AdvancedBudgetPlannerProps = {
  initialValues?: BudgetPlannerInitialValues;
  deferWalkthrough?: boolean;
};

const GROUP_META: Record<ExpenseGroup, { color: string; chip: string; hint: string }> = {
  Needs: {
    color: "from-zinc-700 to-zinc-900",
    chip: "bg-zinc-100 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:border-zinc-800 border border-transparent",
    hint: "Housing, groceries, utilities, minimums",
  },
  Wants: {
    color: "from-zinc-600 to-zinc-900",
    chip: "bg-zinc-100 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:border-zinc-800 border border-transparent",
    hint: "Dining, subscriptions, fun money",
  },
  Savings: {
    color: "from-zinc-800 to-zinc-950",
    chip: "bg-zinc-100 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:border-zinc-800 border border-transparent",
    hint: "Emergency fund, investing, sinking funds",
  },
  Debt: {
    color: "from-zinc-700 to-zinc-950",
    chip: "bg-zinc-100 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:border-zinc-800 border border-transparent",
    hint: "Extra payments, snowball/avalanche",
  },
};

export default function AdvancedBudgetPlanner({
  initialValues,
  deferWalkthrough = false,
}: AdvancedBudgetPlannerProps = {}) {
  const [mode, setMode] = useState<"50-30-20" | "zero-based">(initialValues?.mode ?? "50-30-20");
  const [incomeMonthly, setIncomeMonthly] = useState<number>(initialValues?.incomeMonthly ?? 6200);
  const [bufferPct, setBufferPct] = useState<number>(initialValues?.bufferPct ?? 0.03); // friction/unknowns
  const [items, setItems] = useState<ExpenseItem[]>([
    { id: uid(), name: "Rent / Mortgage", group: "Needs", amountMonthly: 2100 },
    { id: uid(), name: "Groceries", group: "Needs", amountMonthly: 520 },
    { id: uid(), name: "Utilities", group: "Needs", amountMonthly: 260 },
    { id: uid(), name: "Transport", group: "Needs", amountMonthly: 280 },
    { id: uid(), name: "Dining out", group: "Wants", amountMonthly: 220 },
    { id: uid(), name: "Subscriptions", group: "Wants", amountMonthly: 60 },
    { id: uid(), name: "Emergency fund", group: "Savings", amountMonthly: 300 },
    { id: uid(), name: "Investing", group: "Savings", amountMonthly: 450 },
    { id: uid(), name: "Extra debt payoff", group: "Debt", amountMonthly: 200 },
  ]);

  const [copied, setCopied] = useState(false);

  const totals = useMemo(() => {
    const byGroup: Record<ExpenseGroup, number> = { Needs: 0, Wants: 0, Savings: 0, Debt: 0 };
    for (const it of items) byGroup[it.group] += Number(it.amountMonthly) || 0;
    const planned = byGroup.Needs + byGroup.Wants + byGroup.Savings + byGroup.Debt;
    const buffer = incomeMonthly * clamp(bufferPct, 0, 0.25);
    const available = incomeMonthly - buffer;
    const remaining = available - planned;
    return { byGroup, planned, buffer, available, remaining };
  }, [items, incomeMonthly, bufferPct]);

  const targets = useMemo(() => {
    const available = totals.available;
    return {
      needs: available * 0.5,
      wants: available * 0.3,
      savings: available * 0.2,
    };
  }, [totals.available]);

  const score = useMemo(() => {
    // simple heuristic: closer to targets and positive remaining = higher score
    const available = Math.max(1, totals.available);
    const needsDelta = Math.abs(totals.byGroup.Needs - targets.needs) / available;
    const wantsDelta = Math.abs(totals.byGroup.Wants - targets.wants) / available;
    const savingsDelta = Math.abs((totals.byGroup.Savings + totals.byGroup.Debt) - targets.savings) / available;
    const drift = (needsDelta + wantsDelta + savingsDelta) / 3;
    const remPenalty = totals.remaining < 0 ? Math.min(0.25, Math.abs(totals.remaining) / available) : 0;
    const s = 1 - clamp(drift + remPenalty, 0, 1);
    return clamp(s, 0, 1);
  }, [totals, targets]);

  const addItem = (group: ExpenseGroup) => {
    setItems((prev) => [
      ...prev,
      { id: uid(), name: "", group, amountMonthly: 0 },
    ]);
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

  const updateItem = (id: string, patch: Partial<ExpenseItem>) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const exportPayload = useMemo(() => {
    return {
      tool: "Advanced Budget Planner",
      mode,
      incomeMonthly,
      bufferPct,
      bufferMonthly: Math.round(totals.buffer),
      availableMonthly: Math.round(totals.available),
      totals: {
        needs: Math.round(totals.byGroup.Needs),
        wants: Math.round(totals.byGroup.Wants),
        savings: Math.round(totals.byGroup.Savings),
        debt: Math.round(totals.byGroup.Debt),
        planned: Math.round(totals.planned),
        remaining: Math.round(totals.remaining),
      },
      items: items.map((i) => ({
        name: i.name || "(unnamed)",
        group: i.group,
        amountMonthly: Math.round(i.amountMonthly || 0),
      })),
      createdAt: new Date().toISOString(),
    };
  }, [mode, incomeMonthly, bufferPct, totals, items]);

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const [tourOpen, setTourOpen] = useState(false);
  const TOUR_ID = "budget-planner";

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
              If you completed the <strong>Facts Deck Budget Test</strong>, your income, buffer, and style are already
              filled in. This tour highlights where to edit line items, buckets, and exports.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Replay anytime from the Walk-through button.</p>
          </div>
        ),
      },
      {
        id: "top-stats",
        target: "[data-tour='budget-stats']",
        title: "Top cards: income, available, remaining",
        body: (
          <div className="space-y-2">
            <p>
              These three cards keep you oriented:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Monthly income</strong>: use after‑tax if you can.
              </li>
              <li>
                <strong>Available</strong>: income minus your buffer.
              </li>
              <li>
                <strong>Remaining</strong>: what’s left after all your items.
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "style",
        target: "[data-tour='budget-style']",
        title: "Budget style: 50/30/20 vs zero‑based",
        body: (
          <div className="space-y-2">
            <p>Pick the style that fits your brain:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>50 / 30 / 20</strong>: aim for targets (needs / wants / saving+debt).
              </li>
              <li>
                <strong>Zero‑based</strong>: give every dollar a job (remaining goes near zero).
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "income",
        target: "[data-tour='budget-income']",
        title: "Income: set the monthly baseline",
        body: <p>This number drives everything. If your income varies, use a conservative average.</p>,
      },
      {
        id: "buffer",
        target: "[data-tour='budget-buffer']",
        title: "Buffer: your ‘oops’ protection",
        body: (
          <div className="space-y-2">
            <p>
              The buffer is money you don’t assign. It helps with price changes, random fees, and “forgotten” expenses.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Even 2–5% can make budgeting feel calmer.
            </p>
          </div>
        ),
      },
      {
        id: "copy",
        target: "[data-tour='budget-copy-json']",
        title: "Copy budget JSON: save your plan",
        body: <p>Use this to save/share your setup (notes, docs, spreadsheets, or with a partner).</p>,
      },
      {
        id: "buckets",
        target: "[data-tour='budget-buckets']",
        title: "Buckets: Needs, Wants, Savings, Debt",
        body: (
          <div className="space-y-2">
            <p>
              Your items live in four buckets. Add everything you pay monthly (or convert yearly bills into monthly).
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tip: Savings isn’t just investing—think emergency fund and sinking funds too.
            </p>
          </div>
        ),
      },
      {
        id: "bucket-card",
        target: "[data-tour='budget-bucket-card']",
        title: "Each bucket shows a total + a bar",
        body: (
          <div className="space-y-2">
            <p>
              Every bucket shows:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>the monthly total</li>
              <li>its % of your available money</li>
              <li>a progress bar for quick scanning</li>
              <li>targets when using 50/30/20</li>
            </ul>
          </div>
        ),
      },
      {
        id: "add-item",
        target: "[data-tour='budget-add-item']",
        title: "Add item: build your real list",
        body: <p>Add an expense/investment/debt payment. Then name it and give it a monthly amount.</p>,
      },
      {
        id: "edit-item",
        target: "[data-tour='budget-item-row']",
        title: "Edit items: name + amount + delete",
        body: <p>Keep it simple. If something is yearly, divide by 12 and put it in Savings as a sinking fund.</p>,
      },
      {
        id: "insights",
        target: "[data-tour='budget-insights']",
        title: "Insights: what this budget is saying",
        body: (
          <div className="space-y-2">
            <p>
              This panel gives quick feedback: are you saving enough, are wants too heavy, and what to do with remaining
              money.
            </p>
          </div>
        ),
      },
      {
        id: "sinking",
        target: "[data-tour='budget-sinking']",
        title: "Sinking funds: add common yearly bills fast",
        body: (
          <div className="space-y-2">
            <p>
              These buttons create a monthly “sinking fund” item so yearly bills don’t surprise you.
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
            <p>Quick workflow:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Set income and a small buffer</li>
              <li>Add your needs first (housing, utilities, groceries)</li>
              <li>Add savings/debt next</li>
              <li>Finally add wants and make sure remaining looks healthy</li>
            </ol>
          </div>
        ),
      },
    ],
    [mode, incomeMonthly, bufferPct, items.length]
  );

  const headerStat = (label: string, value: string, sub?: string) => (
    <div className={tdStatCard}>
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
      {sub ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{sub}</p> : null}
    </div>
  );

  const bar = (value: number, max: number) => {
    const w = `${Math.round(clamp(max <= 0 ? 0 : value / max, 0, 1) * 100)}%`;
    return (
      <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <div className="h-full bg-zinc-900 dark:bg-zinc-100" style={{ width: w }} />
      </div>
    );
  };

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
          <div className="flex items-center justify-between gap-3" data-tour="budget-top-nav">
            <Link href="/" className={tdNavLink}>
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href="/post?category=Personal%20Finance&q=budget"
              className={tdNavLink}
            >
              Read budgeting guides
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <span className={tdIconTile}>
                  <Wallet className="h-6 w-6" />
                </span>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {FACTS_DECK_BUDGET_PLANNER}
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                    Build a budget that actually survives real life: buffer, buckets, and a clear “what next”.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setTourOpen(true)}
                  className={tdGhostBtn}
                  aria-label="Open budget planner walk-through"
                >
                  <BookOpen className="h-4 w-4" />
                  Walk-through
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3" data-tour="budget-stats">
                {headerStat("Monthly income", money(incomeMonthly), "After-tax is best")}
                {headerStat("Available (after buffer)", money(totals.available), `${pct(bufferPct)} buffer = ${money(totals.buffer)}`)}
                {headerStat("Remaining", money(totals.remaining), totals.remaining >= 0 ? "Unassigned cash" : "Over budget")}
              </div>
            </div>

            <div className={tdPanelLg} data-tour="budget-style">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                  Budget style
                </p>
                <span className="text-xs font-bold px-2 py-1 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  Score {Math.round(score * 100)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("50-30-20")}
                  className={`px-3 py-2 rounded-2xl text-sm font-semibold border transition-colors ${
                    mode === "50-30-20"
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                      : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 dark:bg-zinc-950 dark:text-zinc-200 dark:border-zinc-800 dark:hover:border-zinc-700"
                  }`}
                >
                  50 / 30 / 20
                </button>
                <button
                  type="button"
                  onClick={() => setMode("zero-based")}
                  className={`px-3 py-2 rounded-2xl text-sm font-semibold border transition-colors ${
                    mode === "zero-based"
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                      : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 dark:bg-zinc-950 dark:text-zinc-200 dark:border-zinc-800 dark:hover:border-zinc-700"
                  }`}
                >
                  Zero-based
                </button>
              </div>

              <div className="mt-4" data-tour="budget-income">
                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Income (monthly)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={incomeMonthly}
                  onChange={(e) => setIncomeMonthly(Number(e.target.value))}
                  className="mt-1 w-full px-4 py-2 rounded-2xl border border-zinc-200 bg-white text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                />
              </div>

              <div className="mt-4" data-tour="budget-buffer">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Buffer (for “life happens”)
                  </label>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    {pct(bufferPct)} · {money(totals.buffer)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.12}
                  step={0.005}
                  value={bufferPct}
                  onChange={(e) => setBufferPct(Number(e.target.value))}
                  className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
                />
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-2">
                  <Shield className="h-4 w-4 text-zinc-900 dark:text-zinc-100 mt-0.5 shrink-0" />
                  A small buffer keeps you from “budget whiplash” when bills fluctuate.
                </p>
              </div>

              <button
                type="button"
                onClick={copyJson}
                className={`${tdGhostBtn} mt-5 w-full`}
                data-tour="budget-copy-json"
              >
                {copied ? <Check className="h-4 w-4 text-zinc-900 dark:text-zinc-100" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied budget JSON" : "Copy budget JSON"}
              </button>
            </div>
          </div>

          <ToolDashboardTestCta toolSlug="budget-planner" testLabel={FACTS_DECK_BUDGET_PLANNER} />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6" data-tour="budget-buckets">
            <div className="lg:col-span-2 space-y-6">
              {(Object.keys(GROUP_META) as ExpenseGroup[]).map((group) => {
                const list = items.filter((i) => i.group === group);
                const total = totals.byGroup[group];
                const meta = GROUP_META[group];
                const target =
                  mode === "50-30-20"
                    ? group === "Needs"
                      ? targets.needs
                      : group === "Wants"
                        ? targets.wants
                        : group === "Savings" || group === "Debt"
                          ? targets.savings
                          : undefined
                    : undefined;

                return (
                  <section
                    key={group}
                    className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
                    data-tour="budget-bucket-card"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${meta.chip}`}>
                            {group}
                          </span>
                          <span className="text-sm text-zinc-600 dark:text-zinc-300 truncate">
                            {meta.hint}
                          </span>
                        </div>
                        <div className="mt-2 flex items-end gap-3">
                          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                            {money(total)}
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {totals.available > 0 ? pct(total / totals.available) : "0%"} of available
                          </p>
                        </div>
                        <div className="mt-2">
                          {bar(total, totals.available)}
                        </div>
                        {mode === "50-30-20" && target != null && (
                          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                            Target: {money(target)} ({group === "Savings" || group === "Debt" ? "Savings + Debt" : group})
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => addItem(group)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                        data-tour="budget-add-item"
                      >
                        <Plus className="h-4 w-4" />
                        Add item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {list.map((it) => (
                        <div
                          key={it.id}
                          className="grid grid-cols-1 sm:grid-cols-[1fr_10rem_2.75rem] gap-2 items-center rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                          data-tour="budget-item-row"
                        >
                          <input
                            value={it.name}
                            onChange={(e) => updateItem(it.id, { name: e.target.value })}
                            placeholder="e.g. Car insurance (sinking fund)"
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                          />
                          <input
                            type="number"
                            min={0}
                            step={10}
                            value={Number.isFinite(it.amountMonthly) ? it.amountMonthly : 0}
                            onChange={(e) => updateItem(it.id, { amountMonthly: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700 text-right font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => removeItem(it.id)}
                            className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                            aria-label="Remove item"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {list.length === 0 && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          No items yet. Add one to start shaping this bucket.
                        </p>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>

            <aside className="space-y-6">
              <div
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
                data-tour="budget-insights"
              >
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Target className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                  What this budget says
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Safety first
                    </p>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                      {totals.byGroup.Savings + totals.byGroup.Debt >= totals.available * 0.2
                        ? "You’re funding future-you aggressively. Nice."
                        : "Consider bumping Savings/Debt until you hit at least ~20% of available cash."}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Flexibility
                    </p>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                      {totals.byGroup.Wants <= totals.available * 0.3
                        ? "Wants are under control — you’ll feel less guilt spending."
                        : "Wants are heavy. Try trimming one subscription or capping dining for a month."}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Cash flow
                    </p>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                      {totals.remaining >= 0
                        ? `You still have ${money(totals.remaining)} unassigned. Give it a job: emergency fund, sinking fund, or debt.`
                        : `You’re over by ${money(Math.abs(totals.remaining))}. Cut Wants first, then renegotiate Needs.`}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
                data-tour="budget-sinking"
              >
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                  Sinking funds (quick idea)
                </p>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
                  Annual bill? Divide by 12 and add it as a Savings item so it never surprises you.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { name: "Car insurance", yearly: 1200 },
                    { name: "Gifts & holidays", yearly: 600 },
                    { name: "Car maintenance", yearly: 900 },
                    { name: "Travel", yearly: 1500 },
                  ].map((x) => (
                    <button
                      key={x.name}
                      type="button"
                      onClick={() =>
                        setItems((prev) => [
                          ...prev,
                          {
                            id: uid(),
                            name: `${x.name} sinking fund`,
                            group: "Savings",
                            amountMonthly: Math.round(x.yearly / 12),
                          },
                        ])
                      }
                      className="text-left rounded-2xl border border-zinc-200 bg-white p-3 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/40"
                    >
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{x.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        ~{money(Math.round(x.yearly / 12))}/mo
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

