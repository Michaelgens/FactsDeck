"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Activity,
  Gauge,
  Sparkles,
  Copy,
  Check,
  Shield,
  Zap,
  BookOpen as TourBook,
} from "lucide-react";
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";
import { FACTS_DECK_CREDIT_SCORE_SIMULATOR } from "./credit/credit-journey-types";
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

export type CreditScoreSimulatorInitialValues = {
  utilizationPct?: number;
  onTimePct?: number;
  avgAgeYears?: number;
  hardInquiries12m?: number;
  accountTypes?: number;
};

type AdvancedCreditScoreSimulatorProps = {
  initialValues?: CreditScoreSimulatorInitialValues;
  deferWalkthrough?: boolean;
};

/** Educational model only — not a real FICO/VantageScore. Illustrative 300–850. */
function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function roundScore(n: number) {
  return Math.round(clamp(n, 300, 850));
}

type FactorKey = "utilization" | "payment" | "age" | "inquiries" | "mix";

const FACTOR_LABELS: Record<FactorKey, { label: string; weight: string; hint: string }> = {
  utilization: {
    label: "Amounts owed",
    weight: "~30%",
    hint: "Lower revolving utilization usually helps scores.",
  },
  payment: {
    label: "Payment history",
    weight: "~35%",
    hint: "On-time payments matter most in real scoring models.",
  },
  age: {
    label: "Length of history",
    weight: "~15%",
    hint: "Older average age of accounts tends to help.",
  },
  inquiries: {
    label: "New credit",
    weight: "~10%",
    hint: "Hard inquiries can ding scores temporarily.",
  },
  mix: {
    label: "Credit mix",
    weight: "~10%",
    hint: "Healthy mix of account types (when managed well).",
  },
};

/** Points toward 550-point span above 300 (max total ~550 → 850). */
function factorPoints(input: {
  utilizationPct: number;
  onTimePct: number;
  avgAgeYears: number;
  hardInquiries12m: number;
  accountTypes: number;
}): Record<FactorKey, number> {
  const u = clamp(input.utilizationPct, 0, 100);
  const utilization = Math.round(165 * (1 - u / 100));

  const ot = clamp(input.onTimePct, 0, 100);
  const payment = Math.round(192 * (ot / 100));

  const y = clamp(input.avgAgeYears, 0, 30);
  const age = Math.round(Math.min(82, (y / 25) * 82));

  const hi = clamp(input.hardInquiries12m, 0, 20);
  const inquiries = Math.max(0, Math.round(55 - hi * 4.5));

  const t = clamp(input.accountTypes, 1, 6);
  const mix = Math.min(55, Math.round((t / 5) * 55));

  return { utilization, payment, age, inquiries, mix };
}

function band(score: number): { name: string; color: string; dark: string } {
  // Zinc-only editorial palette: we vary depth, not hue.
  if (score < 580) return { name: "Poor", color: "from-zinc-600 to-zinc-800", dark: "text-zinc-100" };
  if (score < 670) return { name: "Fair", color: "from-zinc-600 to-zinc-900", dark: "text-zinc-100" };
  if (score < 740) return { name: "Good", color: "from-zinc-700 to-zinc-900", dark: "text-zinc-100" };
  if (score < 800) return { name: "Very good", color: "from-zinc-800 to-zinc-950", dark: "text-zinc-100" };
  return { name: "Excellent", color: "from-zinc-900 to-zinc-950", dark: "text-zinc-100" };
}

const PRESETS = [
  { name: "Fresh start", util: 45, onTime: 88, ageY: 1.5, inq: 2, mix: 2 },
  { name: "Steady climber", util: 22, onTime: 98, ageY: 6, inq: 1, mix: 3 },
  { name: "Optimizer", util: 6, onTime: 100, ageY: 12, inq: 0, mix: 4 },
] as const;

