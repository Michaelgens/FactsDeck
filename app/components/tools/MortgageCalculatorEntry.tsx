"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedMortgageCalculator from "./AdvancedMortgageCalculator";
import MortgageQuickJourney from "./mortgage/MortgageQuickJourney";
import MortgageJourneyResults from "./mortgage/MortgageJourneyResults";
import type { MortgageJourneyAnswers } from "./mortgage/mortgage-journey-types";

type Phase = "journey" | "results" | "dashboard";

function MortgageCalculatorEntryInner() {
  const searchParams = useSearchParams();
  const retakeTest =
    searchParams.get("retake") === "1" ||
    searchParams.get("test") === "1" ||
    searchParams.get("mortgage-test") === "1";
  const dashboardParam = searchParams.get("dashboard") === "1" || searchParams.get("view") === "full";

  const [phase, setPhase] = useState<Phase>(() => {
    if (retakeTest) return "journey";
    if (dashboardParam) return "dashboard";
    return "journey";
  });
  const [answers, setAnswers] = useState<MortgageJourneyAnswers | null>(null);

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

  const handleJourneyComplete = useCallback((a: MortgageJourneyAnswers) => {
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
            homePrice: answers.homePrice,
            downPercent: answers.downPercent,
            rate: answers.rate,
            termYears: answers.termYears,
            extraMonthly: answers.extraMonthly,
            incomeMonthly: answers.incomeMonthly,
          }
        : undefined,
    [answers]
  );

  if (phase === "journey") {
    return <MortgageQuickJourney onComplete={handleJourneyComplete} onSkipToDashboard={handleSkip} />;
  }

  if (phase === "results" && answers) {
    return (
      <MortgageJourneyResults answers={answers} onOpenDashboard={handleOpenDashboard} onStartOver={handleStartOver} />
    );
  }

  return (
    <AdvancedMortgageCalculator initialValues={calculatorInitial} deferWalkthrough={Boolean(answers)} />
  );
}

export default function MortgageCalculatorEntry() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500 text-sm font-medium">
          Loading calculator…
        </div>
      }
    >
      <MortgageCalculatorEntryInner />
    </Suspense>
  );
}
