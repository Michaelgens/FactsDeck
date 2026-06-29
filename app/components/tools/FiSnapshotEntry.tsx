"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedFiSnapshot from "./AdvancedFiSnapshot";
import FiSnapshotQuickJourney from "./fi-snapshot/FiSnapshotQuickJourney";
import FiSnapshotJourneyResults from "./fi-snapshot/FiSnapshotJourneyResults";
import type { FiSnapshotJourneyAnswers } from "./fi-snapshot/fi-snapshot-journey-types";
import { computeFiSnapshotMetrics } from "./fi-snapshot/compute-fi-snapshot-metrics";
import { journeyToPersistSeed, saveFiSnapshotState } from "./fi-snapshot/fi-snapshot-storage";
import { FI_SNAPSHOT_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";

type Phase = "journey" | "results" | "dashboard";

function FiSnapshotEntryInner() {
  const searchParams = useSearchParams();
  const retakeTest =
    searchParams.get("retake") === "1" ||
    searchParams.get("test") === "1" ||
    searchParams.get("fi-snapshot-test") === "1" ||
    searchParams.get("freedom-snapshot-test") === "1";
  const dashboardParam = searchParams.get("dashboard") === "1" || searchParams.get("view") === "full";

  const [phase, setPhase] = useState<Phase>(() => {
    if (retakeTest) return "journey";
    if (dashboardParam) return "dashboard";
    return "journey";
  });
  const [answers, setAnswers] = useState<FiSnapshotJourneyAnswers | null>(null);

  useEffect(() => {
    if (retakeTest) {
      setPhase("journey");
      setAnswers(null);
      return;
    }
    if (dashboardParam) {
      setPhase("dashboard");
    }
  }, [retakeTest, dashboardParam]);

  useEffect(() => {
    trackToolEvent(FI_SNAPSHOT_SLUG, "page_view", undefined, true);
  }, []);

  useEffect(() => {
    if (phase === "results") {
      trackToolEvent(FI_SNAPSHOT_SLUG, "results_view", undefined, true);
    }
  }, [phase]);

  const handleJourneyComplete = useCallback((a: FiSnapshotJourneyAnswers) => {
    const m = computeFiSnapshotMetrics(a, { withdrawalRatePct: 4, investmentReturnAnnual: 0.07 });
    trackToolEvent(FI_SNAPSHOT_SLUG, "journey_complete", {
      goal: a.goal,
      netWorth: Math.round(m.netWorth),
      totalAssets: Math.round(m.totalAssets),
      liabilities: Math.round(a.liabilities),
      monthlyExpenses: Math.round(a.monthlyExpenses),
      monthlyInvesting: Math.round(a.monthlyInvesting),
      fiNumber: Math.round(m.fiNumber),
      fiProgressPct: Math.round(m.fiProgressPct * 10) / 10,
      freedomBand: m.band,
      yearsToFi: m.yearsToFi,
    });
    saveFiSnapshotState(journeyToPersistSeed(a));
    setAnswers(a);
    setPhase("results");
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleSkip = useCallback(() => {
    trackToolEvent(FI_SNAPSHOT_SLUG, "journey_skip", undefined, true);
    trackToolEvent(FI_SNAPSHOT_SLUG, "dashboard_open", { source: "journey_skip" }, true);
    setPhase("dashboard");
    setAnswers(null);
  }, []);

  const handleOpenDashboard = useCallback(() => {
    trackToolEvent(FI_SNAPSHOT_SLUG, "dashboard_open", { source: "results" }, true);
    setPhase("dashboard");
  }, []);

  const handleStartOver = useCallback(() => {
    trackToolEvent(FI_SNAPSHOT_SLUG, "retake_click");
    setAnswers(null);
    setPhase("journey");
  }, []);

  const initialWorkspace = useMemo(() => {
    if (!answers) return undefined;
    return {
      goal: answers.goal,
      liquidCash: answers.liquidCash,
      invested: answers.invested,
      otherAssets: answers.otherAssets,
      liabilities: answers.liabilities,
      monthlyExpenses: answers.monthlyExpenses,
      monthlyInvesting: answers.monthlyInvesting,
      fromJourney: true as const,
    };
  }, [answers]);

  if (phase === "journey") {
    return <FiSnapshotQuickJourney onComplete={handleJourneyComplete} onSkipToDashboard={handleSkip} />;
  }

  if (phase === "results" && answers) {
    return <FiSnapshotJourneyResults answers={answers} onOpenDashboard={handleOpenDashboard} onStartOver={handleStartOver} />;
  }

  return <AdvancedFiSnapshot initialValues={initialWorkspace} deferWalkthrough={Boolean(answers)} />;
}

export default function FiSnapshotEntry() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500 text-sm font-medium">
          Loading snapshot…
        </div>
      }
    >
      <FiSnapshotEntryInner />
    </Suspense>
  );
}
