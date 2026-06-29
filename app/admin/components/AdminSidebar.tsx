"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Shield,
  Send,
  LogOut,
  Settings,
  Wrench,
  LifeBuoy,
} from "lucide-react";
import { logoutAdmin } from "../../lib/admin-auth";
import { admin } from "./admin-theme";

const navSections = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Articles", href: "/admin/articles", icon: FileText },
      { name: "Tools", href: "/admin/tools", icon: Wrench },
    ],
  },
  {
    label: "Marketing",
    items: [{ name: "Email funnel", href: "/admin/marketing/funnel", icon: Send }],
  },
  {
    label: "Platform",
    items: [
      { name: "Support", href: "/admin/support", icon: LifeBuoy, badgeKey: "support" as const },
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/articles") {
    return pathname === "/admin/articles" || pathname.startsWith("/admin/articles/");
  }
  if (href === "/admin/tools") {
    return pathname === "/admin/tools" || pathname.startsWith("/admin/tools/");
  }
  if (href === "/admin/support") {
    return pathname === "/admin/support" || pathname.startsWith("/admin/support/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar({ initialUnresolvedCount = 0 }: { initialUnresolvedCount?: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const [unresolvedCount, setUnresolvedCount] = useState(initialUnresolvedCount);
  const pathname = usePathname();

  useEffect(() => {
    setUnresolvedCount(initialUnresolvedCount);
  }, [initialUnresolvedCount]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/support/counts", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { unresolved?: number };
        if (!cancelled && typeof data.unresolved === "number") {
          setUnresolvedCount(data.unresolved);
        }
      } catch {
        /* ignore */
      }
    }

    poll();
    const id = window.setInterval(poll, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pathname]);

  return (
    <aside
      className={`flex flex-col h-full ${admin.sidebar} transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      <div className={`flex items-center justify-between p-4 border-b ${admin.sidebarHeader} shrink-0`}>
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className={`font-display font-bold text-sm ${admin.heading}`}>Facts Deck</span>
              <span className={`block text-[10px] uppercase tracking-wider font-semibold ${admin.subtle}`}>
                Admin
              </span>
            </div>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-lg ${admin.subtle} hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className={`px-4 mb-2 text-[10px] font-semibold uppercase tracking-wider ${admin.navSection}`}>
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = isNavActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`relative flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl transition-all ${
                        isActive ? admin.navActive : admin.navItem
                      }`}
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon
                        className={`h-5 w-5 shrink-0 ${isActive ? admin.navIconActive : ""}`}
                      />
                      {!collapsed && <span className="text-sm flex-1">{item.name}</span>}
                      {!collapsed && "badgeKey" in item && item.badgeKey === "support" && unresolvedCount > 0 ? (
                        <span className="ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {unresolvedCount > 99 ? "99+" : unresolvedCount}
                        </span>
                      ) : null}
                      {collapsed && "badgeKey" in item && item.badgeKey === "support" && unresolvedCount > 0 ? (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" aria-label={`${unresolvedCount} unresolved tickets`} />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={`p-3 border-t ${admin.sidebarHeader} shrink-0 space-y-1`}>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className={`flex items-center gap-3 px-4 py-2.5 mx-2 w-full rounded-xl ${admin.navItem} hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-950/40 dark:hover:!text-red-400`}
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-sm">Sign out</span>}
          </button>
        </form>
        <Link
          href="/"
          className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl ${admin.navItem}`}
          title={collapsed ? "Back to site" : undefined}
        >
          <ExternalLink className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="text-sm">Back to site</span>}
        </Link>
        {!collapsed && (
          <p className={`px-4 text-[10px] flex items-center gap-1.5 ${admin.subtle}`}>
            <Shield className="h-3 w-3" />
            Admin access only
          </p>
        )}
      </div>
    </aside>
  );
}
