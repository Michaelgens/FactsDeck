"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedMortgageCalculator from "./AdvancedMortgageCalculator";
import MortgageQuickJourney from "./mortgage/MortgageQuickJourney";
import MortgageJourneyResults from "./mortgage/MortgageJourneyResults";
import type { MortgageJourneyAnswers } from "./mortgage/mortgage-journey-types";
import { computeJourneyMetrics } from "./mortgage/compute-journey-metrics";
import { journeyToPersistSeed, saveMortgageState } from "./mortgage/mortgage-storage";
import { MORTGAGE_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";

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

  useEffect(() => {
    trackToolEvent(MORTGAGE_SLUG, "page_view", undefined, true);
  }, []);

  useEffect(() => {
    if (phase === "results") {
      trackToolEvent(MORTGAGE_SLUG, "results_view", undefined, true);
    }
  }, [phase]);

  const handleJourneyComplete = useCallback((a: MortgageJourneyAnswers) => {
    const m = computeJourneyMetrics(a);
    trackToolEvent(MORTGAGE_SLUG, "journey_complete", {
      goal: a.goal,
      homePrice: a.homePrice,
      downPercent: a.downPercent,
      rate: a.rate,
      termYears: a.termYears,
      ltv: m.ltv,
      housingDtiPct: m.housingDtiPct,
      pitiFirstMonth: Math.round(m.pitiFirstMonth),
      needsPmi: m.needsPmi,
    });
    saveMortgageState(journeyToPersistSeed(a));
    setAnswers(a);
    setPhase("results");
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleSkip = useCallback(() => {
    trackToolEvent(MORTGAGE_SLUG, "journey_skip", undefined, true);
    trackToolEvent(MORTGAGE_SLUG, "dashboard_open", { source: "journey_skip" }, true);
    setPhase("dashboard");
    setAnswers(null);
  }, []);

  const handleOpenDashboard = useCallback(() => {
    trackToolEvent(MORTGAGE_SLUG, "dashboard_open", { source: "results" }, true);
    setPhase("dashboard");
  }, []);

  const handleStartOver = useCallback(() => {
    trackToolEvent(MORTGAGE_SLUG, "retake_click");
    setAnswers(null);
    setPhase("journey");
  }, []);

  const calculatorInitial = useMemo(
    () =>
      answers
        ? {
            goal: answers.goal,
            homePrice: answers.homePrice,
            downPercent: answers.downPercent,
            rate: answers.rate,
            termYears: answers.termYears,
            extraMonthly: answers.extraMonthly,
            incomeMonthly: answers.incomeMonthly,
            fromJourney: true as const,
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
