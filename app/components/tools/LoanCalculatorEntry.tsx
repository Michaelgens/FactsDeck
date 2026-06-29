"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedLoanCalculator from "./AdvancedLoanCalculator";
import LoanQuickJourney from "./loan/LoanQuickJourney";
import LoanJourneyResults from "./loan/LoanJourneyResults";
import type { LoanJourneyAnswers } from "./loan/loan-journey-types";
import { computeLoanJourneyMetrics } from "./loan/compute-loan-journey-metrics";
import { journeyToPersistSeed, saveLoanState } from "./loan/loan-storage";
import { LOAN_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";

type Phase = "journey" | "results" | "dashboard";

function LoanCalculatorEntryInner() {
  const searchParams = useSearchParams();
  const retakeTest =
    searchParams.get("retake") === "1" ||
    searchParams.get("test") === "1" ||
    searchParams.get("loan-test") === "1";
  const dashboardParam = searchParams.get("dashboard") === "1" || searchParams.get("view") === "full";

  const [phase, setPhase] = useState<Phase>(() => {
    if (retakeTest) return "journey";
    if (dashboardParam) return "dashboard";
    return "journey";
  });
  const [answers, setAnswers] = useState<LoanJourneyAnswers | null>(null);

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
    trackToolEvent(LOAN_SLUG, "page_view", undefined, true);
  }, []);

  useEffect(() => {
    if (phase === "results") {
      trackToolEvent(LOAN_SLUG, "results_view", undefined, true);
    }
  }, [phase]);

  const handleJourneyComplete = useCallback((a: LoanJourneyAnswers) => {
    const m = computeLoanJourneyMetrics(a);
    trackToolEvent(LOAN_SLUG, "journey_complete", {
      goal: a.goal,
      principal: a.principal,
      apr: a.apr,
      termYears: a.termYears,
      extraMonthly: a.extraMonthly,
      monthlyPayment: Math.round(m.monthlyPayment),
      totalInterest: Math.round(m.totalInterest),
    });
    saveLoanState(journeyToPersistSeed(a));
    setAnswers(a);
    setPhase("results");
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleSkip = useCallback(() => {
    trackToolEvent(LOAN_SLUG, "journey_skip", undefined, true);
    trackToolEvent(LOAN_SLUG, "dashboard_open", { source: "journey_skip" }, true);
    setPhase("dashboard");
    setAnswers(null);
  }, []);

  const handleOpenDashboard = useCallback(() => {
    trackToolEvent(LOAN_SLUG, "dashboard_open", { source: "results" }, true);
    setPhase("dashboard");
  }, []);

  const handleStartOver = useCallback(() => {
    trackToolEvent(LOAN_SLUG, "retake_click");
    setAnswers(null);
    setPhase("journey");
  }, []);

  const calculatorInitial = useMemo(
    () =>
      answers
        ? {
            goal: answers.goal,
            principal: answers.principal,
            apr: answers.apr,
            termYears: answers.termYears,
            extraMonthly: answers.extraMonthly,
            feePct: answers.feePct,
            fromJourney: true as const,
          }
        : undefined,
    [answers]
  );

  if (phase === "journey") {
    return <LoanQuickJourney onComplete={handleJourneyComplete} onSkipToDashboard={handleSkip} />;
  }

  if (phase === "results" && answers) {
    return <LoanJourneyResults answers={answers} onOpenDashboard={handleOpenDashboard} onStartOver={handleStartOver} />;
  }

  return <AdvancedLoanCalculator initialValues={calculatorInitial} deferWalkthrough={Boolean(answers)} />;
}

export default function LoanCalculatorEntry() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500 text-sm font-medium">
          Loading calculator…
        </div>
      }
    >
      <LoanCalculatorEntryInner />
    </Suspense>
  );
}
