import { Suspense } from "react";
import { loadAdminUsersPageData } from "../../lib/admin-users-page-data";
import AdminUsersExperience from "./AdminUsersExperience";

function UsersLoadingFallback() {
  return <p className="text-sm text-slate-500 dark:text-zinc-400">Loading subscribers…</p>;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; limit?: string }>;
}) {
  await searchParams;
  const data = await loadAdminUsersPageData();

  return (
    <Suspense fallback={<UsersLoadingFallback />}>
      <AdminUsersExperience initialData={data} />
    </Suspense>
  );
}
