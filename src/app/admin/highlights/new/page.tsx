import { requireAdmin } from "@/admin/lib/auth";
import PageHeader, { BackLink } from "@/admin/components/PageHeader";
import HighlightForm from "@/admin/components/HighlightForm";

export const metadata = { title: "New highlight · Admin" };

export default async function NewHighlightPage() {
  await requireAdmin();
  return (
    <div className="p-8 max-w-[1280px]">
      <BackLink href="/admin/highlights" label="All highlights" />
      <PageHeader label="New highlight" title="Add highlight" description="Recognize a winning team or standout moment." />
      <HighlightForm />
    </div>
  );
}
