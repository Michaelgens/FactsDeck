"use client";

import { useState } from "react";
import { Copy, Check, MoreHorizontal } from "lucide-react";
import { formatPublishDate } from "../../lib/format-date";
import type { Subscriber } from "../../lib/subscriber-actions";

export default function AdminUsersTable({
  subscribers,
}: {
  subscribers: Subscriber[];
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyEmail = async (email: string, id: string) => {
    await navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-purple-500/20 bg-slate-50 dark:bg-dark-900/50">
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-purple-400">
              Email
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-purple-400">
              Subscribed
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-purple-400 w-32">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((sub) => (
            <tr
              key={sub.id}
              className="border-b border-slate-100 dark:border-purple-500/10 hover:bg-slate-50 dark:hover:bg-purple-900/10 transition-colors"
            >
              <td className="py-4 px-4">
                <span className="font-medium text-slate-900 dark:text-dark-100">
                  {sub.email}
                </span>
              </td>
              <td className="py-4 px-4 text-sm text-slate-500 dark:text-purple-400">
                {formatPublishDate(sub.createdAt)}
              </td>
              <td className="py-4 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => copyEmail(sub.email, sub.id)}
                    className="p-2 rounded-lg text-slate-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    title="Copy email"
                  >
                    {copiedId === sub.id ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-lg text-slate-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    title="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
