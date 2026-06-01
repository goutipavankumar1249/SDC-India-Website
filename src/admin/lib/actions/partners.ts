"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/admin/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { partnerSchema, parsePartnerFormData } from "@/admin/lib/schemas/partner";

type ZodLikeError = { issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message?: string }> };
function zodToFieldErrors(error: ZodLikeError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of error.issues) { const k = String(i.path[0] ?? ""); if (!out[k]) out[k] = i.message ?? "Invalid"; }
  return out;
}

export type PartnerActionResult =
  | { ok: true; id: string; redirectTo?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function revalidateAll(id?: string) {
  revalidatePath("/admin/partners");
  if (id) revalidatePath(`/admin/partners/${id}`);
  revalidatePath("/about");
  revalidatePath("/");
}

export async function createPartnerAction(formData: FormData): Promise<PartnerActionResult> {
  await requireAdmin();
  const parsed = partnerSchema.safeParse(parsePartnerFormData(formData));
  if (!parsed.success) return { ok: false, error: "Fix the errors below.", fieldErrors: zodToFieldErrors(parsed.error) };
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("partners").insert(parsed.data).select("id").single();
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id: data.id, redirectTo: `/admin/partners/${data.id}` };
}

export async function updatePartnerAction(id: string, formData: FormData): Promise<PartnerActionResult> {
  await requireAdmin();
  const parsed = partnerSchema.safeParse(parsePartnerFormData(formData));
  if (!parsed.success) return { ok: false, error: "Fix the errors below.", fieldErrors: zodToFieldErrors(parsed.error) };
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("partners").update(parsed.data).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll(id);
  return { ok: true, id, redirectTo: `/admin/partners/${id}` };
}

export async function softDeletePartnerAction(id: string): Promise<PartnerActionResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("partners").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll(id);
  return { ok: true, id, redirectTo: "/admin/partners" };
}

export async function restorePartnerAction(id: string): Promise<PartnerActionResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("partners").update({ deleted_at: null }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll(id);
  return { ok: true, id };
}
