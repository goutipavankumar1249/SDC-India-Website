import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { BlogPostRow } from "@/lib/supabase/database.types";

export async function adminListBlogPosts(opts?: { includeDeleted?: boolean; filter?: "all" | "published" | "drafts" }): Promise<BlogPostRow[]> {
  const supabase = await getSupabaseServerClient();
  let q = supabase.from("blog_posts").select("*").order("publish_date", { ascending: false, nullsFirst: true }).order("created_at", { ascending: false });
  if (!opts?.includeDeleted) q = q.is("deleted_at", null);
  if (opts?.filter === "published") q = q.eq("is_published", true);
  if (opts?.filter === "drafts")    q = q.eq("is_published", false);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as BlogPostRow[];
}

export async function adminGetBlogPost(id: string): Promise<BlogPostRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as BlogPostRow | null;
}

export async function publicListBlogPosts(): Promise<BlogPostRow[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("v_blog_public").select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as BlogPostRow[];
}

export async function publicGetBlogPostBySlug(slug: string): Promise<BlogPostRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("v_blog_public").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as BlogPostRow | null;
}
