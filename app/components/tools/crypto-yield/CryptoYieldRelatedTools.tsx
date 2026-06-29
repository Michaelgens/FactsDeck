"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { RelatedTool } from "./compute-crypto-yield-metrics";

export default function CryptoYieldRelatedTools({ tools }: { tools: RelatedTool[] }) {
  if (tools.length === 0) return null;

  return (
    <div className="rounded-3xl border border-amber-800/50 bg-amber-950/60 p-6">
      <p className="text-sm font-bold text-amber-100">Related Facts Deck tools</p>
      <p className="mt-1 text-xs text-amber-300/70">Based on your goal, APY, and horizon.</p>
      <ul className="mt-4 space-y-2">
        {tools.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/tools/${t.slug}`}
              className="group flex items-start justify-between gap-3 rounded-2xl border border-amber-800/40 bg-amber-950/40 px-4 py-3 transition-colors hover:border-amber-600/50 hover:bg-amber-950/70"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-amber-50">{t.name}</p>
                <p className="text-xs text-amber-200/65 mt-0.5">{t.reason}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-amber-400 group-hover:text-amber-100 mt-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
