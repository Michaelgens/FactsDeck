"use client";

import { usePathname } from "next/navigation";
import { admin } from "./components/admin-theme";

export default function AdminLayoutClient({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return (
      <div className={`w-full min-h-0 ${admin.shell} transition-colors duration-200`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`flex w-full min-h-0 ${admin.shell} transition-colors duration-200`}>
      <div
        className={`hidden md:flex shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-hidden rounded-r-2xl border border-l ${admin.sidebar} shadow-sm dark:shadow-black/20 transition-colors duration-200`}
      >
        {sidebar}
      </div>
      <div
        className={`flex-1 min-w-0 p-4 sm:p-6 lg:p-8 ${admin.main} text-slate-900 dark:text-zinc-100 transition-colors duration-200`}
      >
        {children}
      </div>
    </div>
  );
}
