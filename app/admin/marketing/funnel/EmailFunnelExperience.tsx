"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { EmailFunnelPageData, EmailFunnelTabId } from "@/app/lib/email-funnel-page-data";
import { AdminAlert, AdminPageHeader } from "../../components/admin-ui";
import { AdminRefreshButton, AdminRefreshShell, adminSyncLabel } from "../../components/admin-refresh-ui";
import FunnelDashboard from "./FunnelDashboard";

export default function EmailFunnelExperience({
  initialData,
  initialTab,
}: {
  initialData: EmailFunnelPageData;
  initialTab: EmailFunnelTabId;
}) {
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const queryString = searchParams.toString();

  useEffect(() => {
    setData(initialData);
  }, [initialData, queryString]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!justSynced) return;
    const id = window.setTimeout(() => setJustSynced(false), 2400);
    return () => window.clearTimeout(id);
  }, [justSynced]);

  const refresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setRefreshError(null);
    setJustSynced(false);

    try {
      const qs = searchParams.toString();
      const url = qs ? `/api/admin/marketing/funnel?${qs}` : "/api/admin/marketing/funnel";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(res.status === 401 ? "Session expired — sign in again." : "Could not refresh funnel data.");
      }
      const next = (await res.json()) as EmailFunnelPageData;
      setData(next);
      setLastSyncedAt(new Date());
      setJustSynced(true);
    } catch (e) {
      setRefreshError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, searchParams]);

  return (
    <div>
      {refreshError ? (
        <AdminAlert title="Refresh failed" variant="error">
          {refreshError}
        </AdminAlert>
      ) : null}

      <AdminPageHeader
        title="Email funnel"
        description="Performance analytics, welcome recipients, and promotional campaign management."
      >
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <AdminRefreshButton
            isRefreshing={isRefreshing}
            justSynced={justSynced}
            onRefresh={refresh}
            syncedLabel="Funnel updated"
          />
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 sm:text-right">
            {adminSyncLabel(lastSyncedAt)}
          </p>
        </div>
      </AdminPageHeader>

      <AdminRefreshShell
        isRefreshing={isRefreshing}
        loadingTitle="Refreshing email funnel"
        loadingDescription="Overview metrics, tab data, and subscriber lists for current filters"
      >
        <FunnelDashboard
          insights={data.insights}
          welcomeSends={data.welcomeSends}
          subscribersPage={data.subscribersPage}
          totalAllSubscribers={data.totalAllSubscribers}
          promotionCampaigns={data.promotionCampaigns}
          briefPostPicks={data.briefPostPicks}
          briefSubscribersPage={data.briefSubscribersPage}
          weeklyBriefEditions={data.weeklyBriefEditions}
          initialTab={initialTab}
        />
      </AdminRefreshShell>
    </div>
  );
}
