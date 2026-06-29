"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Search,
  Star,
} from "lucide-react";
import type { ToolDirectoryRow } from "../../lib/tools-directory";
import { admin } from "../components/admin-theme";

export type ToolMetricsSummary = {
  instrumented: boolean;
  pageViews: number;
  journeyCompletes: number;
  dashboardOpens: number;
  totalEvents: number;
  lastEventAt: string | null;
};

type SortKey = "displayOrder" | "name" | "groupLabel" | "users" | "pageViews";

function SortButton({
  label,
  active,
  asc,
  onClick,
}: {
  label: string;
  active: boolean;
  asc: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 font-semibold transition-colors ${
        active ? "text-purple-700 dark:text-violet-300" : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
      }`}
    >
      {label}
      {active ? (
        asc ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
      )}
    </button>
  );
}

export default function AdminToolsTable({
  rows,
  metricsBySlug = {},
}: {
  rows: ToolDirectoryRow[];
  metricsBySlug?: Record<string, ToolMetricsSummary>;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("displayOrder");
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState<string>("all");

  const groupOptions = useMemo(() => {
    const labels = new Set<string>();
    for (const row of rows) {
      if (row.groupLabel) labels.add(row.groupLabel);
    }
    return [...labels].sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (groupFilter !== "all" && row.groupLabel !== groupFilter) return false;
      if (!q) return true;
      const hay = [
        row.name,
        row.slug,
        row.tagline,
        row.description,
        row.iconKey,
        row.groupLabel ?? "",
        ...row.searchTerms,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query, groupFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let av: string | number = 0;
      let bv: string | number = 0;
      switch (sortKey) {
        case "displayOrder":
          av = a.displayOrder;
          bv = b.displayOrder;
          break;
        case "name":
          av = a.name.toLowerCase();
          bv = b.name.toLowerCase();
          break;
        case "groupLabel":
          av = (a.groupLabel ?? "zzz").toLowerCase();
          bv = (b.groupLabel ?? "zzz").toLowerCase();
          break;
        case "users":
          av = a.users;
          bv = b.users;
          break;
        case "pageViews":
          av = metricsBySlug[a.slug]?.pageViews ?? -1;
          bv = metricsBySlug[b.slug]?.pageViews ?? -1;
          break;
      }
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [filtered, sortKey, sortAsc, metricsBySlug]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "displayOrder" || key === "name");
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-0">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${admin.subtle}`} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, slug, tagline, terms…"
            className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm ${admin.input} ${admin.focus}`}
          />
        </div>
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className={`rounded-xl px-3 py-2.5 text-sm ${admin.input} ${admin.focus}`}
        >
          <option value="all">All groups</option>
          {groupOptions.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className={`border-b ${admin.divide} text-left`}>
              <th className="py-2 px-3 w-10" />
              <th className="py-2 px-3">
                <SortButton
                  label="Order"
                  active={sortKey === "displayOrder"}
                  asc={sortAsc}
                  onClick={() => toggleSort("displayOrder")}
                />
              </th>
              <th className="py-2 px-3">
                <SortButton
                  label="Tool"
                  active={sortKey === "name"}
                  asc={sortAsc}
                  onClick={() => toggleSort("name")}
                />
              </th>
              <th className="py-2 px-3">
                <SortButton
                  label="Group"
                  active={sortKey === "groupLabel"}
                  asc={sortAsc}
                  onClick={() => toggleSort("groupLabel")}
                />
              </th>
              <th className="py-2 px-3 hidden lg:table-cell">Entry component</th>
              <th className="py-2 px-3">
                <SortButton
                  label="Sessions"
                  active={sortKey === "users"}
                  asc={sortAsc}
                  onClick={() => toggleSort("users")}
                />
              </th>
              <th className="py-2 px-3">
                <SortButton
                  label="Performance"
                  active={sortKey === "pageViews"}
                  asc={sortAsc}
                  onClick={() => toggleSort("pageViews")}
                />
              </th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3 text-right">Open</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const expanded = expandedSlug === row.slug;
              const healthy = row.hasSeo && row.hasEntry;
              const perf = metricsBySlug[row.slug];
              return (
                <Fragment key={row.slug}>
                  <tr className={`border-b ${admin.divideSubtle} ${admin.tableRowHover}`}>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => setExpandedSlug(expanded ? null : row.slug)}
                        className={`p-1 rounded-lg ${admin.subtle} hover:bg-slate-100 dark:hover:bg-zinc-800`}
                        aria-label={expanded ? "Collapse details" : "Expand details"}
                      >
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs tabular-nums text-slate-700 dark:text-zinc-300">
                      {row.displayOrder}
                    </td>
                    <td className="py-3 px-3 min-w-[180px]">
                      <div className="flex items-start gap-2">
                        {row.isSpotlight ? (
                          <Star
                            className="h-4 w-4 shrink-0 text-amber-500 mt-0.5"
                            aria-label="Featured spotlight"
                          />
                        ) : null}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-zinc-100">{row.name}</p>
                          <p className="text-xs text-slate-500 dark:text-zinc-500 font-mono truncate">
                            {row.slug}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 line-clamp-1">
                            {row.tagline}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-zinc-400 max-w-[140px]">
                      {row.groupLabel ?? (
                        <span className="text-amber-700 dark:text-amber-400 text-xs font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3 hidden lg:table-cell">
                      {row.entryFile ? (
                        <code className={admin.code}>{row.entryFile}</code>
                      ) : (
                        <span className="text-xs text-red-600 dark:text-red-400">Missing</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs tabular-nums text-slate-700 dark:text-zinc-300">
                      {row.users}
                    </td>
                    <td className="py-3 px-3 min-w-[120px]">
                      {perf?.instrumented ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" title="Instrumented" />
                            <span className="text-xs font-semibold tabular-nums text-slate-800 dark:text-zinc-200">
                              {perf.pageViews.toLocaleString()} views
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-500 tabular-nums pl-3">
                            {perf.journeyCompletes} completes · {perf.dashboardOpens} workspace
                          </p>
                          {perf.totalEvents > 0 ? (
                            <Link
                              href={`/admin/tools/metrics?tool=${row.slug}`}
                              className={`text-[10px] font-semibold pl-3 ${admin.link}`}
                            >
                              {perf.totalEvents} events →
                            </Link>
                          ) : (
                            <span className="text-[10px] text-slate-400 dark:text-zinc-600 pl-3">No events yet</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-zinc-500">Not instrumented</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1.5">
                        <span
                          className={`inline-flex w-fit text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            healthy
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}
                        >
                          {healthy ? "Ready" : "Incomplete"}
                        </span>
                        {perf?.instrumented ? (
                          <span className="inline-flex w-fit items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Instrumented
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <Link
                          href={`/admin/tools/metrics?tool=${row.slug}`}
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${admin.link}`}
                        >
                          Metrics
                        </Link>
                        <Link
                          href={row.publicPath}
                          target="_blank"
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${admin.link}`}
                        >
                          Live
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  {expanded ? (
                    <tr className={`border-b ${admin.divideSubtle}`}>
                      <td colSpan={9} className="px-3 py-4 bg-slate-50/80 dark:bg-zinc-800/40">
                        <div className="grid gap-4 md:grid-cols-2 pl-8">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-1">
                              Description
                            </p>
                            <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                              {row.description}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-1">
                              Search terms
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {row.searchTerms.map((term) => (
                                <span key={term} className={`text-xs px-2 py-0.5 rounded-md ${admin.pill}`}>
                                  {term}
                                </span>
                              ))}
                            </div>
                            <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <dt className={admin.subtle}>Icon key</dt>
                                <dd className="font-mono text-slate-800 dark:text-zinc-200">{row.iconKey}</dd>
                              </div>
                              <div>
                                <dt className={admin.subtle}>SEO pack</dt>
                                <dd className={row.hasSeo ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                                  {row.hasSeo ? "Configured" : "Missing"}
                                </dd>
                              </div>
                              <div>
                                <dt className={admin.subtle}>Spotlight image</dt>
                                <dd className={row.hasSpotlightImage ? "text-emerald-700 dark:text-emerald-400" : admin.subtle}>
                                  {row.hasSpotlightImage ? "Set" : "Fallback"}
                                </dd>
                              </div>
                              <div>
                                <dt className={admin.subtle}>Analytics</dt>
                                <dd className="text-slate-800 dark:text-zinc-200">
                                  {perf?.instrumented ? (
                                    <Link href={`/admin/tools/metrics?tool=${row.slug}`} className={admin.link}>
                                      View performance →
                                    </Link>
                                  ) : (
                                    <span className="text-slate-500 dark:text-zinc-500">Not wired</span>
                                  )}
                                </dd>
                              </div>
                              {perf?.instrumented && perf.lastEventAt ? (
                                <div>
                                  <dt className={admin.subtle}>Last event</dt>
                                  <dd className="text-slate-800 dark:text-zinc-200">
                                    {new Date(perf.lastEventAt).toLocaleString()}
                                  </dd>
                                </div>
                              ) : null}
                              <div>
                                <dt className={admin.subtle}>Public URL</dt>
                                <dd>
                                  <Link href={row.publicPath} target="_blank" className={admin.link}>
                                    {row.publicPath}
                                  </Link>
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className={`mt-3 text-xs ${admin.subtle}`}>
        Showing {sorted.length} of {rows.length} tools
      </p>
    </div>
  );
}
