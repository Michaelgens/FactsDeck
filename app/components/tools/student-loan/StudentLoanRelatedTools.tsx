"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { RelatedTool } from "./compute-student-loan-metrics";

export default function StudentLoanRelatedTools({ tools }: { tools: RelatedTool[] }) {
  if (tools.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Related Facts Deck tools</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Based on your goal, balance, and payment path.</p>
      <ul className="mt-4 space-y-2">
        {tools.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/tools/${t.slug}`}
              className="group flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 transition-colors hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700 dark:hover:bg-slate-900/40"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{t.reason}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 mt-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
