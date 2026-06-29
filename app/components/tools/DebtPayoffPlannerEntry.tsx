"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedDebtPayoffPlanner from "./AdvancedDebtPayoffPlanner";
import DebtPayoffQuickJourney from "./debt-payoff/DebtPayoffQuickJourney";
import DebtPayoffJourneyResults from "./debt-payoff/DebtPayoffJourneyResults";
import type { DebtJourneyAnswers } from "./debt-payoff/debt-payoff-journey-types";
import {
  computeDebtPayoffJourneyMetrics,
  journeyAnswersToDebts,
  maxAprFromAnswers,
  totalDebtFromAnswers,
} from "./debt-payoff/compute-debt-payoff-metrics";
import { journeyToPersistSeed, saveDebtPayoffState } from "./debt-payoff/debt-payoff-storage";
import { DEBT_PAYOFF_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";

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

  useEffect(() => {
    trackToolEvent(DEBT_PAYOFF_SLUG, "page_view", undefined, true);
  }, []);

  useEffect(() => {
    if (phase === "results") {
      trackToolEvent(DEBT_PAYOFF_SLUG, "results_view", undefined, true);
    }
  }, [phase]);

  const handleJourneyComplete = useCallback((a: DebtJourneyAnswers) => {
    const m = computeDebtPayoffJourneyMetrics(a);
    const totalDebt = totalDebtFromAnswers(a);
    trackToolEvent(DEBT_PAYOFF_SLUG, "journey_complete", {
      goal: a.goal,
      totalDebt,
      extraMonthly: a.extraMonthly,
      avalancheMonths: m.avalancheMonths,
      highAprDebt: maxAprFromAnswers(a) >= 20,
    });
    saveDebtPayoffState(journeyToPersistSeed(a));
    setAnswers(a);
    setPhase("results");
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleSkip = useCallback(() => {
    trackToolEvent(DEBT_PAYOFF_SLUG, "journey_skip", undefined, true);
    trackToolEvent(DEBT_PAYOFF_SLUG, "dashboard_open", { source: "journey_skip" }, true);
    setPhase("dashboard");
    setAnswers(null);
  }, []);

  const handleOpenDashboard = useCallback(() => {
    trackToolEvent(DEBT_PAYOFF_SLUG, "dashboard_open", { source: "results" }, true);
    setPhase("dashboard");
  }, []);

  const handleStartOver = useCallback(() => {
    trackToolEvent(DEBT_PAYOFF_SLUG, "retake_click");
    setAnswers(null);
    setPhase("journey");
  }, []);

  const plannerInitial = useMemo(() => {
    if (!answers) return undefined;
    return {
      goal: answers.goal,
      debts: journeyAnswersToDebts(answers),
      extraMonthly: answers.extraMonthly,
      fromJourney: true as const,
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
