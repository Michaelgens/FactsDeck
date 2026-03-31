"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export type WalkthroughPlacement = "auto" | "top" | "right" | "bottom" | "left" | "center";

export type WalkthroughStep = {
  id: string;
  /** CSS selector for a target element (recommend: [data-tour="..."]). */
  target?: string;
  title: string;
  body: React.ReactNode;
  placement?: WalkthroughPlacement;
  /** Called when this step becomes active (useful for switching tabs, etc.). */
  onEnter?: () => void;
};

type ToolWalkthroughProps = {
  /** Unique id for persistence (e.g. "mortgage-calculator") */
  id: string;
  /** Steps in order */
  steps: WalkthroughStep[];
  /** Whether the tour is currently open */
  open: boolean;
  /** Close (does NOT automatically mark complete) */
  onClose: () => void;
  /** Called when the user completes the final step via Done */
  onFinish?: () => void;
  /** If true, we mark local storage as completed when user closes via X. Default: true */
  markCompleteOnClose?: boolean;
};

const PAD = 10;
const STORAGE_PREFIX = "fd.walkthrough";

function storageKey(id: string) {
  return `${STORAGE_PREFIX}.${id}.v1`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getRect(el: Element | null) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (!Number.isFinite(r.left) || !Number.isFinite(r.top)) return null;
  return r;
}

export function hasCompletedWalkthrough(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(storageKey(id)) === "done";
  } catch {
    return false;
  }
}

export function setWalkthroughCompleted(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(id), "done");
  } catch {
    // ignore
  }
}

