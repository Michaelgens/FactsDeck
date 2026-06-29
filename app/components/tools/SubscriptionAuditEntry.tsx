"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedSubscriptionAudit from "./AdvancedSubscriptionAudit";
import SubscriptionAuditQuickJourney from "./subscription-audit/SubscriptionAuditQuickJourney";
import SubscriptionAuditJourneyResults from "./subscription-audit/SubscriptionAuditJourneyResults";
import type { SubscriptionJourneyAnswers } from "./subscription-audit/subscription-audit-journey-types";
import { SUBSCRIPTION_AUDIT_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";

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

  useEffect(() => {
    trackToolEvent(SUBSCRIPTION_AUDIT_SLUG, "page_view", undefined, true);
  }, []);

  useEffect(() => {
    if (phase === "results") {
      trackToolEvent(SUBSCRIPTION_AUDIT_SLUG, "results_view", undefined, true);
    }
  }, [phase]);

  const handleJourneyComplete = useCallback((a: SubscriptionJourneyAnswers) => {
    trackToolEvent(SUBSCRIPTION_AUDIT_SLUG, "journey_complete", {
      goal: a.goal,
      mode: a.mode,
      estimatedMonthlyRecurring: a.estimatedMonthlyRecurring,
      subscriptionCount: a.subscriptionCount,
      targetTrimPercent: a.targetTrimPercent,
    });
    setAnswers(a);
    setPhase("results");
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleSkip = useCallback(() => {
    trackToolEvent(SUBSCRIPTION_AUDIT_SLUG, "journey_skip", undefined, true);
    trackToolEvent(SUBSCRIPTION_AUDIT_SLUG, "dashboard_open", { source: "journey_skip" }, true);
    setPhase("dashboard");
    setAnswers(null);
  }, []);

  const [dashboardSeed, setDashboardSeed] = useState<"none" | "starter">("none");

  const handleOpenDashboard = useCallback((useStarter = false) => {
    trackToolEvent(SUBSCRIPTION_AUDIT_SLUG, "dashboard_open", { source: "results" }, true);
    setDashboardSeed(useStarter ? "starter" : "none");
    setPhase("dashboard");
  }, []);

  const handleStartOver = useCallback(() => {
    trackToolEvent(SUBSCRIPTION_AUDIT_SLUG, "retake_click");
    setAnswers(null);
    setPhase("journey");
  }, []);

  const auditInitial = useMemo(
    () =>
      answers
        ? {
            goal: answers.goal,
            mode: answers.mode,
            estimatedMonthlyRecurring: answers.estimatedMonthlyRecurring,
            subscriptionCount: answers.subscriptionCount,
            targetTrimPercent: answers.targetTrimPercent,
            fromJourney: true as const,
            loadStarterLines: dashboardSeed === "starter",
          }
        : undefined,
    [answers, dashboardSeed]
  );

  if (phase === "journey") {
    return <SubscriptionAuditQuickJourney onComplete={handleJourneyComplete} onSkipToDashboard={handleSkip} />;
  }

  if (phase === "results" && answers) {
    return (
      <SubscriptionAuditJourneyResults
        answers={answers}
        onOpenDashboard={handleOpenDashboard}
        onStartOver={handleStartOver}
      />
    );
  }

  return <AdvancedSubscriptionAudit initialValues={auditInitial} deferWalkthrough={Boolean(answers)} />;
}

export default function SubscriptionAuditEntry() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500 text-sm font-medium">
          Loading audit…
        </div>
      }
    >
      <SubscriptionAuditEntryInner />
    </Suspense>
  );
}
