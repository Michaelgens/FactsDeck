import { Suspense } from "react";
import {
  loadEmailFunnelPageData,
  parseEmailFunnelSearchParams,
} from "@/app/lib/email-funnel-page-data";
import EmailFunnelExperience from "./EmailFunnelExperience";

type SearchParams = Promise<{
  tab?: string;
  page?: string;
  limit?: string;
  q?: string;
  promoPage?: string;
  promoLimit?: string;
  promoQ?: string;
  briefPage?: string;
  briefLimit?: string;
  briefQ?: string;
}>;

function FunnelLoadingFallback() {
  return <p className="text-sm text-slate-500 dark:text-zinc-400">Loading funnel…</p>;
}

export default async function AdminMarketingFunnelPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const params = parseEmailFunnelSearchParams(raw);
  const data = await loadEmailFunnelPageData(params);

  return (
    <Suspense fallback={<FunnelLoadingFallback />}>
      <EmailFunnelExperience initialData={data} initialTab={params.tab} />
    </Suspense>
  );
}