export default function ToolWalkthrough({
  id,
  steps,
  open,
  onClose,
  onFinish,
  markCompleteOnClose = true,
}: ToolWalkthroughProps) {
  const [idx, setIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const [entered, setEntered] = useState(false);
  const rafRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [tooltipSize, setTooltipSize] = useState<{ w: number; h: number }>({ w: 460, h: 280 });

  const step = steps[idx] ?? steps[0]!;

  // Reset to step 0 when opened.
  useEffect(() => {
    if (!open) return;
    setIdx(0);
    setEntered(false);
    const t = window.setTimeout(() => setEntered(true), 10);
    return () => window.clearTimeout(t);
  }, [open]);

  // Run step enter hook, then re-measure after layout settles.
  useEffect(() => {
    if (!open) return;
    step?.onEnter?.();
    const t = window.setTimeout(() => setTick((x) => x + 1), 80);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idx]);

  // Keep overlay positioned while scrolling/resizing.
  useEffect(() => {
    if (!open) return;
    function bump() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setTick((x) => x + 1));
    }
    window.addEventListener("resize", bump, { passive: true });
    window.addEventListener("scroll", bump, { passive: true, capture: true } as any);
    return () => {
      window.removeEventListener("resize", bump);
      window.removeEventListener("scroll", bump, { capture: true } as any);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open]);

  // Escape to close.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (markCompleteOnClose) setWalkthroughCompleted(id);
        onClose();
      }
      if (e.key === "ArrowRight") setIdx((v) => clamp(v + 1, 0, steps.length - 1));
      if (e.key === "ArrowLeft") setIdx((v) => clamp(v - 1, 0, steps.length - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, id, onClose, steps.length, markCompleteOnClose]);

  const targetEl = useMemo(() => {
    if (!open) return null;
    if (!step?.target) return null;
    try {
      return document.querySelector(step.target);
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step?.target, tick]);

  const rect = useMemo(() => getRect(targetEl), [targetEl, tick]);

  useEffect(() => {
    if (!open) return;
    if (!targetEl) return;
    try {
      (targetEl as HTMLElement).scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    } catch {
      // ignore
    }
  }, [open, targetEl, idx]);

  const isLast = idx === steps.length - 1;
  const isFirst = idx === 0;
  const safeRect = useMemo(() => {
    if (!open) return null;
    if (!rect) return null;
    return {
      left: Math.max(0, rect.left - PAD),
      top: Math.max(0, rect.top - PAD),
      width: rect.width + PAD * 2,
      height: rect.height + PAD * 2,
      right: Math.min(window.innerWidth, rect.right + PAD),
      bottom: Math.min(window.innerHeight, rect.bottom + PAD),
    };
  }, [open, rect]);

  // UX choice: keep the dialog vertically centered always.
  // The spotlight moves, and we scroll the target into view to match.
  // (placement is kept for future reuse; "center" steps still behave the same.)
  const placement: WalkthroughPlacement = step.placement ?? "auto";

  const tooltipPos = useMemo(() => {
    const viewportPad = 12;
    // When closed, return a stable placeholder. (Hooks must run in the same order.)
    if (!open) {
      const w = clamp(tooltipSize.w, 280, 520);
      return { left: viewportPad, top: viewportPad, width: w };
    }
    const margin = 16;
    const w = clamp(tooltipSize.w, 280, Math.min(520, window.innerWidth - viewportPad * 2));
    const h = clamp(tooltipSize.h, 180, Math.min(720, window.innerHeight - viewportPad * 2));

    // If we have no target, center it.
    if (!safeRect || placement === "center") {
      return {
        left: (window.innerWidth - w) / 2,
        top: (window.innerHeight - h) / 2,
        width: w,
      };
    }

    const cy = safeRect.top + safeRect.height / 2;
    const top = clamp(cy - h / 2, viewportPad, window.innerHeight - h - viewportPad);

    const rightSpace = window.innerWidth - safeRect.right - margin - viewportPad;
    const leftSpace = safeRect.left - margin - viewportPad;

    const canRight = rightSpace >= w;
    const canLeft = leftSpace >= w;

    let left: number;
    if (placement === "right") {
      left = canRight ? safeRect.right + margin : Math.max(viewportPad, safeRect.left - margin - w);
    } else if (placement === "left") {
      left = canLeft ? safeRect.left - margin - w : Math.min(window.innerWidth - w - viewportPad, safeRect.right + margin);
    } else {
      // auto/top/bottom default: choose best side to avoid covering spotlight
      if (canRight || rightSpace >= leftSpace) {
        left = Math.min(window.innerWidth - w - viewportPad, safeRect.right + margin);
      } else {
        left = Math.max(viewportPad, safeRect.left - margin - w);
      }
    }

    return { left, top, width: w };
  }, [open, placement, safeRect, tooltipSize.h, tooltipSize.w]);

  // Measure tooltip after it renders so side placement is accurate.
  useEffect(() => {
    if (!open) return;
    const el = tooltipRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!Number.isFinite(r.width) || !Number.isFinite(r.height)) return;
    // Avoid a render loop: only update if meaningfully different.
    if (Math.abs(r.width - tooltipSize.w) > 2 || Math.abs(r.height - tooltipSize.h) > 2) {
      setTooltipSize({ w: r.width, h: r.height });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idx, tick, entered]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop */}
      {/* No blur + NO overlay inside spotlight: we darken only the outside area. */}
      {safeRect ? (
        <>
          <div
            className={`absolute left-0 top-0 w-full transition-opacity duration-200 ${
              entered ? "opacity-100" : "opacity-0"
            } bg-slate-950/70`}
            style={{ height: safeRect.top }}
          />
          <div
            className={`absolute left-0 transition-opacity duration-200 ${
              entered ? "opacity-100" : "opacity-0"
            } bg-slate-950/70`}
            style={{
              top: safeRect.top,
              height: safeRect.height,
              width: safeRect.left,
            }}
          />
          <div
            className={`absolute transition-opacity duration-200 ${
              entered ? "opacity-100" : "opacity-0"
            } bg-slate-950/70`}
            style={{
              top: safeRect.top,
              height: safeRect.height,
              left: safeRect.left + safeRect.width,
              width: Math.max(0, window.innerWidth - (safeRect.left + safeRect.width)),
            }}
          />
          <div
            className={`absolute left-0 transition-opacity duration-200 ${
              entered ? "opacity-100" : "opacity-0"
            } bg-slate-950/70`}
            style={{
              top: safeRect.top + safeRect.height,
              height: Math.max(0, window.innerHeight - (safeRect.top + safeRect.height)),
              width: "100%",
            }}
          />
        </>
      ) : (
        <div
          className={`absolute inset-0 bg-slate-950/70 transition-opacity duration-200 ${
            entered ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Focus ring */}
      {safeRect && (
        <div
          className={`absolute ring-[2.5px] ring-amber-300 shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition-[transform,opacity] duration-200 ${
            entered ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
          }`}
          style={{
            left: safeRect.left,
            top: safeRect.top,
            width: safeRect.width,
            height: safeRect.height,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`absolute w-[min(92vw,520px)] rounded-2xl border border-white/15 bg-white/95 text-slate-900 shadow-2xl dark:bg-dark-900/95 dark:text-purple-100 dark:border-purple-500/35 transition-[transform,opacity] duration-200 ${
          entered ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
        }`}
        style={{ left: tooltipPos.left, top: tooltipPos.top, width: tooltipPos.width }}
        role="dialog"
        aria-modal="true"
        aria-label="Walk-through"
      >
        <div className="relative overflow-hidden rounded-t-2xl border-b border-slate-200/70 dark:border-purple-500/25">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-amber-500/10 to-transparent dark:from-purple-500/15 dark:via-emerald-500/10" />
          <div className="relative flex items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden />
              Walk-through • Step {idx + 1} of {steps.length}
            </p>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-purple-100 mt-1 leading-snug">
              {step.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              if (markCompleteOnClose) setWalkthroughCompleted(id);
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-purple-900/25 transition-colors"
            aria-label="Close walk-through"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          </div>
        </div>

        <div className="p-4 text-sm leading-relaxed text-slate-700 dark:text-purple-200/90 max-h-[60vh] overflow-auto">
          {step.body}
        </div>

        <div className="flex items-center justify-between gap-3 p-4 border-t border-slate-200/70 dark:border-purple-500/25">
          <button
            type="button"
            onClick={() => {
              setWalkthroughCompleted(id);
              onClose();
            }}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-purple-300 dark:hover:text-emerald-300 transition-colors"
          >
            Skip
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIdx((v) => clamp(v - 1, 0, steps.length - 1))}
              disabled={isFirst}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-850/60 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-purple-900/25 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (isLast) {
                  onFinish?.();
                  setWalkthroughCompleted(id);
                  onClose();
                  return;
                }
                setIdx((v) => clamp(v + 1, 0, steps.length - 1));
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-purple-500/20"
            >
              {isLast ? "Done" : "Next"}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

