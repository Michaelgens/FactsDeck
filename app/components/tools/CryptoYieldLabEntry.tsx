"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedCryptoYieldLab from "./AdvancedCryptoYieldLab";
import CryptoYieldQuickJourney from "./crypto-yield/CryptoYieldQuickJourney";
import CryptoYieldJourneyResults from "./crypto-yield/CryptoYieldJourneyResults";
import type { CryptoYieldJourneyAnswers } from "./crypto-yield/crypto-yield-journey-types";
import { computeCryptoYieldJourneyMetrics } from "./crypto-yield/compute-crypto-yield-metrics";
import { journeyToPersistSeed, saveCryptoYieldState } from "./crypto-yield/crypto-yield-storage";
import { CRYPTO_YIELD_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";

type Phase = "journey" | "results" | "dashboard";

function CryptoYieldLabEntryInner() {
  const searchParams = useSearchParams();
  const retakeTest =
    searchParams.get("retake") === "1" ||
    searchParams.get("test") === "1" ||
    searchParams.get("crypto-yield-test") === "1";
  const dashboardParam = searchParams.get("dashboard") === "1" || searchParams.get("view") === "full";

  const [phase, setPhase] = useState<Phase>(() => {
    if (retakeTest) return "journey";
    if (dashboardParam) return "dashboard";
    return "journey";
  });
  const [answers, setAnswers] = useState<CryptoYieldJourneyAnswers | null>(null);

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
    trackToolEvent(CRYPTO_YIELD_SLUG, "page_view", undefined, true);
  }, []);

  useEffect(() => {
    if (phase === "results") {
      trackToolEvent(CRYPTO_YIELD_SLUG, "results_view", undefined, true);
    }
  }, [phase]);

  const handleJourneyComplete = useCallback((a: CryptoYieldJourneyAnswers) => {
    const m = computeCryptoYieldJourneyMetrics(a);
    trackToolEvent(CRYPTO_YIELD_SLUG, "journey_complete", {
      goal: a.goal,
      principal: Math.round(a.principal * 100) / 100,
      apyPercent: Math.round(a.apyPercent * 1000) / 1000,
      months: a.months,
      compounding: a.compounding,
      futureValue: Math.round(m.futureValue * 100) / 100,
      interestEarned: Math.round(m.interestEarned * 100) / 100,
      effectiveApyPercent: Math.round(m.effectiveApyPercent * 1000) / 1000,
    });
    saveCryptoYieldState(journeyToPersistSeed(a));
    setAnswers(a);
    setPhase("results");
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleSkip = useCallback(() => {
    trackToolEvent(CRYPTO_YIELD_SLUG, "journey_skip", undefined, true);
    trackToolEvent(CRYPTO_YIELD_SLUG, "dashboard_open", { source: "journey_skip" }, true);
    setPhase("dashboard");
    setAnswers(null);
  }, []);

  const handleOpenDashboard = useCallback(() => {
    trackToolEvent(CRYPTO_YIELD_SLUG, "dashboard_open", { source: "results" }, true);
    setPhase("dashboard");
  }, []);

  const handleStartOver = useCallback(() => {
    trackToolEvent(CRYPTO_YIELD_SLUG, "retake_click");
    setAnswers(null);
    setPhase("journey");
  }, []);

  const initialWorkspace = useMemo(() => {
    if (!answers) return undefined;
    return {
      goal: answers.goal,
      principal: answers.principal,
      apyPercent: answers.apyPercent,
      months: answers.months,
      compounding: answers.compounding,
      fromJourney: true as const,
    };
  }, [answers]);

  if (phase === "journey") {
    return <CryptoYieldQuickJourney onComplete={handleJourneyComplete} onSkipToDashboard={handleSkip} />;
  }

  if (phase === "results" && answers) {
    return <CryptoYieldJourneyResults answers={answers} onOpenDashboard={handleOpenDashboard} onStartOver={handleStartOver} />;
  }

  return <AdvancedCryptoYieldLab initialValues={initialWorkspace} deferWalkthrough={Boolean(answers)} />;
}

export default function CryptoYieldLabEntry() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500 text-sm font-medium">
          Loading lab…
        </div>
      }
    >
      <CryptoYieldLabEntryInner />
    </Suspense>
  );
}
