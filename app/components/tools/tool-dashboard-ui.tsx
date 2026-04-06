/**
 * Shared visual language for Advanced* tool dashboards — consistent page shell, hero, and chrome.
 */

export const tdPage =
  "min-h-screen antialiased bg-[linear-gradient(180deg,#f4f4f6_0%,#ffffff_42%,#fafafa_100%)] text-zinc-900 dark:bg-[linear-gradient(180deg,#08080a_0%,#0c0c0f_40%,#09090b_100%)] dark:text-zinc-100";

export const tdHero =
  "relative overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-white via-zinc-50/30 to-zinc-100/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] dark:border-zinc-800/90 dark:from-zinc-950 dark:via-zinc-950/98 dark:to-zinc-900/60 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]";

export const tdHeroInner =
  "relative mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12 lg:px-8 lg:py-14";

export const tdHeroInnerNarrow =
  "relative mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-12 lg:px-8 lg:py-14";

/** Top nav links (Back to Home, guides, All tools) */
export const tdNavLink =
  "inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-900/[0.04] hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-50";

/** Hero title icon tile */
export const tdIconTile =
  "flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-white shadow-lg shadow-zinc-900/15 ring-1 ring-zinc-950/10 dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900 dark:shadow-black/25 dark:ring-white/15 sm:h-14 sm:w-14";

export const tdCardBase =
  "border border-zinc-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-6px_rgba(15,23,42,0.08)] dark:border-zinc-800/90 dark:bg-zinc-950/55 dark:shadow-[0_1px_2px_rgba(0,0,0,0.25),0_12px_40px_-16px_rgba(0,0,0,0.45)]";

/** Primary panel cards (inputs, summaries) */
export const tdPanel = `${tdCardBase} rounded-2xl p-6`;

/** Larger radius panels (sidebars, featured blocks) */
export const tdPanelLg = `${tdCardBase} rounded-3xl p-6`;

/** Compact stat / KPI tiles in hero rows */
export const tdStatCard = `${tdCardBase} rounded-2xl p-5`;

/** Secondary / outline actions (walk-through, copy JSON, etc.) */
export const tdGhostBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md dark:border-zinc-700/90 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/70";

/** “Pro tool” / product pill */
export const tdProductPill =
  "inline-flex items-center gap-2 rounded-full border border-zinc-200/90 bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-700 shadow-sm backdrop-blur-sm dark:border-zinc-700/80 dark:bg-zinc-900/70 dark:text-zinc-200";

export type ToolDashboardHeroAccent = "default" | "sky" | "emerald";

export function ToolDashboardHeroBackdrop({
  accent = "default",
}: {
  accent?: ToolDashboardHeroAccent;
}) {
  const centerGlow =
    accent === "sky"
      ? "bg-sky-400/[0.11] dark:bg-sky-500/[0.12]"
      : accent === "emerald"
        ? "bg-emerald-400/[0.1] dark:bg-emerald-500/[0.11]"
        : "bg-zinc-400/[0.12] dark:bg-zinc-500/[0.1]";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-zinc-400/35 to-transparent dark:via-white/[0.14]" />
      <div
        className={`absolute -top-44 left-[8%] h-[26rem] w-[38rem] rounded-full blur-[110px] ${centerGlow}`}
      />
      <div className="absolute -top-36 right-0 h-[20rem] w-[28rem] translate-x-1/4 rounded-full bg-violet-500/[0.07] blur-[96px] dark:bg-violet-400/[0.09]" />
      <div className="absolute -bottom-16 left-1/2 h-40 w-[min(90%,56rem)] -translate-x-1/2 rounded-[100%] bg-gradient-to-t from-zinc-300/20 to-transparent dark:from-zinc-600/15" />
    </div>
  );
}
