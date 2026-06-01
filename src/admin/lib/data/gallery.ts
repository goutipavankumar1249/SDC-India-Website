import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { GalleryImageRow } from "@/lib/supabase/database.types";

export async function adminListGallery(opts?: { includeDeleted?: boolean }): Promise<GalleryImageRow[]> {
  const supabase = await getSupabaseServerClient();
  let q = supabase.from("gallery_images").select("*").order("display_order").order("created_at", { ascending: false });
  if (!opts?.includeDeleted) q = q.is("deleted_at", null);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as GalleryImageRow[];
}

export async function adminGetGalleryImage(id: string): Promise<GalleryImageRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("gallery_images").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as GalleryImageRow | null;
}

export async function publicListGallery(): Promise<GalleryImageRow[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("v_gallery_public").select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as GalleryImageRow[];
}
