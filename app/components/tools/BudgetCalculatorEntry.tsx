"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedBudgetPlanner from "./AdvancedBudgetPlanner";
import BudgetQuickJourney from "./budget/BudgetQuickJourney";
import BudgetJourneyResults from "./budget/BudgetJourneyResults";
import type { BudgetJourneyAnswers } from "./budget/budget-journey-types";
import { BUDGET_PLANNER_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";

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

  useEffect(() => {
    trackToolEvent(BUDGET_PLANNER_SLUG, "page_view", undefined, true);
  }, []);

  useEffect(() => {
    if (phase === "results") {
      trackToolEvent(BUDGET_PLANNER_SLUG, "results_view", undefined, true);
    }
  }, [phase]);

  const handleJourneyComplete = useCallback((a: BudgetJourneyAnswers) => {
    trackToolEvent(BUDGET_PLANNER_SLUG, "journey_complete", {
      goal: a.goal,
      mode: a.mode,
      incomeMonthly: a.incomeMonthly,
      bufferPct: a.bufferPct,
    });
    setAnswers(a);
    setPhase("results");
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleSkip = useCallback(() => {
    trackToolEvent(BUDGET_PLANNER_SLUG, "journey_skip", undefined, true);
    trackToolEvent(BUDGET_PLANNER_SLUG, "dashboard_open", { source: "journey_skip" }, true);
    setPhase("dashboard");
    setAnswers(null);
  }, []);

  const handleOpenDashboard = useCallback(() => {
    trackToolEvent(BUDGET_PLANNER_SLUG, "dashboard_open", { source: "results" }, true);
    setPhase("dashboard");
  }, []);

  const handleStartOver = useCallback(() => {
    trackToolEvent(BUDGET_PLANNER_SLUG, "retake_click");
    setAnswers(null);
    setPhase("journey");
  }, []);

  const plannerInitial = useMemo(
    () =>
      answers
        ? {
            goal: answers.goal,
            mode: answers.mode,
            incomeMonthly: answers.incomeMonthly,
            bufferPct: answers.bufferPct,
            fromJourney: true as const,
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

  return (
    <AdvancedBudgetPlanner initialValues={plannerInitial} deferWalkthrough={Boolean(answers)} />
  );
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
