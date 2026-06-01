import { z } from "zod";

const POSITIONS = ["1st", "2nd", "3rd", "Honorable Mention", "Featured"] as const;

const optStr = z.string().trim().optional().nullable().transform((v) => (v && v.length > 0 ? v : null));

export const highlightSchema = z.object({
  team_name:        z.string().trim().min(2).max(200),
  initials:         z.string().trim().min(1).max(4),
  position:         z.enum(POSITIONS).default("1st"),
  position_icon:    z.string().trim().min(1).max(8).default("🏆"),
  event_id:         optStr,                       // optional FK
  event_name:       z.string().trim().min(2).max(200),
  event_date_label: optStr,
  event_image_url:  optStr,
  description:      optStr,
  gradient:         optStr,
  stats:            z.array(z.object({ value: z.string().trim(), label: z.string().trim() })).default([]),
  is_published:     z.coerce.boolean().default(true),
  display_order:    z.coerce.number().int().default(100),
  slug:             optStr,
});
export type HighlightInput = z.infer<typeof highlightSchema>;

/**
 * Parses the stats from the form — accepts pairs entered as
 * `value|label, value|label, ...` (one per line OR comma-separated).
 */
function parseStats(raw: string): { value: string; label: string }[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pair) => {
      const [value, ...rest] = pair.split("|").map((s) => s.trim());
      return { value: value ?? "", label: rest.join("|") || "" };
    })
    .filter((s) => s.value && s.label);
}

export function parseHighlightFormData(fd: FormData): unknown {
  const get = (k: string) => {
    const v = fd.get(k);
    return v === null ? undefined : typeof v === "string" ? v : undefined;
  };
  return {
    team_name:        get("team_name"),
    initials:         get("initials"),
    position:         get("position") || "1st",
    position_icon:    get("position_icon") || "🏆",
    event_id:         get("event_id") || undefined,
    event_name:       get("event_name"),
    event_date_label: get("event_date_label"),
    event_image_url:  get("event_image_url"),
    description:      get("description"),
    gradient:         get("gradient"),
    stats:            parseStats(get("stats") ?? ""),
    is_published:     fd.get("is_published") === "on",
    display_order:    get("display_order") ?? "100",
    slug:             get("slug"),
  };
}
