import { requireAdmin } from "@/admin/lib/auth";
import PageHeader, { BackLink } from "@/admin/components/PageHeader";
import GalleryImageForm from "@/admin/components/GalleryImageForm";

export const metadata = { title: "New gallery image · Admin" };

export default async function NewGalleryImagePage() {
  await requireAdmin();
  return (
    <div className="p-8 max-w-[1280px]">
      <BackLink href="/admin/gallery" label="All gallery images" />
      <PageHeader label="New image" title="Add gallery image" />
      <GalleryImageForm />
    </div>
  );
}
