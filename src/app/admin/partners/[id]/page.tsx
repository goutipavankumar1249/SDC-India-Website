import { notFound } from "next/navigation";
import { requireAdmin } from "@/admin/lib/auth";
import { adminGetPartner } from "@/admin/lib/data/partners";
import PageHeader, { BackLink } from "@/admin/components/PageHeader";
import PartnerForm from "@/admin/components/PartnerForm";

export const metadata = { title: "Edit partner · Admin" };

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const partner = await adminGetPartner(id);
  if (!partner) return notFound();
  return (
    <div className="p-8 max-w-[1280px]">
      <BackLink href="/admin/partners" label="All partners" />
      <PageHeader label="Edit partner" title={partner.name} description={`${partner.tier} tier · last updated ${new Date(partner.updated_at).toLocaleString()}`} />
      <PartnerForm partner={partner} />
    </div>
  );
}
