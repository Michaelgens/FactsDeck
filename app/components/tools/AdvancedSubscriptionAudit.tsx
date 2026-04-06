"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check, ChevronRight, Copy, Plus, Repeat, Sparkles, Trash2 } from "lucide-react";
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";
import { FACTS_DECK_SUBSCRIPTION_AUDIT_TOOL } from "./subscription-audit/subscription-audit-journey-types";
import ToolDashboardTestCta from "./ToolDashboardTestCta";
import {
  ToolDashboardHeroBackdrop,
  tdGhostBtn,
  tdHero,
  tdHeroInner,
  tdIconTile,
  tdNavLink,
  tdPage,
} from "./tool-dashboard-ui";
import {
  SUBSCRIPTION_CATEGORIES,
  totalMonthlyFromLines,
  formatSubMoney,
  type SubscriptionCategory,
  type SubscriptionLine,
} from "./subscription-audit/compute-subscription-audit-metrics";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const SEED_LINES: SubscriptionLine[] = [
  { id: "s1", name: "Streaming", amountMonthly: 22, category: "Streaming" },
  { id: "s2", name: "Music", amountMonthly: 11, category: "Streaming" },
  { id: "s3", name: "Cloud storage", amountMonthly: 3, category: "Cloud & storage" },
  { id: "s4", name: "Software", amountMonthly: 35, category: "Software & apps" },
  { id: "s5", name: "Gym / fitness app", amountMonthly: 40, category: "Fitness" },
];

type Props = {
  initialLines?: SubscriptionLine[];
  deferWalkthrough?: boolean;
};