export default function AdvancedCreditScoreSimulator({
  initialValues,
  deferWalkthrough = false,
}: AdvancedCreditScoreSimulatorProps = {}) {
  const [tourOpen, setTourOpen] = useState(false);
  const TOUR_ID = "credit-score-simulator";

  const [utilizationPct, setUtilizationPct] = useState(initialValues?.utilizationPct ?? 28);
  const [onTimePct, setOnTimePct] = useState(initialValues?.onTimePct ?? 99);
  const [avgAgeYears, setAvgAgeYears] = useState(initialValues?.avgAgeYears ?? 7);
  const [hardInquiries12m, setHardInquiries12m] = useState(initialValues?.hardInquiries12m ?? 1);
  const [accountTypes, setAccountTypes] = useState(initialValues?.accountTypes ?? 3);

  const [copied, setCopied] = useState(false);

  const pts = useMemo(
    () =>
      factorPoints({
        utilizationPct,
        onTimePct,
        avgAgeYears,
        hardInquiries12m,
        accountTypes,
      }),
    [utilizationPct, onTimePct, avgAgeYears, hardInquiries12m, accountTypes]
  );

  const score = useMemo(() => {
    const raw = 300 + pts.utilization + pts.payment + pts.age + pts.inquiries + pts.mix;
    return roundScore(raw);
  }, [pts]);

  const b = band(score);
  const needle = ((score - 300) / 550) * 100;

  const whatIf = useMemo(() => {
    const sumPts = (p: Record<FactorKey, number>) =>
      roundScore(300 + Object.values(p).reduce((a, x) => a + x, 0));
    const baseIn = {
      utilizationPct,
      onTimePct,
      avgAgeYears,
      hardInquiries12m,
      accountTypes,
    };
    return {
      payDown15: sumPts(
        factorPoints({ ...baseIn, utilizationPct: Math.max(0, utilizationPct - 15) })
      ),
      payDown30: sumPts(
        factorPoints({ ...baseIn, utilizationPct: Math.max(0, utilizationPct - 30) })
      ),
    };
  }, [utilizationPct, onTimePct, avgAgeYears, hardInquiries12m, accountTypes]);

  const exportPayload = useMemo(
    () => ({
      tool: "Advanced Credit Score Simulator",
      disclaimer: "Educational illustrative model only — not a real credit score from any bureau.",
      inputs: {
        utilizationPct,
        onTimePct,
        avgAgeYears,
        hardInquiries12m,
        accountTypes,
      },
      factorPoints: pts,
      simulatedScore: score,
      band: b.name,
      whatIf,
      createdAt: new Date().toISOString(),
    }),
    [utilizationPct, onTimePct, avgAgeYears, hardInquiries12m, accountTypes, pts, score, b.name, whatIf]
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
              If you completed the <strong>Facts Deck Credit Test</strong>, your sliders are pre-filled. This tour covers
              presets, the gauge, and what-if scenarios.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Replay anytime from the Walk-through button.</p>
          </div>
        ),
      },
      {
        id: "disclaimer",
        target: "[data-tour='credit-disclaimer']",
        title: "Quick heads-up (important)",
        body: <p>Real FICO/VantageScore formulas are proprietary. This tool is for learning and “what‑ifs.”</p>,
      },
      {
        id: "presets",
        target: "[data-tour='credit-presets']",
        title: "Presets: start with a vibe",
        body: <p>These buttons load example profiles so you can explore without thinking too hard first.</p>,
      },
      {
        id: "score-card",
        target: "[data-tour='credit-score-card']",
        title: "Your simulated score + band",
        body: (
          <div className="space-y-2">
            <p>This card shows your simulated score and the rough band (Poor → Excellent).</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              The gauge is just a visual—focus on direction, not exact points.
            </p>
          </div>
        ),
      },
      {
        id: "copy",
        target: "[data-tour='credit-copy-json']",
        title: "Copy JSON: save your scenario",
        body: <p>Copy a snapshot so you can compare different “plans” (before/after) later.</p>,
      },
      {
        id: "inputs",
        target: "[data-tour='credit-inputs']",
        title: "Inputs: the five dials",
        body: (
          <div className="space-y-2">
            <p>These controls change the model’s five main factors:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Utilization</strong> (lower is usually better)
              </li>
              <li>
                <strong>On-time %</strong> (higher is better)
              </li>
              <li>
                <strong>Age</strong> (older average helps)
              </li>
              <li>
                <strong>Inquiries</strong> (fewer is better)
              </li>
              <li>
                <strong>Mix</strong> (healthy variety, managed well)
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "utilization",
        target: "[data-tour='credit-utilization']",
        title: "Utilization: the fastest lever",
        body: (
          <div className="space-y-2">
            <p>
              Utilization is roughly “balance ÷ limit.” Even if nothing else changes, lowering it can help quickly.
            </p>
          </div>
        ),
      },
      {
        id: "payment",
        target: "[data-tour='credit-payment']",
        title: "On-time payments: the foundation",
        body: <p>In real scoring, payment history is one of the biggest factors. Protect it.</p>,
      },
      {
        id: "age",
        target: "[data-tour='credit-age']",
        title: "Age: patience pays",
        body: <p>Older average age usually helps. Avoid churning accounts if your goal is score stability.</p>,
      },
      {
        id: "inq-mix",
        target: "[data-tour='credit-inq-mix']",
        title: "Inquiries + mix: small, but real",
        body: <p>Lots of new applications can ding you short-term. Mix helps when accounts are managed well.</p>,
      },
      {
        id: "factor-bars",
        target: "[data-tour='credit-factor-bars']",
        title: "Factor contribution: see the points",
        body: <p>These bars show how many points each factor is contributing in this illustrative model.</p>,
      },
      {
        id: "what-if",
        target: "[data-tour='credit-whatif']",
        title: "What-if: paying down utilization",
        body: <p>Here’s the “only utilization changed” scenario, so you can see a clean, single-variable effect.</p>,
      },
      {
        id: "finish",
        placement: "center",
        title: "All set",
        body: (
          <div className="space-y-3">
            <p>Quick workflow:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Pick a preset</li>
              <li>Lower utilization and see what changes</li>
              <li>Try “inquiries” and “age” to understand slower vs faster levers</li>
              <li>Copy JSON to save a before/after</li>
            </ol>
          </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link href="/" className={tdNavLink}>
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/post?category=Credit%20Cards&q=credit%20score"
                className={tdNavLink}
              >
                <BookOpen className="h-4 w-4" />
                Credit score guides
                <ChevronRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setTourOpen(true)}
                className={`${tdGhostBtn} py-2 text-sm`}
                aria-label="Open credit score simulator walk-through"
              >
                <TourBook className="h-4 w-4" />
                Walk-through
              </button>
              <button
                type="button"
                onClick={copyJson}
                className={`${tdGhostBtn} py-2 text-sm`}
                data-tour="credit-copy-json"
              >
                {copied ? <Check className="h-4 w-4 text-zinc-900 dark:text-zinc-100" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy JSON"}
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1 max-w-xl">
              <div className="flex items-center gap-3">
                <span className={tdIconTile}>
                  <Activity className="h-6 w-6" />
                </span>
                <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {FACTS_DECK_CREDIT_SCORE_SIMULATOR}
                </h1>
              </div>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400 sm:ml-[4rem] leading-relaxed">
                Twist the dials on the classic factor mix—see how habits might move a score band (illustrative
                only).
              </p>

              <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 flex gap-2 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200" data-tour="credit-disclaimer">
                <Shield className="h-5 w-5 shrink-0 text-zinc-900 dark:text-zinc-100" />
                <span>
                  This is <strong>not</strong> a real FICO, VantageScore, or lender score. It’s a transparent toy
                  model for learning—your actual score depends on bureau data and proprietary formulas.
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2" data-tour="credit-presets">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setUtilizationPct(p.util);
                      setOnTimePct(p.onTime);
                      setAvgAgeYears(p.ageY);
                      setHardInquiries12m(p.inq);
                      setAccountTypes(p.mix);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900/40"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Simulated Credit Score Design Section */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div
                className={`rounded-3xl p-8 text-white shadow-2xl bg-gradient-to-br ${b.color} relative overflow-hidden`}
                data-tour="credit-score-card"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
                <div className="relative">
                  <p className="text-sm font-bold uppercase tracking-wide text-white/80 flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    Simulated score
                  </p>
                  <p className="mt-2 text-6xl font-black font-mono tabular-nums tracking-tight">{score}</p>
                  <p className={`mt-1 text-lg font-bold ${b.dark}`}>{b.name}</p>
                  <div className="mt-6 h-3 rounded-full bg-black/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white/90 transition-all duration-500"
                      style={{ width: `${needle}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-white/85">
                    300 ············································································· 850
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ToolDashboardTestCta toolSlug="credit-score-simulator" testLabel={FACTS_DECK_CREDIT_SCORE_SIMULATOR} />

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6 dark:border-zinc-800 dark:bg-zinc-900/40" data-tour="credit-inputs">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                Your inputs
              </p>

              <label className="block">
                <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
                  Revolving utilization ({utilizationPct}%)
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={utilizationPct}
                  onChange={(e) => setUtilizationPct(Number(e.target.value))}
                  className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
                  data-tour="credit-utilization"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
                  On-time payments (last 24 mo) ({onTimePct}%)
                </span>
                <input
                  type="range"
                  min={70}
                  max={100}
                  value={onTimePct}
                  onChange={(e) => setOnTimePct(Number(e.target.value))}
                  className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
                  data-tour="credit-payment"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
                  Average age of accounts ({avgAgeYears} yrs)
                </span>
                <input
                  type="range"
                  min={0}
                  max={25}
                  step={0.5}
                  value={avgAgeYears}
                  onChange={(e) => setAvgAgeYears(Number(e.target.value))}
                  className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
                  data-tour="credit-age"
                />
              </label>

              <div className="grid grid-cols-2 gap-4" data-tour="credit-inq-mix">
                <label className="block">
                  <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
                    Hard inquiries (12 mo)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={hardInquiries12m}
                    onChange={(e) => setHardInquiries12m(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white font-mono text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
                    Account types (1–6)
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={accountTypes}
                    onChange={(e) => setAccountTypes(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white font-mono text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40" data-tour="credit-factor-bars">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">Factor contribution (model)</p>
                <div className="space-y-3">
                  {(Object.keys(FACTOR_LABELS) as FactorKey[]).map((k) => {
                    const v = pts[k];
                    const meta = FACTOR_LABELS[k];
                    const maxPts: Record<FactorKey, number> = {
                      utilization: 165,
                      payment: 192,
                      age: 82,
                      inquiries: 55,
                      mix: 55,
                    };
                    const w = (v / maxPts[k]) * 100;
                    return (
                      <div key={k}>
                        <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                          <span>
                            {meta.label}{" "}
                            <span className="text-zinc-400 dark:text-zinc-500 font-normal">({meta.weight})</span>
                          </span>
                          <span className="font-mono">{v} pts</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden border border-transparent dark:border-zinc-800">
                          <div
                            className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
                            style={{ width: `${clamp(w, 0, 100)}%` }}
                          />
                        </div>
                        <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{meta.hint}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40" data-tour="credit-whatif">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">What-if (same model)</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                  If you only lowered utilization (everything else unchanged):
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4 dark:bg-zinc-950 dark:border-zinc-800">
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">−15% utilization</p>
                    <p className="mt-1 text-2xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                      {whatIf.payDown15}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4 dark:bg-zinc-950 dark:border-zinc-800">
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">−30% utilization</p>
                    <p className="mt-1 text-2xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                      {whatIf.payDown30}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
