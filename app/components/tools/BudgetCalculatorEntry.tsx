"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedBudgetPlanner from "./AdvancedBudgetPlanner";
import BudgetQuickJourney from "./budget/BudgetQuickJourney";
import BudgetJourneyResults from "./budget/BudgetJourneyResults";
import type { BudgetJourneyAnswers } from "./budget/budget-journey-types";

type Phase = "journey" | "results" | "dashboard";

function BudgetCalculatorEntryInner() {
  const searchParams = useSearchParams();
  const retakeTest =
    searchParams.get("retake") === "1" ||
    searchParams.get("test") === "1" ||
    searchParams.get("budget-test") === "1";
  const dashboardParam = searchParams.get("dashboard") === "1" || searchParams.get("view") === "full";

  const [phase, setPhase] = useState<Phase>(() => {
    if (retakeTest) return "journey";
    if (dashboardParam) return "dashboard";
    return "journey";
  });
  const [answers, setAnswers] = useState<BudgetJourneyAnswers | null>(null);

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

  const handleJourneyComplete = useCallback((a: BudgetJourneyAnswers) => {
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

  const plannerInitial = useMemo(
    () =>
      answers
        ? {
            mode: answers.mode,
            incomeMonthly: answers.incomeMonthly,
            bufferPct: answers.bufferPct,
          }
        : undefined,
    [answers]
  );

  if (phase === "journey") {
    return <BudgetQuickJourney onComplete={handleJourneyComplete} onSkipToDashboard={handleSkip} />;
  }

  if (phase === "results" && answers) {
    return <BudgetJourneyResults answers={answers} onOpenDashboard={handleOpenDashboard} onStartOver={handleStartOver} />;
  }

  return <AdvancedBudgetPlanner initialValues={plannerInitial} deferWalkthrough={Boolean(answers)} />;
}

export default function BudgetCalculatorEntry() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500 text-sm font-medium">
          Loading planner…
        </div>
      }
    >
      <BudgetCalculatorEntryInner />
    </Suspense>
  );
}
