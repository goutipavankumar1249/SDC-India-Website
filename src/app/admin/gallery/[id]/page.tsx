import { notFound } from "next/navigation";
import { requireAdmin } from "@/admin/lib/auth";
import { adminGetGalleryImage } from "@/admin/lib/data/gallery";
import PageHeader, { BackLink } from "@/admin/components/PageHeader";
import GalleryImageForm from "@/admin/components/GalleryImageForm";

export const metadata = { title: "Edit gallery image · Admin" };

export default async function EditGalleryImagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const img = await adminGetGalleryImage(id);
  if (!img) return notFound();
  return (
    <div className="p-8 max-w-[1280px]">
      <BackLink href="/admin/gallery" label="All gallery images" />
      <PageHeader label="Edit gallery image" title={img.alt_text ?? "Image"} description={`last updated ${new Date(img.updated_at).toLocaleString()}`} />
      <GalleryImageForm image={img} />
    </div>
  );
}
