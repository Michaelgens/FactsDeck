"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TOOL_GROUPS } from "../../../lib/tools-directory";
import { INSTRUMENTED_TOOL_SLUGS } from "../../../lib/tool-analytics-types";
import type { ToolMetricsRow } from "../../../lib/tool-insights";
import { admin } from "../../components/admin-theme";
import AdminToolMetricsPanel from "./AdminToolMetricsPanel";
import SelectedToolKpiStrip from "./SelectedToolKpiStrip";

function resolveInitialSlug(tools: ToolMetricsRow[], initialTool: string | undefined): string {
  if (initialTool && tools.some((t) => t.slug === initialTool)) return initialTool;
  return tools[0]?.slug ?? "budget-planner";
}

function readToolFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("tool");
}

export default function PerformanceMetricsExperience({
  tools,
  initialTool,
}: {
  tools: ToolMetricsRow[];
  initialTool?: string;
}) {
  const [selectedSlug, setSelectedSlug] = useState(() => resolveInitialSlug(tools, initialTool));
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (tools.some((t) => t.slug === selectedSlug)) return;
    setSelectedSlug(resolveInitialSlug(tools, readToolFromUrl() ?? initialTool));
  }, [tools, selectedSlug, initialTool]);

  const selectTool = useCallback((slug: string) => {
    setSelectedSlug(slug);
    const url = `/admin/tools/metrics?tool=${encodeURIComponent(slug)}`;
    window.history.replaceState(null, "", url);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const slug = readToolFromUrl();
      if (slug && tools.some((t) => t.slug === slug)) {
        setSelectedSlug(slug);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [tools]);

  const normalizedQuery = query.trim().toLowerCase();

  const groupedTools = useMemo(() => {
    const bySlug = new Map(tools.map((t) => [t.slug, t]));
    const groupedSlugs = new Set(TOOL_GROUPS.flatMap((g) => g.slugs));

    const filterTool = (t: ToolMetricsRow) =>
      !normalizedQuery ||
      t.name.toLowerCase().includes(normalizedQuery) ||
      t.slug.toLowerCase().includes(normalizedQuery);

    const groups = TOOL_GROUPS.map((group) => ({
      id: group.id,
      label: group.label,
      tools: group.slugs.map((slug) => bySlug.get(slug)).filter((t): t is ToolMetricsRow => !!t && filterTool(t)),
    })).filter((g) => g.tools.length > 0);

    const otherTools = tools.filter((t) => !groupedSlugs.has(t.slug) && filterTool(t));
    if (otherTools.length > 0) {
      groups.push({ id: "other", label: "Other", tools: otherTools });
    }

    return groups;
  }, [tools, normalizedQuery]);

  const selectedRow = tools.find((t) => t.slug === selectedSlug) ?? tools[0];
  const visibleCount = groupedTools.reduce((n, g) => n + g.tools.length, 0);

  if (!selectedRow) return null;

  return (
    <div className="space-y-6">
      <section
        className={`rounded-2xl border ${admin.divide} ${admin.card} overflow-hidden`}
        aria-label="Tool picker"
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 dark:border-zinc-800 sm:flex-row sm:items-center">
          <p className="shrink-0 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
            Select tool
          </p>
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools…"
              className={`w-full rounded-xl py-2.5 pl-9 pr-3 text-sm ${admin.input} ${admin.focus}`}
              aria-label="Search tools"
            />
          </div>
          <p className="shrink-0 text-xs text-slate-500 dark:text-zinc-500 sm:text-right">
            {visibleCount} of {tools.length} shown
          </p>
        </div>

        <div className="space-y-4 px-4 py-4">
          {groupedTools.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500 dark:text-zinc-400">No tools match your search.</p>
          ) : (
            groupedTools.map((group) => (
              <div key={group.id}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                  {group.label}
                </p>
                <div
                  className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
                  role="listbox"
                  aria-label={group.label}
                >
                  {group.tools.map((tool) => {
                    const active = tool.slug === selectedSlug;
                    return (
                      <button
                        key={tool.slug}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => selectTool(tool.slug)}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-left text-sm font-semibold transition-colors ${
                          active
                            ? "border-violet-300 bg-violet-50 text-violet-950 shadow-sm dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-100"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
                        }`}
                      >
                        <span className="whitespace-nowrap">{tool.name}</span>
                        {INSTRUMENTED_TOOL_SLUGS.has(tool.slug) ? (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" title="Instrumented" />
                        ) : null}
                        {tool.totalEvents > 0 ? (
                          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                            {tool.totalEvents.toLocaleString()}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className={`min-w-0 rounded-2xl border ${admin.divide} ${admin.card} p-5 sm:p-6 lg:p-8`}>
        <SelectedToolKpiStrip selectedSlug={selectedSlug} row={selectedRow} />
        <AdminToolMetricsPanel tools={tools} selectedSlug={selectedSlug} />
      </div>
    </div>
  );
}
