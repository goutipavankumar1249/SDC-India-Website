"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/admin/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { teamMemberSchema, parseTeamMemberFormData } from "@/admin/lib/schemas/team";

type ZodLikeError = { issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message?: string }> };
function zodToFieldErrors(error: ZodLikeError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of error.issues) {
    const key = String(i.path[0] ?? "");
    if (!out[key]) out[key] = i.message ?? "Invalid";
  }
  return out;
}

export type TeamActionResult =
  | { ok: true; id: string; redirectTo?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function friendlyDbError(msg: string): string {
  if (msg.includes("violates check constraint")) return "One of the dropdown values is invalid.";
  if (msg.includes("duplicate key")) return "Another team member already has that slug.";
  if (msg.toLowerCase().includes("row level security")) return "You don't have permission for this action.";
  return msg;
}

function revalidatePaths(id?: string) {
  revalidatePath("/admin/team");
  if (id) revalidatePath(`/admin/team/${id}`);
  revalidatePath("/team");
  revalidatePath("/");
}

export async function createTeamMemberAction(formData: FormData): Promise<TeamActionResult> {
  await requireAdmin();
  const parsed = teamMemberSchema.safeParse(parseTeamMemberFormData(formData));
  if (!parsed.success) return { ok: false, error: "Fix the errors below.", fieldErrors: zodToFieldErrors(parsed.error) };

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("team_members")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error) return { ok: false, error: friendlyDbError(error.message) };

  revalidatePaths();
  return { ok: true, id: data.id, redirectTo: `/admin/team/${data.id}` };
}

export async function updateTeamMemberAction(id: string, formData: FormData): Promise<TeamActionResult> {
  await requireAdmin();
  const parsed = teamMemberSchema.safeParse(parseTeamMemberFormData(formData));
  if (!parsed.success) return { ok: false, error: "Fix the errors below.", fieldErrors: zodToFieldErrors(parsed.error) };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("team_members").update(parsed.data).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error.message) };

  revalidatePaths(id);
  return { ok: true, id, redirectTo: `/admin/team/${id}` };
}

export async function softDeleteTeamMemberAction(id: string): Promise<TeamActionResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("team_members")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePaths(id);
  return { ok: true, id, redirectTo: "/admin/team" };
}

export async function restoreTeamMemberAction(id: string): Promise<TeamActionResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("team_members").update({ deleted_at: null }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePaths(id);
  return { ok: true, id };
}
