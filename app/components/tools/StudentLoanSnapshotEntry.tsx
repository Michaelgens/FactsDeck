"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdvancedStudentLoanSnapshot from "./AdvancedStudentLoanSnapshot";
import StudentLoanQuickJourney from "./student-loan/StudentLoanQuickJourney";
import StudentLoanJourneyResults from "./student-loan/StudentLoanJourneyResults";
import type { StudentLoanJourneyAnswers } from "./student-loan/student-loan-journey-types";

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

  const handleJourneyComplete = useCallback((a: StudentLoanJourneyAnswers) => {
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
      balance: answers.balance,
      aprPercent: answers.aprPercent,
      annualIncome: answers.annualIncome,
      familySize: answers.familySize,
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
