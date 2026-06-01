"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./admin-auth";
import {
  allocationPlanToSummary,
  computeArticleAllocation,
  getTargetQuotas,
  type AllocationPlan,
} from "./article-allocation";
import { getPublishedPosts } from "./posts";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import type { PostFlagAssignment } from "./article-allocation";

export type AutoAllocatePreview = {
  ok: true;
  dryRun: true;
  summary: string;
  counts: AllocationPlan["counts"];
  quotas: AllocationPlan["quotas"];
  totalPublished: number;
};

export type AutoAllocateResult =
  | AutoAllocatePreview
  | {
      ok: true;
      dryRun: false;
      summary: string;
      counts: AllocationPlan["counts"];
      quotas: AllocationPlan["quotas"];
      totalPublished: number;
      updated: number;
    }
  | { ok: false; error: string };

async function applyAssignments(assignments: Map<string, PostFlagAssignment>): Promise<{
  updated: number;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { updated: 0, error: "Supabase not configured" };
  }
  const supabase = createServerClient();
  let updated = 0;

  const entries = [...assignments.entries()];
  const BATCH = 12;
  for (let i = 0; i < entries.length; i += BATCH) {
    const batch = entries.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(([id, flags]) =>
        supabase
          .from("posts")
          .update({
            featured: flags.featured,
            expert_picks: flags.expert_picks,
            trending: flags.trending,
            guides: flags.guides,
          })
          .eq("id", id)
      )
    );
    for (const { error } of results) {
      if (error) return { updated, error: error.message };
      updated++;
    }
  }
  return { updated };
}

/** Clear editorial flags on hidden drafts so they never compete in partition logic. */
async function clearFlagsOnDrafts(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = createServerClient();
  await supabase
    .from("posts")
    .update({
      featured: false,
      expert_picks: false,
      trending: false,
      guides: false,
    })
    .eq("published", false);
}

function revalidateAfterAllocation() {
  revalidatePath("/admin/articles");
  revalidatePath("/admin/articles/placements");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/post");
}

export async function previewArticleAllocation(): Promise<AutoAllocateResult> {
  await requireAdmin();
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };

  const published = await getPublishedPosts();
  const plan = computeArticleAllocation(published);

  return {
    ok: true,
    dryRun: true,
    summary: allocationPlanToSummary(plan),
    counts: plan.counts,
    quotas: plan.quotas,
    totalPublished: plan.totalPublished,
  };
}

export async function autoAllocateArticles(options?: {
  dryRun?: boolean;
}): Promise<AutoAllocateResult> {
  await requireAdmin();
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };

  const published = await getPublishedPosts();
  if (published.length === 0) {
    return { ok: false, error: "No published articles to allocate. Publish content first." };
  }

  const plan = computeArticleAllocation(published);

  if (options?.dryRun) {
    return {
      ok: true,
      dryRun: true,
      summary: allocationPlanToSummary(plan),
      counts: plan.counts,
      quotas: plan.quotas,
      totalPublished: plan.totalPublished,
    };
  }

  await clearFlagsOnDrafts();
  const { updated, error } = await applyAssignments(plan.assignments);
  if (error) return { ok: false, error };

  revalidateAfterAllocation();

  return {
    ok: true,
    dryRun: false,
    summary: allocationPlanToSummary(plan),
    counts: plan.counts,
    quotas: plan.quotas,
    totalPublished: plan.totalPublished,
    updated,
  };
}

export async function getAllocationTargets() {
  await requireAdmin();
  return getTargetQuotas();
}
