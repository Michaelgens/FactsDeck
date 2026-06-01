/**
 * Admin UI tokens. Dark mode uses neutral zinc — not the site `dark-*` scale in globals.css
 * (those are purple brand colors; `dark-800` is literally #4c2fd4).
 */
export const admin = {
  shell: "bg-zinc-50 dark:bg-zinc-950",
  main: "bg-white dark:bg-zinc-950",
  sidebar:
    "bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800",
  sidebarHeader: "border-slate-200 dark:border-zinc-800",
  card: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800",
  cardHover:
    "hover:shadow-lg hover:border-slate-300 dark:hover:border-zinc-700 dark:hover:shadow-zinc-950/50",
  cardHeader: "border-slate-100 dark:border-zinc-800",
  muted: "bg-slate-50 dark:bg-zinc-800/70",
  inset: "bg-slate-100 dark:bg-zinc-800",
  input:
    "bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500",
  heading: "text-slate-900 dark:text-zinc-50",
  body: "text-slate-600 dark:text-zinc-400",
  label: "text-slate-700 dark:text-zinc-300",
  subtle: "text-slate-500 dark:text-zinc-500",
  link: "text-purple-600 dark:text-violet-400 hover:text-purple-700 dark:hover:text-violet-300",
  navSection: "text-slate-400 dark:text-zinc-500",
  navActive:
    "bg-purple-100 dark:bg-violet-500/15 text-purple-700 dark:text-violet-200 font-semibold",
  navItem:
    "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100",
  navIconActive: "text-purple-600 dark:text-violet-400",
  tableHead: "bg-slate-50 dark:bg-zinc-800/90 border-slate-200 dark:border-zinc-800",
  tableRowHover: "hover:bg-slate-50 dark:hover:bg-zinc-800/60",
  divide: "border-slate-200 dark:border-zinc-800",
  divideSubtle: "border-slate-100 dark:border-zinc-800/80",
  pill: "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300",
  focus: "focus:ring-2 focus:ring-purple-500 dark:focus:ring-violet-500 focus:border-transparent",
  gradientPanel:
    "border-violet-200/80 dark:border-violet-500/25 bg-gradient-to-br from-violet-50/90 via-white to-fuchsia-50/40 dark:from-violet-950/40 dark:via-zinc-900 dark:to-zinc-900",
  calloutSky:
    "border-sky-200/80 bg-sky-50/90 text-sky-950 dark:border-sky-800/50 dark:bg-sky-950/35 dark:text-sky-100",
  calloutViolet:
    "border-violet-200/60 dark:border-violet-500/30 bg-gradient-to-br from-violet-50/80 to-fuchsia-50/50 dark:from-violet-950/50 dark:to-zinc-900",
  iconAccent: "text-purple-600 dark:text-violet-400",
  code: "text-xs bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-zinc-200",
} as const;

/** Combine class names for admin pages */
export function adminCn(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
