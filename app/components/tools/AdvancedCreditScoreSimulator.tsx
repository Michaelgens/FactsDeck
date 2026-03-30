"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Activity,
  Gauge,
  Sparkles,
  Copy,
  Check,
  Shield,
  Zap,
  BookOpen,
} from "lucide-react";

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
  if (score < 580) return { name: "Poor", color: "from-rose-500 to-red-600", dark: "text-rose-100" };
  if (score < 670) return { name: "Fair", color: "from-amber-500 to-orange-600", dark: "text-amber-100" };
  if (score < 740) return { name: "Good", color: "from-lime-500 to-emerald-600", dark: "text-lime-100" };
  if (score < 800) return { name: "Very good", color: "from-emerald-500 to-teal-600", dark: "text-emerald-100" };
  return { name: "Excellent", color: "from-cyan-500 to-blue-600", dark: "text-cyan-100" };
}

const PRESETS = [
  { name: "Fresh start", util: 45, onTime: 88, ageY: 1.5, inq: 2, mix: 2 },
  { name: "Steady climber", util: 22, onTime: 98, ageY: 6, inq: 1, mix: 3 },
  { name: "Optimizer", util: 6, onTime: 100, ageY: 12, inq: 0, mix: 4 },
] as const;

export default function AdvancedCreditScoreSimulator() {
  const [utilizationPct, setUtilizationPct] = useState(28);
  const [onTimePct, setOnTimePct] = useState(99);
  const [avgAgeYears, setAvgAgeYears] = useState(7);
  const [hardInquiries12m, setHardInquiries12m] = useState(1);
  const [accountTypes, setAccountTypes] = useState(3);

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

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:to-dark-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/12 via-transparent to-sky-600/10 dark:from-fuchsia-900/25 dark:to-sky-900/20" />
        <div className="absolute top-24 left-8 w-72 h-72 bg-fuchsia-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-16 right-8 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-fuchsia-700 dark:text-purple-200 font-semibold hover:text-fuchsia-900 dark:hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/post?category=Credit%20Cards&q=credit%20score"
                className="inline-flex items-center gap-2 text-slate-700 dark:text-purple-200 font-semibold hover:text-fuchsia-800 dark:hover:text-emerald-300 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Credit score guides
                <ChevronRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={copyJson}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-800/60 text-sm font-bold text-slate-900 dark:text-purple-100 hover:bg-slate-50 dark:hover:bg-purple-900/20"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy JSON"}
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1 max-w-xl">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-sky-600 flex items-center justify-center shadow-xl">
                  <Activity className="h-6 w-6 text-white" />
                </span>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-purple-100">
                    Advanced Credit Score Simulator
                  </h1>
                  <p className="text-slate-600 dark:text-purple-200/80 mt-1">
                    Twist the dials on the classic factor mix—see how habits might move a score band (illustrative
                    only).
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/90 dark:bg-amber-900/15 px-4 py-3 text-sm text-amber-950 dark:text-amber-100/90 flex gap-2">
                <Shield className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" />
                <span>
                  This is <strong>not</strong> a real FICO, VantageScore, or lender score. It’s a transparent toy
                  model for learning—your actual score depends on bureau data and proprietary formulas.
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-fuchsia-200 dark:border-fuchsia-500/30 bg-white dark:bg-dark-800/60 text-fuchsia-800 dark:text-fuchsia-200 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 transition-colors"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div
                className={`rounded-3xl p-8 text-white shadow-2xl bg-gradient-to-br ${b.color} relative overflow-hidden`}
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

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-slate-200 dark:border-purple-500/20 bg-white/95 dark:bg-dark-800/50 p-6 shadow-lg space-y-6">
              <p className="text-sm font-bold text-slate-900 dark:text-purple-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-fuchsia-500" />
                Your inputs
              </p>

              <label className="block">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-purple-300">
                  Revolving utilization ({utilizationPct}%)
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={utilizationPct}
                  onChange={(e) => setUtilizationPct(Number(e.target.value))}
                  className="mt-2 w-full accent-fuchsia-600"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-purple-300">
                  On-time payments (last 24 mo) ({onTimePct}%)
                </span>
                <input
                  type="range"
                  min={70}
                  max={100}
                  value={onTimePct}
                  onChange={(e) => setOnTimePct(Number(e.target.value))}
                  className="mt-2 w-full accent-emerald-600"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-purple-300">
                  Average age of accounts ({avgAgeYears} yrs)
                </span>
                <input
                  type="range"
                  min={0}
                  max={25}
                  step={0.5}
                  value={avgAgeYears}
                  onChange={(e) => setAvgAgeYears(Number(e.target.value))}
                  className="mt-2 w-full accent-sky-600"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-bold uppercase text-slate-500 dark:text-purple-300">
                    Hard inquiries (12 mo)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={hardInquiries12m}
                    onChange={(e) => setHardInquiries12m(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 font-mono"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase text-slate-500 dark:text-purple-300">
                    Account types (1–6)
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={accountTypes}
                    onChange={(e) => setAccountTypes(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 font-mono"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 dark:border-purple-500/20 bg-white/95 dark:bg-dark-800/50 p-6 shadow-lg">
                <p className="text-sm font-bold text-slate-900 dark:text-purple-100 mb-4">Factor contribution (model)</p>
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
                        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-purple-200">
                          <span>
                            {meta.label}{" "}
                            <span className="text-slate-400 dark:text-purple-400 font-normal">({meta.weight})</span>
                          </span>
                          <span className="font-mono">{v} pts</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-dark-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500"
                            style={{ width: `${clamp(w, 0, 100)}%` }}
                          />
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-purple-300/80">{meta.hint}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-purple-500/20 bg-white/95 dark:bg-dark-800/50 p-6 shadow-lg">
                <p className="text-sm font-bold text-slate-900 dark:text-purple-100 mb-2">What-if (same model)</p>
                <p className="text-sm text-slate-600 dark:text-purple-200/90 mb-4">
                  If you only lowered utilization (everything else unchanged):
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-900/20 border border-fuchsia-200 dark:border-fuchsia-500/30 p-4">
                    <p className="text-xs font-bold text-fuchsia-800 dark:text-fuchsia-200">−15% utilization</p>
                    <p className="mt-1 text-2xl font-extrabold font-mono text-slate-900 dark:text-purple-100">
                      {whatIf.payDown15}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-500/30 p-4">
                    <p className="text-xs font-bold text-sky-800 dark:text-sky-200">−30% utilization</p>
                    <p className="mt-1 text-2xl font-extrabold font-mono text-slate-900 dark:text-purple-100">
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
