"use client";

import { Check, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffMins < 60) return diffMins <= 1 ? "Just now" : `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function adminSyncLabel(date: Date | null): string {
  if (!date) return "Loaded from server";
  const diffMs = Date.now() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 8) return "Synced just now";
  if (diffSecs < 60) return `Synced ${diffSecs}s ago`;
  return `Synced ${timeAgo(date.toISOString())}`;
}

export function AdminRefreshButton({
  isRefreshing,
  justSynced,
  onRefresh,
  syncedLabel = "Data updated",
}: {
  isRefreshing: boolean;
  justSynced: boolean;
  onRefresh: () => void;
  syncedLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={isRefreshing}
      aria-busy={isRefreshing}
      aria-live="polite"
      className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-wait ${
        justSynced
          ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
          : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/80 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-violet-700 dark:hover:bg-violet-950/30"
      }`}
    >
      {isRefreshing ? (
        <>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-violet-200/40 to-transparent dark:via-violet-500/10 animate-admin-dashboard-shimmer" />
          <span className="pointer-events-none absolute -inset-1 rounded-xl border border-violet-300/60 dark:border-violet-600/40 animate-ping opacity-30" />
        </>
      ) : null}
      {justSynced ? (
        <Check className="relative h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <RefreshCw className={`relative h-4 w-4 ${isRefreshing ? "animate-spin text-violet-600 dark:text-violet-400" : ""}`} />
      )}
      <span className="relative">
        {isRefreshing ? "Syncing live data…" : justSynced ? syncedLabel : "Refresh data"}
      </span>
    </button>
  );
}

export function AdminRefreshShell({
  isRefreshing,
  loadingTitle = "Pulling latest metrics",
  loadingDescription = "Updating charts and totals",
  children,
}: {
  isRefreshing: boolean;
  loadingTitle?: string;
  loadingDescription?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      {isRefreshing ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden rounded-full bg-violet-100 dark:bg-violet-950/50"
          aria-hidden
        >
          <div className="h-full w-1/3 animate-admin-dashboard-slide rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500" />
        </div>
      ) : null}

      {isRefreshing ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-28">
          <div className="flex items-center gap-3 rounded-2xl border border-violet-200/80 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-md dark:border-violet-800/50 dark:bg-zinc-950/90">
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className="absolute h-8 w-8 animate-ping rounded-full bg-violet-400/25" />
              <RefreshCw className="relative h-4 w-4 animate-spin text-violet-600 dark:text-violet-400" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">{loadingTitle}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{loadingDescription}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={`transition-all duration-300 ${
          isRefreshing ? "scale-[0.995] opacity-55 blur-[1px] saturate-75" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
