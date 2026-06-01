import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TeamMemberRow } from "@/lib/supabase/database.types";

export async function adminListTeam(opts?: { includeDeleted?: boolean; section?: string }): Promise<TeamMemberRow[]> {
  const supabase = await getSupabaseServerClient();
  let q = supabase.from("team_members").select("*").order("section").order("display_order").order("name");
  if (!opts?.includeDeleted) q = q.is("deleted_at", null);
  if (opts?.section) q = q.eq("section", opts.section);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as TeamMemberRow[];
}

export async function adminGetTeamMember(id: string): Promise<TeamMemberRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as TeamMemberRow | null;
}

export async function publicListTeam(): Promise<TeamMemberRow[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("v_team_public").select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as TeamMemberRow[];
}
