"use client";

/** SVG “orbit” progress ring — FI % toward a target number. */

export default function FiOrbitRing({ pct, label = "of FI #" }: { pct: number; label?: string }) {
  const p = Math.min(100, Math.max(0, pct));
  const circumference = 2 * Math.PI * 46;
  const dash = (p / 100) * circumference;
  return (
    <div className="relative mx-auto h-36 w-36" data-tour="fi-orbit">
      <svg className="-rotate-90" viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r="46" fill="none" className="stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          className="stroke-zinc-600 dark:stroke-zinc-400"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black tabular-nums text-zinc-900 dark:text-zinc-50">{p.toFixed(0)}%</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</span>
      </div>
    </div>
  );
}
