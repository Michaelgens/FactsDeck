"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedFiSnapshot from "./AdvancedFiSnapshot";
import FiSnapshotQuickJourney from "./fi-snapshot/FiSnapshotQuickJourney";
import FiSnapshotJourneyResults from "./fi-snapshot/FiSnapshotJourneyResults";
import type { FiSnapshotJourneyAnswers } from "./fi-snapshot/fi-snapshot-journey-types";

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

  const handleJourneyComplete = useCallback((a: FiSnapshotJourneyAnswers) => {
    setAnswers(a);
    setPhase("results");
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleSkip = useCallback(() => {
    setPhase("dashboard");
    setAnswers(null);
  }, []);

  const handleOpenDashboard = useCallback(() => {
    setPhase("dashboard");
  }, []);

  const handleStartOver = useCallback(() => {
    setAnswers(null);
    setPhase("journey");
  }, []);

  const initialWorkspace = useMemo(() => {
    if (!answers) return undefined;
    return {
      liquidCash: answers.liquidCash,
      invested: answers.invested,
      otherAssets: answers.otherAssets,
      liabilities: answers.liabilities,
      monthlyExpenses: answers.monthlyExpenses,
      monthlyInvesting: answers.monthlyInvesting,
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
        <div className="min-h-[50vh] flex items-center justify-center bg-zinc-950 text-violet-200/80 text-sm font-medium">
          Loading snapshot…
        </div>
      }
    >
      <FiSnapshotEntryInner />
    </Suspense>
  );
}
