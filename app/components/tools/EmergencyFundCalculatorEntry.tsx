"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedEmergencyFundCalculator from "./AdvancedEmergencyFundCalculator";
import EmergencyFundQuickJourney from "./emergency-fund/EmergencyFundQuickJourney";
import EmergencyFundJourneyResults from "./emergency-fund/EmergencyFundJourneyResults";
import type { EmergencyFundJourneyAnswers } from "./emergency-fund/emergency-fund-journey-types";

type Phase = "journey" | "results" | "dashboard";

function EmergencyFundCalculatorEntryInner() {
  const searchParams = useSearchParams();
  const retakeTest =
    searchParams.get("retake") === "1" ||
    searchParams.get("test") === "1" ||
    searchParams.get("emergency-fund-test") === "1";
  const dashboardParam = searchParams.get("dashboard") === "1" || searchParams.get("view") === "full";

  const [phase, setPhase] = useState<Phase>(() => {
    if (retakeTest) return "journey";
    if (dashboardParam) return "dashboard";
    return "journey";
  });
  const [answers, setAnswers] = useState<EmergencyFundJourneyAnswers | null>(null);

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

  const handleJourneyComplete = useCallback((a: EmergencyFundJourneyAnswers) => {
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
            monthlyEssentials: answers.monthlyEssentials,
            currentFund: answers.currentFund,
            monthlyContribution: answers.monthlyContribution,
            targetMonths: answers.targetMonths,
          }
        : undefined,
    [answers]
  );

  if (phase === "journey") {
    return <EmergencyFundQuickJourney onComplete={handleJourneyComplete} onSkipToDashboard={handleSkip} />;
  }

  if (phase === "results" && answers) {
    return (
      <EmergencyFundJourneyResults answers={answers} onOpenDashboard={handleOpenDashboard} onStartOver={handleStartOver} />
    );
  }

  return (
    <AdvancedEmergencyFundCalculator initialValues={calculatorInitial} deferWalkthrough={Boolean(answers)} />
  );
}

export default function EmergencyFundCalculatorEntry() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500 text-sm font-medium">
          Loading calculator…
        </div>
      }
    >
      <EmergencyFundCalculatorEntryInner />
    </Suspense>
  );
}
