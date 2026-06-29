"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedStudentLoanSnapshot from "./AdvancedStudentLoanSnapshot";
import StudentLoanQuickJourney from "./student-loan/StudentLoanQuickJourney";
import StudentLoanJourneyResults from "./student-loan/StudentLoanJourneyResults";
import type { StudentLoanJourneyAnswers } from "./student-loan/student-loan-journey-types";
import { computeStudentLoanJourneyMetrics } from "./student-loan/compute-student-loan-metrics";
import { journeyToPersistSeed, saveStudentLoanState } from "./student-loan/student-loan-storage";
import { STUDENT_LOAN_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";

type Phase = "journey" | "results" | "dashboard";

function StudentLoanSnapshotEntryInner() {
  const searchParams = useSearchParams();
  const retakeTest =
    searchParams.get("retake") === "1" ||
    searchParams.get("test") === "1" ||
    searchParams.get("student-loan-test") === "1";
  const dashboardParam = searchParams.get("dashboard") === "1" || searchParams.get("view") === "full";

  const [phase, setPhase] = useState<Phase>(() => {
    if (retakeTest) return "journey";
    if (dashboardParam) return "dashboard";
    return "journey";
  });
  const [answers, setAnswers] = useState<StudentLoanJourneyAnswers | null>(null);

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
    trackToolEvent(STUDENT_LOAN_SLUG, "page_view", undefined, true);
  }, []);

  useEffect(() => {
    if (phase === "results") {
      trackToolEvent(STUDENT_LOAN_SLUG, "results_view", undefined, true);
    }
  }, [phase]);

  const handleJourneyComplete = useCallback((a: StudentLoanJourneyAnswers) => {
    const m = computeStudentLoanJourneyMetrics(a);
    trackToolEvent(STUDENT_LOAN_SLUG, "journey_complete", {
      goal: a.goal,
      balance: a.balance,
      apr: a.aprPercent,
      annualIncome: a.annualIncome,
      standardMonthly: Math.round(m.standardMonthly * 100) / 100,
      idrMonthly: Math.round(m.idrMonthly * 100) / 100,
      idrBelowInterest: m.idrBelowInterest,
    });
    saveStudentLoanState(journeyToPersistSeed(a));
    setAnswers(a);
    setPhase("results");
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleSkip = useCallback(() => {
    trackToolEvent(STUDENT_LOAN_SLUG, "journey_skip", undefined, true);
    trackToolEvent(STUDENT_LOAN_SLUG, "dashboard_open", { source: "journey_skip" }, true);
    setPhase("dashboard");
    setAnswers(null);
  }, []);

  const handleOpenDashboard = useCallback(() => {
    trackToolEvent(STUDENT_LOAN_SLUG, "dashboard_open", { source: "results" }, true);
    setPhase("dashboard");
  }, []);

  const handleStartOver = useCallback(() => {
    trackToolEvent(STUDENT_LOAN_SLUG, "retake_click");
    setAnswers(null);
    setPhase("journey");
  }, []);

  const initialWorkspace = useMemo(() => {
    if (!answers) return undefined;
    return {
      goal: answers.goal,
      balance: answers.balance,
      aprPercent: answers.aprPercent,
      annualIncome: answers.annualIncome,
      familySize: answers.familySize,
      fromJourney: true as const,
    };
  }, [answers]);

  if (phase === "journey") {
    return <StudentLoanQuickJourney onComplete={handleJourneyComplete} onSkipToDashboard={handleSkip} />;
  }

  if (phase === "results" && answers) {
    return (
      <StudentLoanJourneyResults answers={answers} onOpenDashboard={handleOpenDashboard} onStartOver={handleStartOver} />
    );
  }

  return <AdvancedStudentLoanSnapshot initialValues={initialWorkspace} deferWalkthrough={Boolean(answers)} />;
}

export default function StudentLoanSnapshotEntry() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-slate-950 text-slate-500 text-sm font-medium">
          Loading snapshot…
        </div>
      }
    >
      <StudentLoanSnapshotEntryInner />
    </Suspense>
  );
}
