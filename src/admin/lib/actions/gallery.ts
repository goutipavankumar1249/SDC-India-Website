"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/admin/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { galleryImageSchema, parseGalleryFormData } from "@/admin/lib/schemas/gallery";

type ZodLikeError = { issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message?: string }> };
function zodToFieldErrors(error: ZodLikeError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of error.issues) { const k = String(i.path[0] ?? ""); if (!out[k]) out[k] = i.message ?? "Invalid"; }
  return out;
}

export type GalleryActionResult =
  | { ok: true; id: string; redirectTo?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function revalidateAll(id?: string) {
  revalidatePath("/admin/gallery");
  if (id) revalidatePath(`/admin/gallery/${id}`);
  revalidatePath("/about");
  revalidatePath("/");
}

export async function createGalleryImageAction(formData: FormData): Promise<GalleryActionResult> {
  await requireAdmin();
  const parsed = galleryImageSchema.safeParse(parseGalleryFormData(formData));
  if (!parsed.success) return { ok: false, error: "Fix the errors below.", fieldErrors: zodToFieldErrors(parsed.error) };
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("gallery_images").insert(parsed.data).select("id").single();
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id: data.id, redirectTo: "/admin/gallery" };
}

export async function updateGalleryImageAction(id: string, formData: FormData): Promise<GalleryActionResult> {
  await requireAdmin();
  const parsed = galleryImageSchema.safeParse(parseGalleryFormData(formData));
  if (!parsed.success) return { ok: false, error: "Fix the errors below.", fieldErrors: zodToFieldErrors(parsed.error) };
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("gallery_images").update(parsed.data).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll(id);
  return { ok: true, id, redirectTo: `/admin/gallery/${id}` };
}

export async function softDeleteGalleryImageAction(id: string): Promise<GalleryActionResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("gallery_images").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll(id);
  return { ok: true, id, redirectTo: "/admin/gallery" };
}

export async function restoreGalleryImageAction(id: string): Promise<GalleryActionResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("gallery_images").update({ deleted_at: null }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll(id);
  return { ok: true, id };
}
