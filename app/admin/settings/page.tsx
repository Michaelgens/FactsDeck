import Link from "next/link";
import {
  Settings,
  Shield,
  Database,
  Mail,
  Globe,
  BarChart3,
  FileText,
  ExternalLink,
  Wrench,
} from "lucide-react";
import { isSupabaseConfigured } from "../../lib/supabase/server";
import { siteTools, categories } from "../../lib/site-config";
import { AdminPageHeader, AdminPanel } from "../components/admin-ui";
import { admin } from "../components/admin-theme";

function EnvRow({ name, set }: { name: string; set: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 dark:border-zinc-800/80 last:border-0">
      <code className="text-xs text-slate-700 dark:text-zinc-200">{name}</code>
      <span
        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
          set
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
            : "bg-slate-100 text-slate-500 dark:bg-zinc-900 dark:text-zinc-500"
        }`}
      >
        {set ? "Set" : "Missing"}
      </span>
    </li>
  );
}

export default function AdminSettingsPage() {
  const supabaseOk = isSupabaseConfigured();
  const envChecks = {
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
    service: !!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    blob: !!process.env.BLOB_READ_WRITE_TOKEN?.trim(),
    backend: !!process.env.FACTSDECK_BACKEND_URL?.trim(),
    welcome: !!process.env.WELCOME_EMAIL_SECRET?.trim(),
    adminPass: !!process.env.ADMIN_PASSWORD?.trim(),
  };

  return (
    <div>
      <AdminPageHeader
        title="Site settings"
        description="Platform configuration, integrations, and editorial taxonomy. Article-specific options live under Articles."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AdminPanel title="Environment" description="Server-side configuration (.env.local)">
          <ul>
            <EnvRow name="NEXT_PUBLIC_SUPABASE_URL" set={envChecks.url} />
            <EnvRow name="SUPABASE_SERVICE_ROLE_KEY" set={envChecks.service} />
            <EnvRow name="BLOB_READ_WRITE_TOKEN" set={envChecks.blob} />
            <EnvRow name="FACTSDECK_BACKEND_URL" set={envChecks.backend} />
            <EnvRow name="WELCOME_EMAIL_SECRET" set={envChecks.welcome} />
            <EnvRow name="ADMIN_PASSWORD" set={envChecks.adminPass} />
          </ul>
          <p className="mt-4 text-xs text-slate-500 dark:text-zinc-400">
            Supabase overall:{" "}
            <span className={supabaseOk ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
              {supabaseOk ? "Ready" : "Incomplete — articles and subscribers need URL + service key"}
            </span>
          </p>
        </AdminPanel>

        <AdminPanel title="Integrations" description="External services">
          <div className="space-y-4">
            {[
              {
                icon: Database,
                title: "Supabase",
                desc: "Posts, subscribers, and admin CRUD",
                href: "https://supabase.com/dashboard",
              },
              {
                icon: BarChart3,
                title: "Vercel Analytics",
                desc: "Real traffic, referrers, and Web Vitals",
                href: "https://vercel.com/dashboard",
              },
              {
                icon: Mail,
                title: "Welcome email API",
                desc: "Footer signup → backend welcome-email route",
                href: "/admin/users",
                internal: true,
              },
            ].map(({ icon: Icon, title, desc, href, internal }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-purple-600 dark:text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">{title}</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{desc}</p>
                </div>
                {internal ? (
                  <Link href={href} className="text-xs font-semibold text-purple-600 dark:text-violet-400 shrink-0">
                    Manage →
                  </Link>
                ) : (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-purple-600 shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminPanel
          title="Editorial taxonomy"
          description={`${categories.length} categories from site-config — used on Home filters and article editor`}
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c.name}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200"
              >
                {c.name}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500 dark:text-zinc-400">
            To add categories site-wide, edit <code className="text-[10px]">app/lib/site-config.ts</code>. Article
            routes handle per-post categories and placement flags.
          </p>
        </AdminPanel>

        <AdminPanel title="Tools directory" description={`${siteTools.length} calculators on /tools`}>
          <ul className="max-h-48 overflow-y-auto space-y-2">
            {siteTools.slice(0, 8).map((t) => (
              <li key={t.slug} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-zinc-200 truncate">{t.name}</span>
                <Link href={`/tools/${t.slug}`} className="text-xs text-purple-600 dark:text-violet-400 shrink-0 ml-2">
                  View
                </Link>
              </li>
            ))}
          </ul>
          {siteTools.length > 8 ? (
            <p className="mt-2 text-xs text-slate-500">+{siteTools.length - 8} more tools</p>
          ) : null}
        </AdminPanel>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/admin/articles", icon: FileText, label: "Manage articles" },
          { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
          { href: "/", icon: Globe, label: "Public site", external: true },
        ].map(({ href, icon: Icon, label, external }) =>
          external ? (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-purple-300 transition-colors"
            >
              <Icon className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-sm text-slate-900 dark:text-zinc-100">{label}</span>
            </a>
          ) : (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-purple-300 transition-colors"
            >
              <Icon className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-sm text-slate-900 dark:text-zinc-100">{label}</span>
            </Link>
          )
        )}
        <Link
          href="/admin/articles/placements"
          className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-purple-300 transition-colors"
        >
          <Wrench className="h-5 w-5 text-purple-600" />
          <span className="font-semibold text-sm text-slate-900 dark:text-zinc-100">Placement guide</span>
        </Link>
      </div>

      <div className={`mt-6 rounded-2xl ${admin.card} p-6`}>
        <div className="flex items-center gap-3 mb-3">
          <Shield className="h-5 w-5 text-purple-600 dark:text-violet-400" />
          <h2 className="font-display font-bold text-slate-900 dark:text-zinc-100">Security note</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
          Never expose <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> to the client. Admin routes are
          protected by session cookie after <code className="text-xs">ADMIN_PASSWORD</code> login. Rotate keys in
          Supabase if compromised.
        </p>
      </div>
    </div>
  );
}
