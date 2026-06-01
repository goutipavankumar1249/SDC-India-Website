import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { PartnerRow } from "@/lib/supabase/database.types";

export async function adminListPartners(opts?: { includeDeleted?: boolean }): Promise<PartnerRow[]> {
  const supabase = await getSupabaseServerClient();
  let q = supabase.from("partners").select("*").order("display_order").order("name");
  if (!opts?.includeDeleted) q = q.is("deleted_at", null);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as PartnerRow[];
}

export async function adminGetPartner(id: string): Promise<PartnerRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("partners").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as PartnerRow | null;
}

export async function publicListPartners(): Promise<PartnerRow[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("v_partners_public").select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as PartnerRow[];
}
