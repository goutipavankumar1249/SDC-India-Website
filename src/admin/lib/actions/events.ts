"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/admin/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { eventSchema, parseEventFormData } from "@/admin/lib/schemas/event";

export type EventActionResult =
  | { ok: true; id: string; redirectTo?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

type ZodLikeError = { issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message?: string }> };
function zodToFieldErrors(error: ZodLikeError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of error.issues) {
    const key = String(i.path[0] ?? "");
    if (!out[key]) out[key] = i.message ?? "Invalid";
  }
  return out;
}

/** Create a new event. */
export async function createEventAction(formData: FormData): Promise<EventActionResult> {
  await requireAdmin();

  const parsed = eventSchema.safeParse(parseEventFormData(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please fix the errors below.", fieldErrors: zodToFieldErrors(parsed.error) };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .insert(parsed.data)
    .select("id, slug")
    .single();

  if (error) {
    return { ok: false, error: friendlyDbError(error.message) };
  }

  revalidatePaths();
  return { ok: true, id: data.id, redirectTo: `/admin/events/${data.id}` };
}

/** Update an existing event. */
export async function updateEventAction(id: string, formData: FormData): Promise<EventActionResult> {
  await requireAdmin();

  const parsed = eventSchema.safeParse(parseEventFormData(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please fix the errors below.", fieldErrors: zodToFieldErrors(parsed.error) };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("events")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    return { ok: false, error: friendlyDbError(error.message) };
  }

  revalidatePaths(id);
  return { ok: true, id, redirectTo: `/admin/events/${id}` };
}

/** Soft delete — sets deleted_at, doesn't actually remove the row. */
export async function softDeleteEventAction(id: string): Promise<EventActionResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("events")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePaths(id);
  return { ok: true, id, redirectTo: "/admin/events" };
}

/** Restore a soft-deleted event. */
export async function restoreEventAction(id: string): Promise<EventActionResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("events")
    .update({ deleted_at: null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePaths(id);
  return { ok: true, id };
}

/** Toggle the is_published flag. */
export async function togglePublishedAction(id: string, nextValue: boolean): Promise<EventActionResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("events")
    .update({ is_published: nextValue })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePaths(id);
  return { ok: true, id };
}

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────
function revalidatePaths(id?: string) {
  revalidatePath("/admin/events");
  if (id) revalidatePath(`/admin/events/${id}`);
  revalidatePath("/events");
  revalidatePath("/");
}

function friendlyDbError(msg: string): string {
  if (msg.includes("violates check constraint")) return "One of the dropdown values is invalid.";
  if (msg.includes("duplicate key")) return "Another event already has that slug.";
  if (msg.toLowerCase().includes("row level security")) return "You don't have permission for this action.";
  return msg;
}
