"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Pencil, Trash2 } from "lucide-react";
import { updatePostFlags, deletePost } from "../../lib/admin-actions";
import type { Post } from "../../lib/types";
import { postPublicPath } from "../../lib/post-url";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return d.toLocaleDateString();
}

const FLAGS = [
  { key: "featured" as const, label: "Featured", color: "purple" },
  { key: "expert_picks" as const, label: "Expert Pick", color: "amber" },
  { key: "trending" as const, label: "Trending", color: "orange" },
  { key: "guides" as const, label: "Popular Guide", color: "emerald" },
] as const;

type FlagKey = (typeof FLAGS)[number]["key"];

function getPostFlagValue(article: Post, key: FlagKey): boolean {
  if (key === "expert_picks") return article.expertPicks;
  if (key === "guides") return article.guides;
  return article[key];
}

export default function AdminArticleRow({ article }: { article: Post }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async (key: FlagKey) => {
    const current = getPostFlagValue(article, key);
    const flags = { [key]: !current };
    await updatePostFlags(article.id, flags);
  };

  const colorClasses: Record<string, string> = {
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  };

  return (
    <li className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-purple-900/10 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
        <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-dark-100 truncate">
          {article.title}
        </p>
        <p className="text-sm text-slate-500 dark:text-purple-400">
          {formatDate(article.publishDate)} · {article.views} views · {article.likes} likes · {article.bookmarks} bookmarks
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5 shrink-0">
        {FLAGS.map(({ key, label, color }) => {
          const isOn = getPostFlagValue(article, key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleToggle(key)}
              title={`Toggle ${label}`}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                isOn
                  ? colorClasses[color]
                  : "bg-slate-100 text-slate-500 dark:bg-dark-800 dark:text-purple-500 hover:bg-slate-200 dark:hover:bg-dark-700"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/admin/articles/${article.id}/edit`}
          className="p-2 rounded-lg text-slate-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <button
          type="button"
          disabled={deleting}
          onClick={async () => {
            if (!confirm("Delete this article? This cannot be undone.")) return;
            setDeleting(true);
            const res = await deletePost(article.id);
            if (res.ok) router.refresh();
            else alert(res.error ?? "Failed to delete");
            setDeleting(false);
          }}
          className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <Link
          href={postPublicPath(article)}
          className="text-sm text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-emerald-400"
        >
          View
        </Link>
      </div>
    </li>
  );
}
