"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, LayoutGrid, Plus } from "lucide-react";
import { admin } from "./admin-theme";

const links = [
  {
    href: "/admin/articles",
    label: "All articles",
    icon: FileText,
    match: (p: string) =>
      p === "/admin/articles" ||
      (p.startsWith("/admin/articles/") &&
        !p.startsWith("/admin/articles/placements") &&
        !p.startsWith("/admin/articles/content") &&
        p !== "/admin/articles/new"),
  },
  {
    href: "/admin/articles/placements",
    label: "Placements",
    icon: LayoutGrid,
    match: (p: string) => p.startsWith("/admin/articles/placements"),
  },
  {
    href: "/admin/articles/content",
    label: "Content metrics",
    icon: BarChart3,
    match: (p: string) => p.startsWith("/admin/articles/content"),
  },
  { href: "/admin/articles/new", label: "New", icon: Plus, match: (p: string) => p === "/admin/articles/new" },
];

export default function ArticlesSubnav() {
  const pathname = usePathname();

  return (
    <nav className={`flex flex-wrap gap-1 p-1 rounded-xl ${admin.inset} border ${admin.divide} mb-6`}>
      {links.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              active
                ? `bg-white dark:bg-zinc-950 ${admin.heading} shadow-sm ring-1 ring-slate-200 dark:ring-zinc-700`
                : `${admin.body} hover:bg-white dark:hover:bg-zinc-950 hover:text-slate-900 dark:hover:text-zinc-100`
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
