"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedInvestmentCalculator from "./AdvancedInvestmentCalculator";
import InvestmentQuickJourney from "./investment/InvestmentQuickJourney";
import InvestmentJourneyResults from "./investment/InvestmentJourneyResults";
import type { InvestmentJourneyAnswers } from "./investment/investment-journey-types";

type Phase = "journey" | "results" | "dashboard";

function InvestmentCalculatorEntryInner() {
  const searchParams = useSearchParams();
  const retakeTest =
    searchParams.get("retake") === "1" ||
    searchParams.get("test") === "1" ||
    searchParams.get("investment-test") === "1";
  const dashboardParam = searchParams.get("dashboard") === "1" || searchParams.get("view") === "full";

  const [phase, setPhase] = useState<Phase>(() => {
    if (retakeTest) return "journey";
    if (dashboardParam) return "dashboard";
    return "journey";
  });
  const [answers, setAnswers] = useState<InvestmentJourneyAnswers | null>(null);

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

  const handleJourneyComplete = useCallback((a: InvestmentJourneyAnswers) => {
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
            initial: answers.initial,
            monthly: answers.monthly,
            years: answers.years,
            nominal: answers.nominal,
            inflation: answers.inflation,
            annualSpend: answers.annualSpend,
            swr: answers.swr,
          }
        : undefined,
    [answers]
  );

  if (phase === "journey") {
    return <InvestmentQuickJourney onComplete={handleJourneyComplete} onSkipToDashboard={handleSkip} />;
  }

  if (phase === "results" && answers) {
    return (
      <InvestmentJourneyResults answers={answers} onOpenDashboard={handleOpenDashboard} onStartOver={handleStartOver} />
    );
  }

  return (
    <AdvancedInvestmentCalculator initialValues={calculatorInitial} deferWalkthrough={Boolean(answers)} />
  );
}

export default function InvestmentCalculatorEntry() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500 text-sm font-medium">
          Loading calculator…
        </div>
      }
    >
      <InvestmentCalculatorEntryInner />
    </Suspense>
  );
}
