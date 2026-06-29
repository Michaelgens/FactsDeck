"use client";

/** SVG “orbit” progress ring — FI % toward a target number. */

type Props = {
  pct: number;
  label?: string;
  className?: string;
};

export default function FiOrbitRing({ pct, label = "of FI #", className = "" }: Props) {
  const p = Math.min(100, Math.max(0, pct));
  const circumference = 2 * Math.PI * 46;
  const dash = (p / 100) * circumference;
  return (
    <div
      className={`relative mx-auto h-32 w-32 shrink-0 sm:h-36 sm:w-36 ${className}`.trim()}
      aria-label={`${p.toFixed(0)} percent toward financial independence`}
    >
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden preserveAspectRatio="xMidYMid meet">
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
      <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
        <span className="text-xl font-black tabular-nums text-zinc-900 sm:text-2xl dark:text-zinc-50">{p.toFixed(0)}%</span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 sm:text-[10px] dark:text-zinc-400">{label}</span>
      </div>
    </div>
  );
}
