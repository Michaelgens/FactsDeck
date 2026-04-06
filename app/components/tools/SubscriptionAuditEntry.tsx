"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedSubscriptionAudit from "./AdvancedSubscriptionAudit";
import SubscriptionAuditQuickJourney from "./subscription-audit/SubscriptionAuditQuickJourney";
import SubscriptionAuditJourneyResults from "./subscription-audit/SubscriptionAuditJourneyResults";
import type { SubscriptionJourneyAnswers } from "./subscription-audit/subscription-audit-journey-types";
import type { SubscriptionLine } from "./subscription-audit/compute-subscription-audit-metrics";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

type Phase = "journey" | "results" | "dashboard";

function SubscriptionAuditEntryInner() {
  const searchParams = useSearchParams();
  const retakeTest =
    searchParams.get("retake") === "1" ||
    searchParams.get("test") === "1" ||
    searchParams.get("subscription-audit-test") === "1";
  const dashboardParam = searchParams.get("dashboard") === "1" || searchParams.get("view") === "full";

  const [phase, setPhase] = useState<Phase>(() => {
    if (retakeTest) return "journey";
    if (dashboardParam) return "dashboard";
    return "journey";
  });
  const [answers, setAnswers] = useState<SubscriptionJourneyAnswers | null>(null);

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

  const handleJourneyComplete = useCallback((a: SubscriptionJourneyAnswers) => {
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

  const initialLines = useMemo((): SubscriptionLine[] | undefined => {
    if (!answers) return undefined;
    return [
      {
        id: uid(),
        name: "Recurring (from quick test — split me)",
        amountMonthly: answers.estimatedMonthlyRecurring,
        category: "Other",
      },
    ];
  }, [answers]);

  if (phase === "journey") {
    return <SubscriptionAuditQuickJourney onComplete={handleJourneyComplete} onSkipToDashboard={handleSkip} />;
  }

  if (phase === "results" && answers) {
    return (
      <SubscriptionAuditJourneyResults answers={answers} onOpenDashboard={handleOpenDashboard} onStartOver={handleStartOver} />
    );
  }

  return (
    <AdvancedSubscriptionAudit initialLines={initialLines} deferWalkthrough={Boolean(answers)} />
  );
}

export default function SubscriptionAuditEntry() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-slate-950 text-slate-500 text-sm font-medium">
          Loading audit…
        </div>
      }
    >
      <SubscriptionAuditEntryInner />
    </Suspense>
  );
}
