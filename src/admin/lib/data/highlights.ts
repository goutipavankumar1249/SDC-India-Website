import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { HighlightRow } from "@/lib/supabase/database.types";

export async function adminListHighlights(opts?: { includeDeleted?: boolean }): Promise<HighlightRow[]> {
  const supabase = await getSupabaseServerClient();
  let q = supabase.from("highlights").select("*").order("display_order").order("created_at", { ascending: false });
  if (!opts?.includeDeleted) q = q.is("deleted_at", null);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as HighlightRow[];
}

export async function adminGetHighlight(id: string): Promise<HighlightRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("highlights")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as HighlightRow | null;
}

export async function publicListHighlights(): Promise<HighlightRow[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("v_highlights_public").select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as HighlightRow[];
}
