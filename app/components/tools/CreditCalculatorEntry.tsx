"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedCreditScoreSimulator from "./AdvancedCreditScoreSimulator";
import CreditQuickJourney from "./credit/CreditQuickJourney";
import CreditJourneyResults from "./credit/CreditJourneyResults";
import type { CreditJourneyAnswers } from "./credit/credit-journey-types";
import { computeCreditJourneyMetrics } from "./credit/compute-credit-journey-metrics";
import { journeyToPersistSeed, saveCreditScoreState } from "./credit/credit-storage";
import { CREDIT_SCORE_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";

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

  useEffect(() => {
    trackToolEvent(CREDIT_SCORE_SLUG, "page_view", undefined, true);
  }, []);

  useEffect(() => {
    if (phase === "results") {
      trackToolEvent(CREDIT_SCORE_SLUG, "results_view", undefined, true);
    }
  }, [phase]);

  const handleJourneyComplete = useCallback((a: CreditJourneyAnswers) => {
    const m = computeCreditJourneyMetrics(a);
    trackToolEvent(CREDIT_SCORE_SLUG, "journey_complete", {
      goal: a.goal,
      score: m.score,
      utilizationPct: a.utilizationPct,
      onTimePct: a.onTimePct,
    });
    saveCreditScoreState(journeyToPersistSeed(a));
    setAnswers(a);
    setPhase("results");
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleSkip = useCallback(() => {
    trackToolEvent(CREDIT_SCORE_SLUG, "journey_skip", undefined, true);
    trackToolEvent(CREDIT_SCORE_SLUG, "dashboard_open", { source: "journey_skip" }, true);
    setPhase("dashboard");
    setAnswers(null);
  }, []);

  const handleOpenDashboard = useCallback(() => {
    trackToolEvent(CREDIT_SCORE_SLUG, "dashboard_open", { source: "results" }, true);
    setPhase("dashboard");
  }, []);

  const handleStartOver = useCallback(() => {
    trackToolEvent(CREDIT_SCORE_SLUG, "retake_click");
    setAnswers(null);
    setPhase("journey");
  }, []);

  const calculatorInitial = useMemo(() => {
    if (!answers) return undefined;
    return {
      goal: answers.goal,
      utilizationPct: answers.utilizationPct,
      onTimePct: answers.onTimePct,
      avgAgeYears: answers.avgAgeYears,
      hardInquiries12m: answers.hardInquiries12m,
      accountTypes: answers.accountTypes,
      fromJourney: true as const,
    };
  }, [answers]);

  if (phase === "journey") {
    return <CreditQuickJourney onComplete={handleJourneyComplete} onSkipToDashboard={handleSkip} />;
  }

  if (phase === "results" && answers) {
    return (
      <CreditJourneyResults answers={answers} onOpenDashboard={handleOpenDashboard} onStartOver={handleStartOver} />
    );
  }

  return <AdvancedCreditScoreSimulator initialValues={calculatorInitial} deferWalkthrough={Boolean(answers)} />;
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
