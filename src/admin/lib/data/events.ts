import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { EventRow, PublicEventRow } from "@/lib/supabase/database.types";

/**
 * ADMIN reads — sees EVERYTHING including unpublished + soft-deleted rows.
 * Admin RLS policies on the base `events` table allow this.
 */
export async function adminListEvents(opts?: {
  includeDeleted?: boolean;
  filter?: "all" | "upcoming" | "past" | "drafts";
}): Promise<EventRow[]> {
  const supabase = await getSupabaseServerClient();
  let q = supabase.from("events").select("*").order("event_date", { ascending: false, nullsFirst: true }).order("display_order");

  if (!opts?.includeDeleted) q = q.is("deleted_at", null);

  const today = new Date().toISOString().slice(0, 10);
  switch (opts?.filter) {
    case "upcoming":
      q = q.or(`event_date.is.null,event_date.gte.${today}`);
      break;
    case "past":
      q = q.lt("event_date", today);
      break;
    case "drafts":
      q = q.eq("is_published", false);
      break;
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as EventRow[];
}

export async function adminGetEventById(id: string): Promise<EventRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as EventRow | null;
}

/**
 * PUBLIC reads — use the v_events_public view which filters out
 * deleted + unpublished rows automatically.
 */
export async function publicListEvents(opts?: { filter?: "upcoming" | "past" | "all" }): Promise<PublicEventRow[]> {
  const supabase = await getSupabaseServerClient();
  const view =
    opts?.filter === "upcoming" ? "v_upcoming_events" :
    opts?.filter === "past"     ? "v_past_events" :
                                  "v_events_public";
  const { data, error } = await supabase.from(view).select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicEventRow[];
}

export async function publicGetEventBySlug(slug: string): Promise<PublicEventRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("v_events_public")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as PublicEventRow | null;
}

export async function publicGetEventById(id: string): Promise<PublicEventRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("v_events_public")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as PublicEventRow | null;
}
