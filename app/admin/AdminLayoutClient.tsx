"use client";

import { usePathname } from "next/navigation";

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
      <div className="w-full min-h-0 bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:to-dark-900 transition-colors duration-300">
        {children}
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-0 bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:to-dark-900 transition-colors duration-300">
      <div className="hidden md:flex shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-hidden rounded-r-2xl border border-l border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 shadow-lg dark:shadow-purple-900/10 transition-colors duration-300">
        {sidebar}
      </div>
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-white dark:bg-transparent transition-colors duration-300">
        {children}
      </div>
    </div>
  );
}
