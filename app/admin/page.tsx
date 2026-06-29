import { getDashboardInsights } from "../lib/admin-insights";
import { isSupabaseConfigured } from "../lib/supabase/server";
import AdminDashboardExperience from "./AdminDashboardExperience";

export default async function AdminDashboardPage() {
  const data = await getDashboardInsights();

  return (
    <AdminDashboardExperience initialData={data} supabaseConfigured={isSupabaseConfigured()} />
  );
}