export default function AdvancedSubscriptionAudit({ initialLines, deferWalkthrough = false }: Props = {}) {
  const [lines, setLines] = useState<SubscriptionLine[]>(() =>
    initialLines?.length ? initialLines.map((l) => ({ ...l })) : SEED_LINES.map((l) => ({ ...l, id: uid() }))
  );
  const [trimPercent, setTrimPercent] = useState(15);
  const [copied, setCopied] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const TOUR_ID = "subscription-spend-audit";

  const monthlyTotal = useMemo(() => totalMonthlyFromLines(lines), [lines]);
  const annualTotal = monthlyTotal * 12;
  const trimMonthly = monthlyTotal * (trimPercent / 100);
  const trimAnnual = trimMonthly * 12;

  const byCategory = useMemo(() => {
    const m: Partial<Record<SubscriptionCategory, number>> = {};
    for (const l of lines) {
      m[l.category] = (m[l.category] ?? 0) + Math.max(0, l.amountMonthly);
    }
    return m;
  }, [lines]);

  const exportPayload = useMemo(
    () => ({
      tool: FACTS_DECK_SUBSCRIPTION_AUDIT_TOOL,
      lines: lines.map((l) => ({
        name: l.name || "(unnamed)",
        amountMonthly: Math.round(l.amountMonthly * 100) / 100,
        category: l.category,
      })),
      totals: {
        monthly: Math.round(monthlyTotal * 100) / 100,
        annual: Math.round(annualTotal * 100) / 100,
      },
      trimScenario: { percent: trimPercent, monthlySavings: Math.round(trimMonthly * 100) / 100, annualSavings: Math.round(trimAnnual * 100) / 100 },
      byCategory,
      createdAt: new Date().toISOString(),
    }),
    [lines, monthlyTotal, annualTotal, trimPercent, trimMonthly, trimAnnual, byCategory]
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
              If you took the <strong>Facts Deck Recurring Spend Test</strong>, your estimate is a starter line—split it
              into real names. Add anything that bills monthly or that you mentally annualize (divide annual by 12).
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Replay anytime from Walk-through.</p>
          </div>
        ),
      },
      {
        id: "totals",
        target: "[data-tour='sub-totals']",
        title: "Totals: monthly & yearly",
        body: <p>Small monthly numbers turn into big annual numbers—this bar keeps the sting visible without judgment.</p>,
      },
      {
        id: "lines",
        target: "[data-tour='sub-lines']",
        title: "Line items",
        body: <p>Name each charge, assign a category, and delete rows you don’t need. Add rows for forgotten subs.</p>,
      },
      {
        id: "trim",
        target: "[data-tour='sub-trim']",
        title: "Trim scenario",
        body: <p>Slide a hypothetical cut—useful for “what if I negotiated or canceled a bucket of stuff?”</p>,
      },
      {
        id: "copy",
        target: "[data-tour='sub-copy']",
        title: "Copy JSON",
        body: <p>Share with a partner or paste into a spreadsheet—totals and per-line detail included.</p>,
      },
      {
        id: "finish",
        placement: "center",
        title: "That’s it",
        body: <p>Recurring spend is a habit design problem—this audit just makes the autoplay visible.</p>,
      },
    ],
    []
  );

  const updateLine = (id: string, patch: Partial<SubscriptionLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const removeLine = (id: string) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.id !== id)));
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { id: uid(), name: "", amountMonthly: 10, category: "Other" },
    ]);
  };

  const catBar = (label: string, amt: number) => {
    const w = monthlyTotal > 0 ? `${Math.round((amt / monthlyTotal) * 100)}%` : "0%";
    return (
      <div key={label}>
        <div className="flex justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
          <span>{label}</span>
          <span className="tabular-nums">{formatSubMoney(amt)}/mo</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div className="h-full bg-zinc-600 dark:bg-zinc-400 rounded-full transition-all" style={{ width: w }} />
        </div>
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
                <Repeat className="h-7 w-7" />
              </span>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {FACTS_DECK_SUBSCRIPTION_AUDIT_TOOL}
                </h1>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                  List recurring charges, see yearly burn, and model a trim—autopay made visible.
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
                    Not bank linking—manual honesty only
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              data-tour="sub-copy"
              onClick={copyJson}
              className={`${tdGhostBtn} px-5`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy JSON"}
            </button>
          </div>

          <ToolDashboardTestCta toolSlug="subscription-spend-audit" testLabel={FACTS_DECK_SUBSCRIPTION_AUDIT_TOOL} />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-10">
        <div data-tour="sub-totals" className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Monthly recurring</p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums">{formatSubMoney(monthlyTotal)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40 md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Annualized</p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums">{formatSubMoney(annualTotal)}</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">That’s what quiet autopay costs per year at this list.</p>
          </div>
        </div>

        <div data-tour="sub-trim" className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Trim scenario (illustrative)</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-zinc-900 dark:text-zinc-100">{trimPercent}%</p>
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={trimPercent}
            onChange={(e) => setTrimPercent(Number(e.target.value))}
            className="mt-4 w-full accent-zinc-900 dark:accent-zinc-100"
          />
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            ≈ save <strong>{formatSubMoney(trimMonthly)}</strong>/mo · <strong>{formatSubMoney(trimAnnual)}</strong>/yr if you cut this share of the list.
          </p>
        </div>

        <div data-tour="sub-lines" className="rounded-3xl border border-zinc-200 bg-zinc-50/80 p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <h2 className="font-display text-xl font-bold">Line items</h2>
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <Plus className="h-4 w-4" />
              Add row
            </button>
          </div>

          <div className="space-y-4">
            {lines.map((l) => (
              <div
                key={l.id}
                className="grid gap-3 lg:grid-cols-12 lg:items-end rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/80"
              >
                <label className="lg:col-span-4 block space-y-1">
                  <span className="text-xs font-semibold text-zinc-500">Name</span>
                  <input
                    value={l.name}
                    onChange={(e) => updateLine(l.id, { name: e.target.value })}
                    placeholder="e.g. Netflix"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
                <label className="lg:col-span-2 block space-y-1">
                  <span className="text-xs font-semibold text-zinc-500">$/mo</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={l.amountMonthly}
                    onChange={(e) => updateLine(l.id, { amountMonthly: Math.max(0, Number(e.target.value) || 0) })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold tabular-nums dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
                <label className="lg:col-span-4 block space-y-1">
                  <span className="text-xs font-semibold text-zinc-500">Category</span>
                  <select
                    value={l.category}
                    onChange={(e) => updateLine(l.id, { category: e.target.value as SubscriptionCategory })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    {SUBSCRIPTION_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="lg:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeLine(l.id)}
                    disabled={lines.length <= 1}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-900/50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-4">By category (monthly)</h3>
          <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
            {SUBSCRIPTION_CATEGORIES.filter((c) => (byCategory[c] ?? 0) > 0).map((c) => catBar(c, byCategory[c] ?? 0))}
            {lines.length > 0 && SUBSCRIPTION_CATEGORIES.every((c) => (byCategory[c] ?? 0) <= 0) ? (
              <p className="text-sm text-zinc-500">Enter amounts to see category bars.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
