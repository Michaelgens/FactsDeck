"use client";

import { useState, useCallback, useMemo, useRef, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedRetirementCalculator from "./AdvancedRetirementCalculator";
import RetirementQuickJourney from "./retirement/RetirementQuickJourney";
import RetirementJourneyResults from "./retirement/RetirementJourneyResults";
import type { RetirementJourneyAnswers } from "./retirement/retirement-journey-types";

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

  const handleJourneyComplete = useCallback((a: RetirementJourneyAnswers) => {
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
          }
        : undefined,
    [answers]
  );

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
