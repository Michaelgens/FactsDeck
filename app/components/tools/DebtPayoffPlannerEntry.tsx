"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedDebtPayoffPlanner from "./AdvancedDebtPayoffPlanner";
import DebtPayoffQuickJourney from "./debt-payoff/DebtPayoffQuickJourney";
import DebtPayoffJourneyResults from "./debt-payoff/DebtPayoffJourneyResults";
import type { DebtJourneyAnswers } from "./debt-payoff/debt-payoff-journey-types";
import { journeyAnswersToDebts } from "./debt-payoff/compute-debt-payoff-metrics";

type Phase = "journey" | "results" | "dashboard";

function DebtPayoffPlannerEntryInner() {
  const searchParams = useSearchParams();
  const retakeTest =
    searchParams.get("retake") === "1" ||
    searchParams.get("test") === "1" ||
    searchParams.get("debt-payoff-test") === "1";
  const dashboardParam = searchParams.get("dashboard") === "1" || searchParams.get("view") === "full";

  const [phase, setPhase] = useState<Phase>(() => {
    if (retakeTest) return "journey";
    if (dashboardParam) return "dashboard";
    return "journey";
  });
  const [answers, setAnswers] = useState<DebtJourneyAnswers | null>(null);

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

  const handleJourneyComplete = useCallback((a: DebtJourneyAnswers) => {
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

  const plannerInitial = useMemo(() => {
    if (!answers) return undefined;
    return {
      debts: journeyAnswersToDebts(answers),
      extraMonthly: answers.extraMonthly,
    };
  }, [answers]);

  if (phase === "journey") {
    return <DebtPayoffQuickJourney onComplete={handleJourneyComplete} onSkipToDashboard={handleSkip} />;
  }

  if (phase === "results" && answers) {
    return <DebtPayoffJourneyResults answers={answers} onOpenDashboard={handleOpenDashboard} onStartOver={handleStartOver} />;
  }

  return <AdvancedDebtPayoffPlanner initialValues={plannerInitial} deferWalkthrough={Boolean(answers)} />;
}

export default function DebtPayoffPlannerEntry() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500 text-sm font-medium">
          Loading planner…
        </div>
      }
    >
      <DebtPayoffPlannerEntryInner />
    </Suspense>
  );
}
