import { Settings, Shield } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-dark-100">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-purple-300 mt-1">
          Configure your platform
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl bg-white dark:bg-dark-800/50 border border-slate-200 dark:border-purple-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-dark-100">
              General
            </h2>
          </div>
          <p className="text-slate-600 dark:text-purple-300 text-sm">
            Site configuration. Supabase URL and keys are set via environment variables (.env).
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-dark-800/50 border border-slate-200 dark:border-purple-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-dark-100">
              Security
            </h2>
          </div>
          <p className="text-slate-600 dark:text-purple-300 text-sm">
            Supabase service role key and anon key for authentication and API access.
          </p>
        </div>
      </div>
    </div>
  );
}
