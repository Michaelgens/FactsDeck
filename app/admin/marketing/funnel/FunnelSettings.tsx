"use client";

import { useState } from "react";
import { Mail, Send, FileText, ToggleLeft } from "lucide-react";

export default function FunnelSettings() {
  const [notifyOnNewPost, setNotifyOnNewPost] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white dark:bg-dark-800/50 border border-slate-200 dark:border-purple-500/30 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-purple-500/20">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-dark-100 flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            New Post Notification
          </h2>
          <p className="text-sm text-slate-600 dark:text-purple-300 mt-1">
            When enabled, all subscribers will receive an email when you publish a new article.
          </p>
        </div>
        <div className="p-6">
          <label className="flex items-center justify-between gap-4 cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <ToggleLeft className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-dark-100">
                  Email subscribers on new post
                </p>
                <p className="text-sm text-slate-500 dark:text-purple-400">
                  Automatically notify all newsletter subscribers
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifyOnNewPost}
              onClick={() => setNotifyOnNewPost(!notifyOnNewPost)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                notifyOnNewPost
                  ? "bg-purple-600"
                  : "bg-slate-200 dark:bg-dark-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition ${
                  notifyOnNewPost ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-dark-800/50 border border-slate-200 dark:border-purple-500/30 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-purple-500/20">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-dark-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Recent Posts
          </h2>
          <p className="text-sm text-slate-600 dark:text-purple-300 mt-1">
            Posts that triggered or will trigger subscriber emails.
          </p>
        </div>
        <div className="p-6">
          <div className="rounded-xl border border-slate-200 dark:border-purple-500/20 p-8 text-center">
            <FileText className="h-10 w-10 text-slate-300 dark:text-purple-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-purple-400 text-sm">
              No posts sent yet. Logic will be added later.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-purple-500/30 p-6">
        <div className="flex items-center gap-3 text-slate-500 dark:text-purple-400">
          <Send className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            Send test email and manual broadcast options will be available here once logic is implemented.
          </p>
        </div>
      </div>
    </div>
  );
}
