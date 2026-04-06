"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check, ChevronRight, Copy, Sparkles, Umbrella } from "lucide-react";
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";
import {
  EMERGENCY_FUND_JOURNEY_DEFAULTS,
  FACTS_DECK_EMERGENCY_FUND_CALCULATOR,
  type EmergencyFundJourneyAnswers,
} from "./emergency-fund/emergency-fund-journey-types";
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
import { computeEmergencyFundJourneyMetrics, formatEfMoney } from "./emergency-fund/compute-emergency-fund-journey-metrics";

export type EmergencyFundCalculatorInitialValues = {
  monthlyEssentials?: number;
  currentFund?: number;
  monthlyContribution?: number;
  targetMonths?: number;
};

type Props = {
  initialValues?: EmergencyFundCalculatorInitialValues;
  deferWalkthrough?: boolean;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

const TARGET_CHIPS = [3, 6, 9, 12] as const;

export default function AdvancedEmergencyFundCalculator({
  initialValues,
  deferWalkthrough = false,
}: Props = {}) {
  const d = EMERGENCY_FUND_JOURNEY_DEFAULTS;
  const [monthlyEssentials, setMonthlyEssentials] = useState(
    initialValues?.monthlyEssentials ?? d.monthlyEssentials
  );
  const [currentFund, setCurrentFund] = useState(initialValues?.currentFund ?? d.currentFund);
  const [monthlyContribution, setMonthlyContribution] = useState(
    initialValues?.monthlyContribution ?? d.monthlyContribution
  );
  const [targetMonths, setTargetMonths] = useState(initialValues?.targetMonths ?? d.targetMonths);

  const [copied, setCopied] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const TOUR_ID = "emergency-fund-calculator";

  const answers: EmergencyFundJourneyAnswers = useMemo(
    () => ({
      goal: "essentials",
      monthlyEssentials,
      currentFund,
      monthlyContribution,
      targetMonths: clamp(Math.round(targetMonths), 1, 36),
    }),
    [monthlyEssentials, currentFund, monthlyContribution, targetMonths]
  );

  const m = useMemo(() => computeEmergencyFundJourneyMetrics(answers), [answers]);

  const exportPayload = useMemo(
    () => ({
      tool: FACTS_DECK_EMERGENCY_FUND_CALCULATOR,
      inputs: {
        monthlyEssentials: Math.round(monthlyEssentials),
        currentFund: Math.round(currentFund),
        monthlyContribution: Math.round(monthlyContribution),
        targetMonths: m.targetMonths,
      },
      results: {
        runwayMonths: Math.round(m.runwayMonths * 100) / 100,
        targetBalance: Math.round(m.targetBalance),
        gap: Math.round(m.gap),
        pctOfTarget: Math.round(m.pctOfTarget * 10) / 10,
        monthsToTarget: m.monthsToTarget,
      },
      assumptions: "No interest on savings; expenses held steady. Educational estimate only.",
      createdAt: new Date().toISOString(),
    }),
    [monthlyEssentials, currentFund, monthlyContribution, m]
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
              If you completed the <strong>Facts Deck Emergency Fund Test</strong>, your essentials, balance,
              contribution, and target months are pre-filled. This tour highlights stats, inputs, progress, and JSON
              export.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Replay anytime from the Walk-through button.</p>
          </div>
        ),
      },
      {
        id: "stats",
        target: "[data-tour='ef-stats']",
        title: "Top cards: runway, target, time to goal",
        body: (
          <div className="space-y-2">
            <p>
              <strong>Runway</strong> is current balance divided by monthly essentials. <strong>Target</strong> is
              essentials × months saved. <strong>Time to goal</strong> uses your monthly contribution (simple, no
              growth).
            </p>
          </div>
        ),
      },
      {
        id: "inputs",
        target: "[data-tour='ef-inputs']",
        title: "Inputs: tune your real numbers",
        body: (
          <div className="space-y-2">
            <p>Adjust essentials (must-haves only), what you have saved, how much you add each month, and how many months
              of expenses you want in the fund.</p>
          </div>
        ),
      },
      {
        id: "progress",
        target: "[data-tour='ef-progress']",
        title: "Progress bar: funded vs target",
        body: <p>See how close you are to your target balance at a glance.</p>,
      },
      {
        id: "copy",
        target: "[data-tour='ef-copy-json']",
        title: "Copy JSON: save your snapshot",
        body: <p>Use this to stash your scenario in notes, a spreadsheet, or share with a partner.</p>,
      },
      {
        id: "finish",
        placement: "center",
        title: "All set",
        body: (
          <div className="space-y-3">
            <p>Quick workflow:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Set monthly essentials you truly need</li>
              <li>Enter current emergency savings</li>
              <li>Add a realistic monthly contribution</li>
              <li>Pick a target (often 3–6 months; job loss scenarios may use more)</li>
            </ol>
          </div>
        ),
      },
    ],
    []
  );

  const pctBar = clamp(m.pctOfTarget / 100, 0, 1);

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
        <ToolDashboardHeroBackdrop accent="sky" />

        <div className={tdHeroInner}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
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
            <div>
              <div className="flex items-center gap-3">
                <span className={tdIconTile}>
                  <Umbrella className="h-6 w-6" />
                </span>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {FACTS_DECK_EMERGENCY_FUND_CALCULATOR}
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                    Runway months, target balance, and time to full funding—simple math, no investment return baked in.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTourOpen(true)}
                  className={tdGhostBtn}
                  aria-label="Open emergency fund calculator walk-through"
                >
                  <BookOpen className="h-4 w-4" />
                  Walk-through
                </button>
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Educational planning only — not advice
                </span>
              </div>
            </div>
            <button
              type="button"
              data-tour="ef-copy-json"
              onClick={copyJson}
              className={`${tdGhostBtn} shrink-0 px-5`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy JSON"}
            </button>
          </div>

          <ToolDashboardTestCta toolSlug="emergency-fund-calculator" testLabel={FACTS_DECK_EMERGENCY_FUND_CALCULATOR} />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-10">
        <div
          data-tour="ef-stats"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Runway</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{m.runwayMonths.toFixed(1)} mo</p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Balance ÷ essentials</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Target balance</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{formatEfMoney(m.targetBalance)}</p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{m.targetMonths} mo of expenses</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Gap</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{formatEfMoney(m.gap)}</p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{m.pctOfTarget.toFixed(0)}% funded</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Time to target</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">
              {m.monthsToTarget === null ? "—" : m.monthsToTarget === 0 ? "Done" : `${m.monthsToTarget} mo`}
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {monthlyContribution > 0 ? "At your contribution" : "Add contribution to estimate"}
            </p>
          </div>
        </div>

        <div
          data-tour="ef-progress"
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Progress toward target</p>
            <p className="text-sm font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">
              {formatEfMoney(currentFund)} / {formatEfMoney(m.targetBalance)}
            </p>
          </div>
          <div className="mt-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-600 dark:bg-sky-500 transition-[width] duration-300"
              style={{ width: `${pctBar * 100}%` }}
            />
          </div>
        </div>

        <div
          data-tour="ef-inputs"
          className="rounded-3xl border border-zinc-200 bg-zinc-50/80 p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/30"
        >
          <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50">Inputs</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Use after-tax numbers. Essentials are must-pay monthly costs if income stopped.
          </p>

          <div className="grid gap-8 lg:grid-cols-2">
            <label className="block space-y-2" data-tour="ef-essentials">
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Monthly essentials</span>
              <input
                type="number"
                min={0}
                step={50}
                value={Number.isFinite(monthlyEssentials) ? monthlyEssentials : 0}
                onChange={(e) => setMonthlyEssentials(clamp(Number(e.target.value) || 0, 0, 200_000))}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold tabular-nums text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <input
                type="range"
                min={0}
                max={20000}
                step={50}
                value={clamp(monthlyEssentials, 0, 20000)}
                onChange={(e) => setMonthlyEssentials(Number(e.target.value))}
                className="w-full accent-zinc-900 dark:accent-zinc-100"
              />
            </label>

            <label className="block space-y-2" data-tour="ef-fund">
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Current emergency fund</span>
              <input
                type="number"
                min={0}
                step={100}
                value={Number.isFinite(currentFund) ? currentFund : 0}
                onChange={(e) => setCurrentFund(clamp(Number(e.target.value) || 0, 0, 5_000_000))}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold tabular-nums text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <input
                type="range"
                min={0}
                max={200000}
                step={500}
                value={clamp(currentFund, 0, 200000)}
                onChange={(e) => setCurrentFund(Number(e.target.value))}
                className="w-full accent-zinc-900 dark:accent-zinc-100"
              />
            </label>

            <label className="block space-y-2" data-tour="ef-contrib">
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Monthly contribution</span>
              <input
                type="number"
                min={0}
                step={25}
                value={Number.isFinite(monthlyContribution) ? monthlyContribution : 0}
                onChange={(e) => setMonthlyContribution(clamp(Number(e.target.value) || 0, 0, 50_000))}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold tabular-nums text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <input
                type="range"
                min={0}
                max={5000}
                step={25}
                value={clamp(monthlyContribution, 0, 5000)}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-full accent-zinc-900 dark:accent-zinc-100"
              />
            </label>

            <div className="space-y-3" data-tour="ef-target">
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Target months of expenses</span>
              <div className="flex flex-wrap gap-2">
                {TARGET_CHIPS.map((mo) => (
                  <button
                    key={mo}
                    type="button"
                    onClick={() => setTargetMonths(mo)}
                    className={`rounded-full px-4 py-2 text-sm font-bold border transition-colors ${
                      m.targetMonths === mo
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    {mo} mo
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-zinc-500 w-8">{clamp(m.targetMonths, 1, 36)}</span>
                <input
                  type="range"
                  min={1}
                  max={36}
                  step={1}
                  value={clamp(m.targetMonths, 1, 36)}
                  onChange={(e) => setTargetMonths(Number(e.target.value))}
                  className="flex-1 accent-zinc-900 dark:accent-zinc-100"
                />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Custom 1–36 months</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
