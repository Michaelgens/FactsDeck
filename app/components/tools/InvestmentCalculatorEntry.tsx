"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedInvestmentCalculator from "./AdvancedInvestmentCalculator";
import InvestmentQuickJourney from "./investment/InvestmentQuickJourney";
import InvestmentJourneyResults from "./investment/InvestmentJourneyResults";
import type { InvestmentJourneyAnswers } from "./investment/investment-journey-types";
import { computeInvestmentJourneyMetrics } from "./investment/compute-investment-journey-metrics";
import { journeyToPersistSeed, saveInvestmentState } from "./investment/investment-storage";
import { INVESTMENT_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";

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

  useEffect(() => {
    trackToolEvent(INVESTMENT_SLUG, "page_view", undefined, true);
  }, []);

  useEffect(() => {
    if (phase === "results") {
      trackToolEvent(INVESTMENT_SLUG, "results_view", undefined, true);
    }
  }, [phase]);

  const handleJourneyComplete = useCallback((a: InvestmentJourneyAnswers) => {
    const m = computeInvestmentJourneyMetrics(a);
    trackToolEvent(INVESTMENT_SLUG, "journey_complete", {
      goal: a.goal,
      initial: a.initial,
      monthly: a.monthly,
      years: a.years,
      finalNominal: Math.round(m.finalNominal),
      yearsToFire: m.yearsToFire,
    });
    saveInvestmentState(journeyToPersistSeed(a));
    setAnswers(a);
    setPhase("results");
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleSkip = useCallback(() => {
    trackToolEvent(INVESTMENT_SLUG, "journey_skip", undefined, true);
    trackToolEvent(INVESTMENT_SLUG, "dashboard_open", { source: "journey_skip" }, true);
    setPhase("dashboard");
    setAnswers(null);
  }, []);

  const handleOpenDashboard = useCallback(() => {
    trackToolEvent(INVESTMENT_SLUG, "dashboard_open", { source: "results" }, true);
    setPhase("dashboard");
  }, []);

  const handleStartOver = useCallback(() => {
    trackToolEvent(INVESTMENT_SLUG, "retake_click");
    setAnswers(null);
    setPhase("journey");
  }, []);

  const calculatorInitial = useMemo(() => {
    if (!answers) return undefined;
    return {
      goal: answers.goal,
      initial: answers.initial,
      monthly: answers.monthly,
      years: answers.years,
      nominal: answers.nominal,
      inflation: answers.inflation,
      annualSpend: answers.annualSpend,
      swr: answers.swr,
      fromJourney: true as const,
    };
  }, [answers]);

  if (phase === "journey") {
    return <InvestmentQuickJourney onComplete={handleJourneyComplete} onSkipToDashboard={handleSkip} />;
  }

  if (phase === "results" && answers) {
    return (
      <InvestmentJourneyResults answers={answers} onOpenDashboard={handleOpenDashboard} onStartOver={handleStartOver} />
    );
  }

  return <AdvancedInvestmentCalculator initialValues={calculatorInitial} deferWalkthrough={Boolean(answers)} />;
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
