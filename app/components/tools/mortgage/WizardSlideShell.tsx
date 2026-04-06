"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FACTS_DECK_MORTGAGE_TEST } from "./mortgage-journey-types";

type WizardSlideShellProps = {
  stepIndex: number;
  totalSteps: number;
  /** Shown above the step counter (e.g. Facts Deck Mortgage Test). */
  seriesTitle?: string;
  title: string;
  subtitle?: string;
  /** `hero` = full-bleed welcome slide (no series/step headings; children carry the layout). */
  layout?: "default" | "hero";
  children: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  variant?: "default" | "finish";
  /** Optional second action (e.g. hero slide: skip to full calculator). */
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export default function WizardSlideShell({
  stepIndex,
  totalSteps,
  seriesTitle = FACTS_DECK_MORTGAGE_TEST,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextLabel = "Continue",
  backLabel = "Back",
  nextDisabled = false,
  showBack = true,
  variant = "default",
  layout = "default",
  secondaryLabel,
  onSecondary,
}: WizardSlideShellProps) {
  const progress = ((stepIndex + 1) / totalSteps) * 100;
  const isHero = layout === "hero";

  return (
    <div className="relative min-h-[min(100vh,920px)] flex flex-col">
      <div
        className="h-1.5 w-full bg-zinc-200/80 dark:bg-zinc-800 overflow-hidden"
        role="progressbar"
        aria-valuenow={stepIndex + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`${seriesTitle}: step ${stepIndex + 1} of ${totalSteps}`}
      >
        <div
          className="h-full bg-gradient-to-r from-zinc-800 to-zinc-600 dark:from-zinc-200 dark:to-zinc-400 transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className={`flex-1 flex flex-col mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 ${
          isHero ? "max-w-4xl" : "max-w-2xl"
        }`}
      >
        {!isHero && (
          <>
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-1">{seriesTitle}</p>
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-3">
              Step {stepIndex + 1} of {totalSteps}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 text-balance leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-3 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">{subtitle}</p>
            )}
          </>
        )}

        <div
          className={
            isHero
              ? "flex-1 flex flex-col justify-center min-h-[min(52vh,520px)]"
              : "mt-8 sm:mt-10 flex-1 flex flex-col"
          }
        >
          {children}
        </div>

        <div className="mt-10 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div>
            {showBack && stepIndex > 0 && onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                {backLabel}
              </button>
            ) : (
              <span className="invisible select-none" aria-hidden="true">
                <span className="inline-flex min-h-[40px] min-w-[5.5rem] items-center text-sm font-semibold">&nbsp;</span>
              </span>
            )}
          </div>
          <div
            className={`flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end ${
              onSecondary && secondaryLabel ? "sm:gap-4" : ""
            }`}
          >
            {onSecondary && secondaryLabel ? (
              <button
                type="button"
                onClick={onSecondary}
                className="inline-flex min-h-[48px] min-w-[200px] items-center justify-center rounded-2xl border-2 border-zinc-300 bg-white px-8 py-3.5 text-sm font-bold text-zinc-800 shadow-sm transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
              >
                {secondaryLabel}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onNext}
              disabled={nextDisabled}
              className={`inline-flex min-h-[48px] min-w-[200px] items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold shadow-sm transition-all ${
                variant === "finish"
                  ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              } disabled:pointer-events-none disabled:opacity-45`}
            >
              {nextLabel}
              {variant !== "finish" && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
