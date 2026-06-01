import { z } from "zod";

// Mirror the CHECK constraints from supabase/01_schema.sql
const EVENT_MODES = ["ONLINE", "OFFLINE", "HYBRID"] as const;
const EVENT_CATEGORIES = ["Hackathon", "Workshop", "Conference", "Meetup", "Bootcamp", "Talk", "Other"] as const;

const optionalString = z.string().trim().optional().nullable().transform((v) => (v && v.length > 0 ? v : null));
const optionalUrl    = z.string().trim().url().optional().nullable().or(z.literal("")).transform((v) => (v && v.length > 0 ? v : null));
const optionalDate   = z.string().optional().nullable().transform((v) => (v && v.length > 0 ? v : null));

export const eventSchema = z.object({
  title:               z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description:         z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  long_description:    optionalString,
  event_date:          optionalDate,        // YYYY-MM-DD or null
  event_time:          optionalString,
  location:            optionalString,
  category:            z.enum(EVENT_CATEGORIES).optional().nullable(),
  mode:                z.enum(EVENT_MODES).default("OFFLINE"),
  speakers:            optionalString,
  attendees:           z.coerce.number().int().min(0).default(0),
  seats:               z.coerce.number().int().min(0).optional().nullable(),
  duration:            optionalString,
  registration_url:    optionalUrl,
  registration_open:   z.coerce.boolean().default(false),
  image_url:           optionalString,
  winners:             z.array(z.string().trim()).default([]),
  tags:                z.array(z.string().trim()).default([]),
  is_published:        z.coerce.boolean().default(true),
  display_order:       z.coerce.number().int().default(100),
  slug:                optionalString,         // auto-generated if blank
});

export type EventInput = z.infer<typeof eventSchema>;

/**
 * Parse FormData into a shape that matches the event schema.
 * Handles comma-separated arrays (winners, tags) + checkbox booleans.
 */
export function parseEventFormData(formData: FormData): unknown {
  const get = (k: string) => {
    const v = formData.get(k);
    return v === null ? undefined : typeof v === "string" ? v : undefined;
  };
  const arr = (k: string) =>
    (formData.get(k) as string ?? "")
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

  return {
    title:             get("title"),
    description:       get("description"),
    long_description:  get("long_description"),
    event_date:        get("event_date"),
    event_time:        get("event_time"),
    location:          get("location"),
    category:          get("category") || undefined,
    mode:              get("mode") || "OFFLINE",
    speakers:          get("speakers"),
    attendees:         get("attendees") ?? "0",
    seats:             get("seats") || undefined,
    duration:          get("duration"),
    registration_url:  get("registration_url"),
    registration_open: formData.get("registration_open") === "on",
    image_url:         get("image_url"),
    winners:           arr("winners"),
    tags:              arr("tags"),
    is_published:      formData.get("is_published") === "on",
    display_order:     get("display_order") ?? "100",
    slug:              get("slug"),
  };
}
