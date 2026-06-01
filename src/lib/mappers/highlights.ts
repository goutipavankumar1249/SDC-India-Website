import type { HighlightRow } from "@/lib/supabase/database.types";
import type { Highlight } from "@/data/highlights";

export function mapRowToHighlight(row: HighlightRow): Highlight {
  return {
    id: row.slug ?? row.id,
    team: row.team_name,
    initials: row.initials,
    position: row.position,
    positionIcon: row.position_icon,
    event: row.event_name,
    eventDate: row.event_date_label ?? "",
    eventImage: row.event_image_url ?? "/assets/events/sdc-india-logo.jpeg",
    description: row.description ?? "",
    gradient: row.gradient ?? "linear-gradient(135deg,#e84393,#f97316)",
    stats: row.stats ?? [],
  };
}
