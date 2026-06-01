import Link from "next/link";
import AuthCard from "@/admin/components/AuthCard";
import { logoutAction } from "@/admin/lib/actions/auth";

export const metadata = { title: "Not authorized · SDC INDIA Admin" };

export default function UnauthorizedPage() {
  return (
    <AuthCard
      title="Not authorized"
      subtitle="Your account is signed in, but your email isn't on the admin allowlist."
    >
      <div className="grid gap-3 text-[.85rem]" style={{ color: "var(--sub)" }}>
        <p>
          If you should have access, ask a founder to add your email to the
          admin list, then sign in again.
        </p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="btn-grad w-full"
            style={{ padding: ".65rem", fontSize: ".85rem" }}
          >
            Sign out
          </button>
        </form>
        <Link href="/" className="text-center text-[.78rem]" style={{ color: "var(--sub)" }}>
          ← Back to public site
        </Link>
      </div>
    </AuthCard>
  );
}
