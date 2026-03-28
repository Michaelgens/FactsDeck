import AdminSidebar from "./components/AdminSidebar";
import AdminLayoutClient from "./AdminLayoutClient";

export const metadata = {
  title: "Admin | Facts Deck",
  description: "Facts Deck admin dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayoutClient sidebar={<AdminSidebar />}>
      {children}
    </AdminLayoutClient>
  );
}
