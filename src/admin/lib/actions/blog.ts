"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/admin/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { blogPostSchema, parseBlogPostFormData } from "@/admin/lib/schemas/blog";

type ZodLikeError = { issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message?: string }> };
function zodToFieldErrors(error: ZodLikeError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of error.issues) { const k = String(i.path[0] ?? ""); if (!out[k]) out[k] = i.message ?? "Invalid"; }
  return out;
}

export type BlogActionResult =
  | { ok: true; id: string; redirectTo?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function revalidateAll(id?: string, slug?: string) {
  revalidatePath("/admin/blog");
  if (id) revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
}

export async function createBlogPostAction(formData: FormData): Promise<BlogActionResult> {
  await requireAdmin();
  const parsed = blogPostSchema.safeParse(parseBlogPostFormData(formData));
  if (!parsed.success) return { ok: false, error: "Fix the errors below.", fieldErrors: zodToFieldErrors(parsed.error) };
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("blog_posts").insert(parsed.data).select("id, slug").single();
  if (error) {
    if (error.message.includes("duplicate key")) return { ok: false, error: "A post with that slug already exists.", fieldErrors: { slug: "Already taken" } };
    return { ok: false, error: error.message };
  }
  revalidateAll(undefined, data.slug);
  return { ok: true, id: data.id, redirectTo: `/admin/blog/${data.id}` };
}

export async function updateBlogPostAction(id: string, formData: FormData): Promise<BlogActionResult> {
  await requireAdmin();
  const parsed = blogPostSchema.safeParse(parseBlogPostFormData(formData));
  if (!parsed.success) return { ok: false, error: "Fix the errors below.", fieldErrors: zodToFieldErrors(parsed.error) };
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("blog_posts").update(parsed.data).eq("id", id).select("slug").single();
  if (error) {
    if (error.message.includes("duplicate key")) return { ok: false, error: "A post with that slug already exists.", fieldErrors: { slug: "Already taken" } };
    return { ok: false, error: error.message };
  }
  revalidateAll(id, data.slug);
  return { ok: true, id, redirectTo: `/admin/blog/${id}` };
}

export async function softDeleteBlogPostAction(id: string): Promise<BlogActionResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("blog_posts").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll(id);
  return { ok: true, id, redirectTo: "/admin/blog" };
}

export async function restoreBlogPostAction(id: string): Promise<BlogActionResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("blog_posts").update({ deleted_at: null }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll(id);
  return { ok: true, id };
}
