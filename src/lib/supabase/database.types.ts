/**
 * Database types — manually maintained to mirror supabase/01_schema.sql.
 *
 * When you change the SQL schema, update the corresponding type block below.
 * Optional: once you've run `supabase login` locally, regenerate via:
 *   npx supabase gen types typescript --project-id xqfyncycgybhgzrlpitc \
 *     --schema public > src/lib/supabase/database.types.ts
 */

export type EventMode      = "ONLINE" | "OFFLINE" | "HYBRID";
export type EventCategory  = "Hackathon" | "Workshop" | "Conference" | "Meetup" | "Bootcamp" | "Talk" | "Other";
export type TeamSection    = "Founder" | "Board" | "Tech" | "Core" | "Alumni";
export type BlogCategory   = "article" | "event" | "growth" | "community" | "digital" | "tutorial" | "announcement";
export type Position       = "1st" | "2nd" | "3rd" | "Honorable Mention" | "Featured";
export type PartnerTier    = "platinum" | "gold" | "silver" | "standard";
export type AdminRole      = "admin" | "editor" | "viewer";
export type RegistrationStatus = "pending" | "confirmed" | "waitlist" | "cancelled" | "attended" | "no_show";
export type ContactStatus  = "new" | "read" | "replied" | "spam" | "archived";
export type HostStatus     = "new" | "contacted" | "scheduled" | "declined" | "completed";

export interface BaseRow {
  id: string;
  slug: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  is_published: boolean;
  display_order: number;
}

export interface EventRow extends BaseRow {
  title: string;
  description: string;
  long_description: string | null;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  category: EventCategory | null;
  mode: EventMode;
  speakers: string | null;
  attendees: number;
  seats: number | null;
  duration: string | null;
  registration_url: string | null;
  registration_open: boolean;
  image_url: string | null;
  winners: string[];
  tags: string[];
  agenda: { time: string; title: string; description: string }[] | null;
  what_you_will_learn: string[];
  who_should_attend: string[];
}
export type EventInsert = Pick<EventRow, "title" | "description"> & Partial<Omit<EventRow, "id" | "created_at" | "updated_at">>;
export type EventUpdate = Partial<Omit<EventRow, "id" | "created_at" | "updated_at">>;
export type PublicEventRow = EventRow & { is_past: boolean };

export interface TeamMemberRow extends BaseRow {
  initials: string;
  name: string;
  role: string;
  bio: string | null;
  skills: string[];
  impact: string | null;
  gradient: string | null;
  section: TeamSection;
  photo_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  email: string | null;
}

export interface BlogContentBlock {
  title?: string;
  paragraphs?: string[];
  bullets?: string[];
  quote?: string;
}
export interface BlogPostRow extends BaseRow {
  slug: string;
  title: string;
  category: BlogCategory;
  publish_date: string | null;
  read_time: string | null;
  cover_image_url: string | null;
  excerpt: string | null;
  content_blocks: BlogContentBlock[];
}

export interface HighlightStat { value: string; label: string }
export interface HighlightRow extends BaseRow {
  team_name: string;
  initials: string;
  position: Position;
  position_icon: string;
  event_id: string | null;
  event_name: string;
  event_date_label: string | null;
  event_image_url: string | null;
  description: string | null;
  gradient: string | null;
  stats: HighlightStat[] | null;
}

export interface GalleryImageRow extends BaseRow {
  image_url: string;
  alt_text: string | null;
  caption: string | null;
  span_classes: string | null;
  event_id: string | null;
}

export interface PartnerRow extends BaseRow {
  name: string;
  logo_url: string;
  website_url: string | null;
  description: string | null;
  tier: PartnerTier;
}

export interface RegistrationRow {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
  year_of_study: string | null;
  branch: string | null;
  notes: string | null;
  extra_data: Record<string, unknown> | null;
  status: RegistrationStatus;
  status_notes: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: ContactStatus;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface HostRequestRow {
  id: string;
  name: string;
  designation: string | null;
  college: string;
  email: string;
  phone: string | null;
  event_type: string | null;
  preferred_date: string | null;
  expected_size: string | null;
  city: string | null;
  details: string | null;
  status: HostStatus;
  status_notes: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface AdminEmailRow {
  email: string;
  role: AdminRole;
  added_by: string | null;
  created_at: string;
  deleted_at: string | null;
}
