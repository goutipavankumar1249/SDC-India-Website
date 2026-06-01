"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/admin/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type InboxResult = { ok: true } | { ok: false; error: string };

// ── Registrations ───────────────────────────────────────────
const REGISTRATION_STATUSES = ["pending", "confirmed", "waitlist", "cancelled", "attended", "no_show"] as const;
type RegStatus = typeof REGISTRATION_STATUSES[number];

export async function updateRegistrationStatusAction(id: string, status: string, notes?: string): Promise<InboxResult> {
  await requireAdmin();
  if (!REGISTRATION_STATUSES.includes(status as RegStatus)) return { ok: false, error: "Invalid status" };
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("registrations").update({ status, status_notes: notes ?? null }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/registrations");
  return { ok: true };
}

export async function deleteRegistrationAction(id: string): Promise<InboxResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("registrations").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/registrations");
  return { ok: true };
}

// ── Contact Messages ───────────────────────────────────────
const CONTACT_STATUSES = ["new", "read", "replied", "spam", "archived"] as const;
type ContactStatus = typeof CONTACT_STATUSES[number];

export async function updateContactStatusAction(id: string, status: string): Promise<InboxResult> {
  await requireAdmin();
  if (!CONTACT_STATUSES.includes(status as ContactStatus)) return { ok: false, error: "Invalid status" };
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteContactMessageAction(id: string): Promise<InboxResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/messages");
  return { ok: true };
}

// ── Host Requests ──────────────────────────────────────────
const HOST_STATUSES = ["new", "contacted", "scheduled", "declined", "completed"] as const;
type HostStatus = typeof HOST_STATUSES[number];

export async function updateHostRequestStatusAction(id: string, status: string, notes?: string): Promise<InboxResult> {
  await requireAdmin();
  if (!HOST_STATUSES.includes(status as HostStatus)) return { ok: false, error: "Invalid status" };
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("host_requests").update({ status, status_notes: notes ?? null }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/host-requests");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteHostRequestAction(id: string): Promise<InboxResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("host_requests").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/host-requests");
  return { ok: true };
}
