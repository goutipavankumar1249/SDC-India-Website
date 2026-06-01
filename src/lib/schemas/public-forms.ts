import { z } from "zod";

const optStr = z.string().trim().optional().nullable().transform((v) => (v && v.length > 0 ? v : null));

// ─────────────────────────────────────────────────
// CONTACT FORM
// ─────────────────────────────────────────────────
export const contactFormSchema = z.object({
  name:    z.string().trim().min(2, "Please enter your name").max(120),
  email:   z.string().trim().toLowerCase().email("Enter a valid email"),
  subject: optStr,
  message: z.string().trim().min(10, "Tell us more (10+ chars)").max(5000),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;

// ─────────────────────────────────────────────────
// HOST REQUEST FORM
// ─────────────────────────────────────────────────
export const hostFormSchema = z.object({
  name:           z.string().trim().min(2).max(120),
  designation:    optStr,
  college:        z.string().trim().min(2, "College required").max(200),
  email:          z.string().trim().toLowerCase().email("Enter a valid email"),
  phone:          optStr,
  event_type:     optStr,
  preferred_date: z.string().optional().nullable().transform((v) => (v && v.length > 0 ? v : null)),
  expected_size:  optStr,
  city:           optStr,
  details:        optStr,
});
export type HostFormInput = z.infer<typeof hostFormSchema>;

// ─────────────────────────────────────────────────
// EVENT REGISTRATION FORM
// ─────────────────────────────────────────────────
export const registrationFormSchema = z.object({
  event_id:      z.string().uuid("Event reference is invalid"),
  name:          z.string().trim().min(2).max(120),
  email:         z.string().trim().toLowerCase().email("Enter a valid email"),
  phone:         optStr,
  college:       z.string().trim().max(200).optional().nullable().transform((v) => (v && v.length > 0 ? v : null)),
  year_of_study: optStr,
  branch:        optStr,
  notes:         optStr,
});
export type RegistrationFormInput = z.infer<typeof registrationFormSchema>;
