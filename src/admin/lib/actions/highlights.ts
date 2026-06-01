"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/admin/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { highlightSchema, parseHighlightFormData } from "@/admin/lib/schemas/highlight";

type ZodLikeError = { issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message?: string }> };
function zodToFieldErrors(error: ZodLikeError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of error.issues) { const k = String(i.path[0] ?? ""); if (!out[k]) out[k] = i.message ?? "Invalid"; }
  return out;
}

export type HighlightActionResult =
  | { ok: true; id: string; redirectTo?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function revalidateAll(id?: string) {
  revalidatePath("/admin/highlights");
  if (id) revalidatePath(`/admin/highlights/${id}`);
  revalidatePath("/highlights");
  revalidatePath("/");
}

export async function createHighlightAction(formData: FormData): Promise<HighlightActionResult> {
  await requireAdmin();
  const parsed = highlightSchema.safeParse(parseHighlightFormData(formData));
  if (!parsed.success) return { ok: false, error: "Fix the errors below.", fieldErrors: zodToFieldErrors(parsed.error) };

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("highlights")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidateAll();
  return { ok: true, id: data.id, redirectTo: `/admin/highlights/${data.id}` };
}

export async function updateHighlightAction(id: string, formData: FormData): Promise<HighlightActionResult> {
  await requireAdmin();
  const parsed = highlightSchema.safeParse(parseHighlightFormData(formData));
  if (!parsed.success) return { ok: false, error: "Fix the errors below.", fieldErrors: zodToFieldErrors(parsed.error) };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("highlights").update(parsed.data).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidateAll(id);
  return { ok: true, id, redirectTo: `/admin/highlights/${id}` };
}

export async function softDeleteHighlightAction(id: string): Promise<HighlightActionResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("highlights").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll(id);
  return { ok: true, id, redirectTo: "/admin/highlights" };
}

export async function restoreHighlightAction(id: string): Promise<HighlightActionResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("highlights").update({ deleted_at: null }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll(id);
  return { ok: true, id };
}
