"use client";

import { useState, useCallback, useMemo, Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedRetirementCalculator from "./AdvancedRetirementCalculator";
import RetirementQuickJourney from "./retirement/RetirementQuickJourney";
import RetirementJourneyResults from "./retirement/RetirementJourneyResults";
import type { RetirementJourneyAnswers } from "./retirement/retirement-journey-types";
import { computeRetirementJourneyMetrics } from "./retirement/compute-retirement-journey-metrics";
import { journeyToPersistSeed, saveRetirementState } from "./retirement/retirement-storage";
import { RETIREMENT_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";

type Phase = "journey" | "results" | "dashboard";

function RetirementCalculatorEntryInner() {
  const searchParams = useSearchParams();
  const retakeTest =
    searchParams.get("retake") === "1" ||
    searchParams.get("test") === "1" ||
    searchParams.get("retirement-test") === "1";
  const dashboardParam = searchParams.get("dashboard") === "1" || searchParams.get("view") === "full";

  const [phase, setPhase] = useState<Phase>(() => {
    if (retakeTest) return "journey";
    if (dashboardParam) return "dashboard";
    return "journey";
  });
  const [answers, setAnswers] = useState<RetirementJourneyAnswers | null>(null);
  const seedAccountId = useRef(`rj-${Date.now()}`);

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
    trackToolEvent(RETIREMENT_SLUG, "page_view", undefined, true);
  }, []);

  useEffect(() => {
    if (phase === "results") {
      trackToolEvent(RETIREMENT_SLUG, "results_view", undefined, true);
    }
  }, [phase]);

  const handleJourneyComplete = useCallback((a: RetirementJourneyAnswers) => {
    const m = computeRetirementJourneyMetrics(a);
    trackToolEvent(RETIREMENT_SLUG, "journey_complete", {
      goal: a.goal,
      currentAge: a.currentAge,
      retireAge: a.retireAge,
      yearsToRetire: m.years,
      totalBalance: a.totalBalance,
      monthly: a.contributionMonthly,
      annualSpending: a.annualSpendingToday,
      fiNumber: Math.round(m.fiNumber),
      balanceAtRetire: Math.round(m.balanceAtRetire),
      onTrack: m.onTrack,
    });
    saveRetirementState(journeyToPersistSeed(a, seedAccountId.current));
    setAnswers(a);
    setPhase("results");
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleSkip = useCallback(() => {
    trackToolEvent(RETIREMENT_SLUG, "journey_skip", undefined, true);
    trackToolEvent(RETIREMENT_SLUG, "dashboard_open", { source: "journey_skip" }, true);
    setPhase("dashboard");
    setAnswers(null);
  }, []);

  const handleOpenDashboard = useCallback(() => {
    trackToolEvent(RETIREMENT_SLUG, "dashboard_open", { source: "results" }, true);
    setPhase("dashboard");
  }, []);

  const handleStartOver = useCallback(() => {
    trackToolEvent(RETIREMENT_SLUG, "retake_click");
    setAnswers(null);
    setPhase("journey");
  }, []);

  const calculatorInitial = useMemo(() => {
    if (!answers) return undefined;
    return {
      goal: answers.goal,
      currentAge: answers.currentAge,
      retireAge: answers.retireAge,
      annualSpendingToday: answers.annualSpendingToday,
      inflation: answers.inflation / 100,
      returnNominal: answers.returnNominal / 100,
      withdrawalRate: answers.withdrawalRate / 100,
      socialSecurityAnnualAtRetire: 0,
      accounts: [
        {
          id: seedAccountId.current,
          name: "Your accounts (from test)",
          balance: answers.totalBalance,
          contributionMonthly: answers.contributionMonthly,
          employerMatchMonthly: 0,
        },
      ],
      fromJourney: true as const,
    };
  }, [answers]);

  if (phase === "journey") {
    return <RetirementQuickJourney onComplete={handleJourneyComplete} onSkipToDashboard={handleSkip} />;
  }

  if (phase === "results" && answers) {
    return (
      <RetirementJourneyResults answers={answers} onOpenDashboard={handleOpenDashboard} onStartOver={handleStartOver} />
    );
  }

  return <AdvancedRetirementCalculator initialValues={calculatorInitial} deferWalkthrough={Boolean(answers)} />;
}

export default function RetirementCalculatorEntry() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500 text-sm font-medium">
          Loading calculator…
        </div>
      }
    >
      <RetirementCalculatorEntryInner />
    </Suspense>
  );
}
