"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "@/admin/lib/schemas/auth";

export type ActionResult =
  | { ok: true; redirectTo?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Admin login. Two gates:
 *   1. Supabase Auth verifies the email + password match.
 *   2. The email must also be in admin_emails (the allowlist).
 *
 * Both must pass. No signup flow — admins are pre-provisioned by the
 * founder via the Supabase Dashboard (Authentication → Users → Add User).
 */
export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] = i.message;
    return { ok: false, error: "Invalid input", fieldErrors };
  }

  const supabase = await getSupabaseServerClient();

  const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);
  if (signInError) {
    return { ok: false, error: "Invalid email or password." };
  }

  // Verify the email is on the admin allowlist
  const { data: allow } = await supabase
    .from("admin_emails")
    .select("email")
    .eq("email", parsed.data.email)
    .is("deleted_at", null)
    .maybeSingle();

  if (!allow) {
    await supabase.auth.signOut();
    return { ok: false, error: "This account isn't on the admin allowlist." };
  }

  const next = (formData.get("next") as string) || "/admin";
  revalidatePath("/", "layout");
  return { ok: true, redirectTo: next };
}

/** Sign out and return to login. */
export async function logoutAction(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}
