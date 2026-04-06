"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedCryptoYieldLab from "./AdvancedCryptoYieldLab";
import CryptoYieldQuickJourney from "./crypto-yield/CryptoYieldQuickJourney";
import CryptoYieldJourneyResults from "./crypto-yield/CryptoYieldJourneyResults";
import type { CryptoYieldJourneyAnswers } from "./crypto-yield/crypto-yield-journey-types";

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

  const handleJourneyComplete = useCallback((a: CryptoYieldJourneyAnswers) => {
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

  const initialWorkspace = useMemo(() => {
    if (!answers) return undefined;
    return {
      principal: answers.principal,
      apyPercent: answers.apyPercent,
      months: answers.months,
      compounding: answers.compounding,
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
        <div className="min-h-[50vh] flex items-center justify-center bg-amber-950 text-amber-200/80 text-sm font-medium">
          Loading lab…
        </div>
      }
    >
      <CryptoYieldLabEntryInner />
    </Suspense>
  );
}
