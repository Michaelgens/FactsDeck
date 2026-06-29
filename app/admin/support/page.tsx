import { requireAdmin } from "../../lib/admin-auth";
import { loadAdminSupportPageData } from "../../lib/admin-support-page-data";
import AdminSupportExperience from "./AdminSupportExperience";

export const metadata = {
  title: "Support desk | Facts Deck Admin",
  description: "Manage contact form tickets and email replies",
};

export default async function AdminSupportPage() {
  await requireAdmin();
  const initialData = await loadAdminSupportPageData();

  return <AdminSupportExperience initialData={initialData} />;
}
