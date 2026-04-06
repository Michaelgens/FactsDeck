"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedLoanCalculator from "./AdvancedLoanCalculator";
import LoanQuickJourney from "./loan/LoanQuickJourney";
import LoanJourneyResults from "./loan/LoanJourneyResults";
import type { LoanJourneyAnswers } from "./loan/loan-journey-types";

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

  const handleJourneyComplete = useCallback((a: LoanJourneyAnswers) => {
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

  const calculatorInitial = useMemo(
    () =>
      answers
        ? {
            principal: answers.principal,
            apr: answers.apr,
            termYears: answers.termYears,
            extraMonthly: answers.extraMonthly,
            feePct: answers.feePct,
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
