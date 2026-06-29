import AdminSidebar from "./components/AdminSidebar";
import AdminLayoutClient from "./AdminLayoutClient";
import { getUnresolvedTicketCount } from "../lib/admin-support-actions";

export const metadata = {
  title: "Admin | Facts Deck",
  description: "Facts Deck admin dashboard",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const unresolvedCount = await getUnresolvedTicketCount();

  return (
    <AdminLayoutClient sidebar={<AdminSidebar initialUnresolvedCount={unresolvedCount} />}>
      {children}
    </AdminLayoutClient>
  );
}
