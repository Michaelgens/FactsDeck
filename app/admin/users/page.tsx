import { Users } from "lucide-react";
import { getSubscribers } from "../../lib/subscriber-actions";
import AdminUsersTable from "./AdminUsersTable";
import AdminFilterBar from "../components/AdminFilterBar";
import AdminPagination from "../components/AdminPagination";

const LIMITS = [10, 50, 100] as const;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim().toLowerCase() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const limit = LIMITS.includes(Number(params.limit) as (typeof LIMITS)[number])
    ? Number(params.limit)
    : 10;

  const allSubscribers = await getSubscribers();

  const filtered = q
    ? allSubscribers.filter((s) => s.email.toLowerCase().includes(q))
    : allSubscribers;

  const totalCount = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-dark-100">
          Users
        </h1>
        <p className="text-slate-600 dark:text-purple-300 mt-1">
          Newsletter subscribers from the footer signup
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-dark-800/50 border border-slate-200 dark:border-purple-500/30 overflow-hidden">
        <AdminFilterBar
          action="/admin/users"
          searchName="q"
          searchPlaceholder="Search by email..."
          searchDefault={params.q ?? ""}
          limit={limit}
          hasActiveFilters={!!q}
          clearHref={`/admin/users?limit=${limit}`}
        />

        {paginated.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-slate-300 dark:text-purple-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-purple-300">
              {q ? "No matching subscribers." : "No subscribers yet. Signups from the footer will appear here."}
            </p>
          </div>
        ) : (
          <>
            <AdminUsersTable subscribers={paginated} />
            <AdminPagination
              totalCount={totalCount}
              currentPage={page}
              limit={limit}
              itemLabel="subscribers"
            />
          </>
        )}
      </div>
    </div>
  );
}
