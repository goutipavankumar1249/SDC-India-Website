import { notFound } from "next/navigation";
import { requireAdmin } from "@/admin/lib/auth";
import { adminGetHighlight } from "@/admin/lib/data/highlights";
import PageHeader, { BackLink } from "@/admin/components/PageHeader";
import HighlightForm from "@/admin/components/HighlightForm";

export const metadata = { title: "Edit highlight · Admin" };

export default async function EditHighlightPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const highlight = await adminGetHighlight(id);
  if (!highlight) return notFound();
  return (
    <div className="p-8 max-w-[1280px]">
      <BackLink href="/admin/highlights" label="All highlights" />
      <PageHeader
        label="Edit highlight"
        title={highlight.team_name}
        description={`${highlight.event_name} · last updated ${new Date(highlight.updated_at).toLocaleString()}`}
      />
      <HighlightForm highlight={highlight} />
    </div>
  );
}
