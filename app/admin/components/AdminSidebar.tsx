"use client";

import { useState } from "react";
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
    items: [{ name: "Articles", href: "/admin/articles", icon: FileText }],
  },
  {
    label: "Marketing",
    items: [{ name: "Funnel", href: "/admin/marketing/funnel", icon: Send }],
  },
  {
    label: "Platform",
    items: [
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
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

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
                      className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl transition-all ${
                        isActive ? admin.navActive : admin.navItem
                      }`}
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon
                        className={`h-5 w-5 shrink-0 ${isActive ? admin.navIconActive : ""}`}
                      />
                      {!collapsed && <span className="text-sm">{item.name}</span>}
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
