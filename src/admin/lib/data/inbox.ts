import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { RegistrationRow, ContactMessageRow, HostRequestRow } from "@/lib/supabase/database.types";

// ── Registrations ───────────────────────────────────────────
export async function adminListRegistrations(opts?: { eventId?: string; status?: string }): Promise<(RegistrationRow & { event_title?: string; event_slug?: string })[]> {
  const supabase = await getSupabaseServerClient();
  let q = supabase.from("registrations").select("*, events(title, slug)").order("created_at", { ascending: false });
  if (opts?.eventId) q = q.eq("event_id", opts.eventId);
  if (opts?.status)  q = q.eq("status", opts.status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => {
    const ev = (r as { events?: { title?: string; slug?: string } | null }).events;
    return { ...r, event_title: ev?.title, event_slug: ev?.slug } as RegistrationRow & { event_title?: string; event_slug?: string };
  });
}

// ── Contact Messages ───────────────────────────────────────
export async function adminListContactMessages(opts?: { status?: string }): Promise<ContactMessageRow[]> {
  const supabase = await getSupabaseServerClient();
  let q = supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
  if (opts?.status) q = q.eq("status", opts.status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as ContactMessageRow[];
}

// ── Host Requests ──────────────────────────────────────────
export async function adminListHostRequests(opts?: { status?: string }): Promise<HostRequestRow[]> {
  const supabase = await getSupabaseServerClient();
  let q = supabase.from("host_requests").select("*").order("created_at", { ascending: false });
  if (opts?.status) q = q.eq("status", opts.status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as HostRequestRow[];
}
