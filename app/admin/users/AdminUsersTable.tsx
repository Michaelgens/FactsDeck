"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Trash2 } from "lucide-react";
import { formatPublishDate } from "../../lib/format-date";
import { deleteSubscriber, type Subscriber } from "../../lib/subscriber-actions";

export default function AdminUsersTable({
  subscribers,
}: {
  subscribers: Subscriber[];
}) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const copyEmail = async (email: string, id: string) => {
    await navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDelete = async (sub: Subscriber) => {
    if (!confirm(`Remove ${sub.email} from the newsletter list?`)) return;
    setDeletingId(sub.id);
    const res = await deleteSubscriber(sub.id);
    if (res.ok) router.refresh();
    else alert(res.error ?? "Failed to delete");
    setDeletingId(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/80">
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Email
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Subscribed
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 w-28">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((sub) => (
            <tr
              key={sub.id}
              className="border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <td className="py-4 px-4">
                <span className="font-medium text-slate-900 dark:text-zinc-100">{sub.email}</span>
              </td>
              <td className="py-4 px-4 text-sm text-slate-500 dark:text-zinc-400">
                {formatPublishDate(sub.createdAt)}
              </td>
              <td className="py-4 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => copyEmail(sub.email, sub.id)}
                    className="p-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
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
                    disabled={deletingId === sub.id}
                    onClick={() => handleDelete(sub)}
                    className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    title="Remove subscriber"
                  >
                    <Trash2 className="h-4 w-4" />
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
