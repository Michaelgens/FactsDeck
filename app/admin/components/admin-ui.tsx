import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { admin } from "./admin-theme";

export function AdminPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
      <div>
        <h1 className={`font-display text-2xl md:text-3xl font-bold ${admin.heading}`}>{title}</h1>
        {description ? <p className={`${admin.body} mt-1 max-w-2xl`}>{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2 shrink-0">{children}</div> : null}
    </div>
  );
}

export function AdminAlert({
  title,
  children,
  variant = "warning",
}: {
  title: string;
  children: React.ReactNode;
  variant?: "warning" | "error" | "info";
}) {
  const styles = {
    warning:
      "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-100",
    error:
      "border-red-200 bg-red-50 text-red-950 dark:border-red-800/60 dark:bg-red-950/50 dark:text-red-100",
    info: "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-100",
  };
  return (
    <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${styles[variant]}`} role="alert">
      <p className="font-semibold">{title}</p>
      <div className="mt-1 opacity-90">{children}</div>
    </div>
  );
}

export function KpiCard({
  name,
  value,
  sub,
  icon: Icon,
  href,
  gradient = "from-purple-500 to-purple-600",
  trend,
}: {
  name: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  href?: string;
  gradient?: string;
  trend?: { label: string; positive?: boolean };
}) {
  const inner = (
    <>
      <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${gradient} opacity-10 dark:opacity-20 rounded-bl-full`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-sm font-medium ${admin.subtle}`}>{name}</p>
          <p className={`mt-2 text-2xl md:text-3xl font-bold tracking-tight ${admin.heading}`}>{value}</p>
          {sub ? <p className={`mt-1 text-xs ${admin.subtle}`}>{sub}</p> : null}
          {trend ? (
            <p
              className={`mt-2 text-xs font-semibold ${
                trend.positive === false
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {trend.label}
            </p>
          ) : null}
        </div>
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {href ? (
        <ArrowUpRight className={`absolute bottom-4 right-4 h-4 w-4 text-slate-300 dark:text-zinc-600 group-hover:text-purple-500 dark:group-hover:text-violet-400 transition-colors`} />
      ) : null}
    </>
  );

  const className = `group relative overflow-hidden rounded-2xl ${admin.card} p-6 ${admin.cardHover} transition-all block`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}

export function AdminPanel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl ${admin.card} overflow-hidden ${className}`}>
      <div className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b ${admin.cardHeader}`}>
        <div>
          <h2 className={`font-display font-bold text-lg ${admin.heading}`}>{title}</h2>
          {description ? <p className={`text-sm ${admin.subtle} mt-0.5`}>{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export function PlacementPill({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
        <span className={`text-sm font-medium ${admin.label} truncate`}>{label}</span>
      </div>
      <span className={`text-sm font-bold tabular-nums ${admin.heading}`}>{count}</span>
    </div>
  );
}

export function RankedListRow({
  rank,
  title,
  meta,
  href,
  value,
}: {
  rank: number;
  title: string;
  meta?: string;
  href?: string;
  value: string;
}) {
  const titleEl = href ? (
    <Link href={href} className={`font-medium truncate block ${admin.link}`}>
      {title}
    </Link>
  ) : (
    <p className={`font-medium truncate ${admin.heading}`}>{title}</p>
  );

  return (
    <li className={`flex items-center gap-3 py-3 border-b ${admin.divideSubtle} last:border-0`}>
      <span className={`w-7 h-7 rounded-lg ${admin.inset} flex items-center justify-center text-xs font-bold ${admin.label} shrink-0`}>
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        {titleEl}
        {meta ? <p className={`text-xs ${admin.subtle} mt-0.5`}>{meta}</p> : null}
      </div>
      <span className={`text-sm font-bold tabular-nums shrink-0 ${admin.heading}`}>{value}</span>
    </li>
  );
}
