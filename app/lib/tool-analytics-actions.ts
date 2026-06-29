"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import {
  bumpToolAnalytics,
  parseToolAnalytics,
  type ToolEventType,
} from "./tool-analytics-types";

export async function recordToolEvent(
  toolSlug: string,
  event: ToolEventType,
  meta?: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  if (!toolSlug || !/^[a-z0-9-]+$/.test(toolSlug)) {
    return { ok: false, error: "Invalid tool slug" };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const supabase = createServerClient();
  const { data: row, error: fetchError } = await supabase
    .from("tool_analytics")
    .select("analytics")
    .eq("tool_slug", toolSlug)
    .maybeSingle();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("[recordToolEvent] fetch", fetchError.message);
    return { ok: false, error: fetchError.message };
  }

  const current = parseToolAnalytics(row?.analytics, toolSlug);
  const updated = bumpToolAnalytics(current, event, meta);

  const { error: upsertError } = await supabase.from("tool_analytics").upsert(
    {
      tool_slug: toolSlug,
      analytics: updated,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "tool_slug" }
  );

  if (upsertError) {
    console.error("[recordToolEvent] upsert", upsertError.message);
    return { ok: false, error: upsertError.message };
  }

  revalidatePath("/admin/tools/metrics");
  return { ok: true };
}
