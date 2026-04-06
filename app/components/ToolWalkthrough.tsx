"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export type WalkthroughPlacement = "auto" | "top" | "right" | "bottom" | "left" | "center";

export type WalkthroughStep = {
  id: string;
  /** CSS selector for a target element (recommend: [data-tour="..."]). */
  target?: string;
  /** Omit or leave empty for hero intro slides (branding lives in `body`). */
  title?: string;
  body: React.ReactNode;
  placement?: WalkthroughPlacement;
  /** Called when this step becomes active (useful for switching tabs, etc.). */
  onEnter?: () => void;
  /** Larger card, no title line — use with rich `body` (e.g. Facts Deck + tool name). */
  layout?: "default" | "hero";
  skipLabel?: string;
  /** Non-final step primary button (default “Next”). */
  nextLabel?: string;
  /** Final step primary button (default “Done”). */
  doneLabel?: string;
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
            } bg-zinc-950/70`}
            style={{ height: safeRect.top }}
          />
          <div
            className={`absolute left-0 transition-opacity duration-200 ${
              entered ? "opacity-100" : "opacity-0"
            } bg-zinc-950/70`}
            style={{
              top: safeRect.top,
              height: safeRect.height,
              width: safeRect.left,
            }}
          />
          <div
            className={`absolute transition-opacity duration-200 ${
              entered ? "opacity-100" : "opacity-0"
            } bg-zinc-950/70`}
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
            } bg-zinc-950/70`}
            style={{
              top: safeRect.top + safeRect.height,
              height: Math.max(0, window.innerHeight - (safeRect.top + safeRect.height)),
              width: "100%",
            }}
          />
        </>
      ) : (
        <div
          className={`absolute inset-0 bg-zinc-950/70 transition-opacity duration-200 ${
            entered ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Focus ring */}
      {safeRect && (
        <div
          className={`absolute ring-[2.5px] ring-zinc-200 dark:ring-zinc-100 shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition-[transform,opacity] duration-200 ${
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
        className={`absolute rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-2xl dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800 transition-[transform,opacity] duration-200 ${
          step.layout === "hero" ? "w-[min(94vw,560px)]" : "w-[min(92vw,520px)]"
        } ${entered ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"}`}
        style={{ left: tooltipPos.left, top: tooltipPos.top, width: tooltipPos.width }}
        role="dialog"
        aria-modal="true"
        aria-label="Walk-through"
      >
        <div className="relative overflow-hidden rounded-t-2xl border-b border-zinc-200 dark:border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/5 via-transparent to-transparent dark:from-white/5" />
          <div className="relative flex items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" aria-hidden />
              Walk-through • Step {idx + 1} of {steps.length}
            </p>
            {step.title ? (
              <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1 leading-snug">
                {step.title}
              </h3>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              if (markCompleteOnClose) setWalkthroughCompleted(id);
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            aria-label="Close walk-through"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          </div>
        </div>

        <div
          className={`p-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 max-h-[60vh] overflow-auto ${
            step.layout === "hero" ? "pt-2" : ""
          }`}
        >
          {step.body}
        </div>

        <div className="flex flex-col gap-3 border-t border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              setWalkthroughCompleted(id);
              onClose();
            }}
            className="inline-flex min-h-[44px] min-w-[10rem] items-center justify-center rounded-xl border-2 border-zinc-300 bg-white px-4 py-2.5 text-sm font-bold text-zinc-800 shadow-sm transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
          >
            {step.skipLabel ?? "Skip"}
          </button>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIdx((v) => clamp(v - 1, 0, steps.length - 1))}
              disabled={isFirst}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900/40 disabled:opacity-50 disabled:pointer-events-none transition-colors"
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
              className="inline-flex min-h-[44px] min-w-[10rem] items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {isLast ? step.doneLabel ?? "Done" : step.nextLabel ?? "Next"}
              {!isLast && <ChevronRight className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

