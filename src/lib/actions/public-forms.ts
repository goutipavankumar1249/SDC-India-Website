"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  contactFormSchema, hostFormSchema, registrationFormSchema,
} from "@/lib/schemas/public-forms";

export type PublicFormResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

type ZodLikeError = { issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message?: string }> };
function fieldErrors(e: ZodLikeError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of e.issues) { const k = String(i.path[0] ?? ""); if (!out[k]) out[k] = i.message ?? "Invalid"; }
  return out;
}

async function meta() {
  const h = await headers();
  return {
    user_agent: h.get("user-agent")?.slice(0, 500) ?? null,
    ip_address: (h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null),
  };
}

/** Public Contact form → contact_messages */
export async function submitContactAction(formData: FormData): Promise<PublicFormResult> {
  const parsed = contactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { ok: false, error: "Please fix the errors.", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("contact_messages").insert({ ...parsed.data, ...(await meta()) });
  if (error) return { ok: false, error: "Could not send. Try again in a moment." };

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { ok: true, message: "Got it — we'll get back to you soon!" };
}

/** Public Host form → host_requests */
export async function submitHostRequestAction(formData: FormData): Promise<PublicFormResult> {
  const parsed = hostFormSchema.safeParse({
    name:           formData.get("name"),
    designation:    formData.get("designation"),
    college:        formData.get("college"),
    email:          formData.get("email"),
    phone:          formData.get("phone"),
    event_type:     formData.get("event_type"),
    preferred_date: formData.get("preferred_date"),
    expected_size:  formData.get("expected_size"),
    city:           formData.get("city"),
    details:        formData.get("details"),
  });
  if (!parsed.success) return { ok: false, error: "Please fix the errors.", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("host_requests").insert({ ...parsed.data, ...(await meta()) });
  if (error) return { ok: false, error: "Could not submit. Try again in a moment." };

  revalidatePath("/admin/host-requests");
  revalidatePath("/admin");
  return { ok: true, message: "Submitted! We'll be in touch within 48 hours." };
}

/** Public event Register form → registrations */
export async function submitRegistrationAction(formData: FormData): Promise<PublicFormResult> {
  const parsed = registrationFormSchema.safeParse({
    event_id:      formData.get("event_id"),
    name:          formData.get("name"),
    email:         formData.get("email"),
    phone:         formData.get("phone"),
    college:       formData.get("college"),
    year_of_study: formData.get("year_of_study"),
    branch:        formData.get("branch"),
    notes:         formData.get("notes"),
  });
  if (!parsed.success) return { ok: false, error: "Please fix the errors.", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("registrations").insert({ ...parsed.data, ...(await meta()) });
  if (error) {
    if (error.message.includes("duplicate key")) {
      return { ok: false, error: "You're already registered for this event with this email.", fieldErrors: { email: "Already registered" } };
    }
    return { ok: false, error: "Could not register. Try again in a moment." };
  }

  revalidatePath("/admin/registrations");
  revalidatePath("/admin");
  return { ok: true, message: "Registered! Check your inbox for confirmation details." };
}
