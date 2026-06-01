import type { PublicEventRow } from "@/lib/supabase/database.types";
import type { Event } from "@/types/events";

/**
 * Maps a Supabase `v_events_public` row to the legacy `Event` shape
 * expected by existing card/list UI components.
 *
 * Date formatting: shows "TBA" for null event_date, otherwise renders a
 * short locale-aware string ("Nov 9, 2025").
 */
export function mapRowToEvent(row: PublicEventRow): Event {
  const date = row.event_date
    ? new Date(row.event_date + "T00:00:00").toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "TBA";

  return {
    id: row.slug ?? row.id,                              // used in URLs (slug preferred)
    title: row.title,
    description: row.description,
    date,
    time: row.event_time ?? "",
    location: row.location ?? "",
    category: row.category ?? "Other",
    mode: row.mode,
    speaker: row.speakers ?? "",
    attendees: row.attendees,
    seats: row.seats ?? undefined,
    duration: row.duration ?? "",
    registrationUrl: row.registration_url ?? "#",
    isPast: row.is_past,
    winners: row.winners,
    image: row.image_url ?? undefined,
  };
}

export function mapRowsToEvents(rows: PublicEventRow[]): Event[] {
  return rows.map(mapRowToEvent);
}
