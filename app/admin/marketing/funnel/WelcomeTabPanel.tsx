"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { EmailTypeMetrics, WelcomeSendsPage } from "@/app/lib/email-funnel-types";
import { admin } from "../../components/admin-theme";
import { AdminPanel } from "../../components/admin-ui";
import AdminPagination from "../../components/AdminPagination";
import EmailTestLab from "./EmailTestLab";
import { MetricsGrid, RecentSendsTable, TypePanelHeader } from "./funnel-shared";

type Props = {
  metrics: EmailTypeMetrics;
  welcomeSends: WelcomeSendsPage;
};

export default function WelcomeTabPanel({ metrics, welcomeSends }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "welcome");
    params.set("page", "1");
    if (query.trim()) params.set("q", query.trim());
    else params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <TypePanelHeader metrics={metrics} />
      <MetricsGrid metrics={metrics} />

      <EmailTestLab emailType="welcome" accent="violet" />

      <AdminPanel title="Welcome recipients" description="Everyone who received a welcome email in the last 30 days">
        <form onSubmit={applySearch} className={`flex flex-col sm:flex-row gap-3 mb-4 pb-4 border-b ${admin.divide}`}>
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${admin.subtle}`} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by email…"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm ${admin.input}`}
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-purple-600 dark:bg-violet-600 text-white text-sm font-semibold hover:opacity-90"
          >
            Search
          </button>
        </form>

        <RecentSendsTable sends={welcomeSends.rows} emptyMessage="No welcome sends match your filters." />

        <AdminPagination
          totalCount={welcomeSends.total}
          currentPage={welcomeSends.page}
          limit={welcomeSends.limit}
          itemLabel="recipients"
          pinnedParams={{ tab: "welcome" }}
        />
      </AdminPanel>
    </div>
  );
}
