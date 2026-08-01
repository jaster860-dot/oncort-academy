import type { BlockProgress } from "./types";
import { createBrowserSupabaseClient } from "../supabase/browser";

const STORAGE_KEY = "oncort.academy.progress.v1";

export type ProgressStore = Record<string, BlockProgress>;

export function progressKey(siteId: string, blockId: string) {
  return `${siteId}:${blockId}`;
}

export function emptyProgress(siteId: string, blockId: string): BlockProgress {
  return {
    siteId,
    blockId,
    completedLessonIds: [],
    checkpointAttempts: {},
    caseCompleted: false,
    updatedAt: new Date(0).toISOString(),
  };
}

export function readProgress(): ProgressStore {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ProgressStore) : {};
  } catch {
    return {};
  }
}

export function writeProgress(progress: BlockProgress) {
  if (typeof window === "undefined") return;
  const store = readProgress();
  store[progressKey(progress.siteId, progress.blockId)] = progress;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent("oncort:progress", { detail: progress }));
}

export function calculateBlockPercent(progress: BlockProgress, lessonCount: number) {
  const learningShare = lessonCount
    ? (progress.completedLessonIds.length / lessonCount) * 90
    : 0;
  return Math.min(100, Math.round(learningShare + (progress.caseCompleted ? 10 : 0)));
}

export function nextRecommendedBlock(
  siteId: string,
  blocks: Array<{ id: string }>,
  documents: Record<string, { lessons: Array<{ id: string }>; caseStudy?: unknown }>,
  store: ProgressStore,
) {
  return (
    blocks.find((block) => {
      const document = documents[block.id];
      const progress = store[progressKey(siteId, block.id)] ??
        emptyProgress(siteId, block.id);
      return calculateBlockPercent(progress, document.lessons.length) < 100;
    }) ?? blocks.at(-1)
  );
}

export async function syncProgress(progress: BlockProgress) {
  try {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return "local";
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "local";
    const { error } = await supabase.from("learning_progress").upsert({
      user_id: user.id,
      site_id: progress.siteId,
      block_id: progress.blockId,
      completed_lesson_ids: progress.completedLessonIds,
      checkpoint_attempts: progress.checkpointAttempts,
      case_completed: progress.caseCompleted,
      updated_at: progress.updatedAt,
    }, { onConflict: "user_id,site_id,block_id" });
    return error ? "error" : "synced";
  } catch {
    return "local";
  }
}
