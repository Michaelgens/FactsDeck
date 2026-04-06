"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedCreditScoreSimulator from "./AdvancedCreditScoreSimulator";
import CreditQuickJourney from "./credit/CreditQuickJourney";
import CreditJourneyResults from "./credit/CreditJourneyResults";
import type { CreditJourneyAnswers } from "./credit/credit-journey-types";

type Phase = "journey" | "results" | "dashboard";

function CreditCalculatorEntryInner() {
  const searchParams = useSearchParams();
  const retakeTest =
    searchParams.get("retake") === "1" ||
    searchParams.get("test") === "1" ||
    searchParams.get("credit-test") === "1";
  const dashboardParam = searchParams.get("dashboard") === "1" || searchParams.get("view") === "full";

  const [phase, setPhase] = useState<Phase>(() => {
    if (retakeTest) return "journey";
    if (dashboardParam) return "dashboard";
    return "journey";
  });
  const [answers, setAnswers] = useState<CreditJourneyAnswers | null>(null);

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

  const handleJourneyComplete = useCallback((a: CreditJourneyAnswers) => {
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
            utilizationPct: answers.utilizationPct,
            onTimePct: answers.onTimePct,
            avgAgeYears: answers.avgAgeYears,
            hardInquiries12m: answers.hardInquiries12m,
            accountTypes: answers.accountTypes,
          }
        : undefined,
    [answers]
  );

  if (phase === "journey") {
    return <CreditQuickJourney onComplete={handleJourneyComplete} onSkipToDashboard={handleSkip} />;
  }

  if (phase === "results" && answers) {
    return (
      <CreditJourneyResults answers={answers} onOpenDashboard={handleOpenDashboard} onStartOver={handleStartOver} />
    );
  }

  return (
    <AdvancedCreditScoreSimulator initialValues={calculatorInitial} deferWalkthrough={Boolean(answers)} />
  );
}

export default function CreditCalculatorEntry() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500 text-sm font-medium">
          Loading simulator…
        </div>
      }
    >
      <CreditCalculatorEntryInner />
    </Suspense>
  );
}
