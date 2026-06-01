import Link from "next/link";
import { requireAdmin } from "@/admin/lib/auth";
import { adminListGallery } from "@/admin/lib/data/gallery";
import PageHeader from "@/admin/components/PageHeader";

export const metadata = { title: "Gallery · Admin" };

export default async function AdminGalleryPage({
  searchParams,
}: { searchParams: Promise<{ include_deleted?: string }> }) {
  await requireAdmin();
  const { include_deleted } = await searchParams;
  const includeDeleted = include_deleted === "1";
  const images = await adminListGallery({ includeDeleted });

  return (
    <div className="p-8 max-w-[1280px]">
      <PageHeader
        label="Gallery"
        title="Gallery"
        description={`${images.length} ${images.length === 1 ? "image" : "images"}`}
        actions={
          <Link href="/admin/gallery/new" className="btn-grad" style={{ padding: ".55rem 1.1rem", fontSize: ".84rem" }}>
            + New image
          </Link>
        }
      />

      <div className="flex justify-end mb-3">
        <Link href={`/admin/gallery${!includeDeleted ? "?include_deleted=1" : ""}`}
              className="text-[.72rem]"
              style={{ color: includeDeleted ? "var(--a1)" : "var(--sub)", textDecoration: "underline" }}>
          {includeDeleted ? "✓ showing deleted" : "show deleted"}
        </Link>
      </div>

      {images.length === 0 ? (
        <div className="rounded-xl p-10 text-center text-[.88rem]"
             style={{ background: "var(--card)", border: "1px dashed var(--border)", color: "var(--muted)" }}>
          No images yet. <Link href="/admin/gallery/new" style={{ color: "var(--a1)" }}>Add one →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img) => (
            <Link key={img.id} href={`/admin/gallery/${img.id}`} className="block">
              <div className="rounded-lg overflow-hidden relative aspect-square" style={{ border: "1px solid var(--border)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.image_url} alt={img.alt_text ?? ""} className="w-full h-full object-cover" />
                {(!img.is_published || img.deleted_at) && (
                  <div className="absolute top-2 left-2 flex gap-1">
                    {!img.is_published && <Pill tone="muted" label="DRAFT" />}
                    {img.deleted_at && <Pill tone="red" label="DEL" />}
                  </div>
                )}
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[.55rem] font-bold uppercase"
                     style={{ background: "rgba(0,0,0,.6)", color: "#fff" }}>
                  #{img.display_order}
                </div>
              </div>
              {img.alt_text && (
                <div className="mt-1.5 text-[.72rem] truncate" style={{ color: "var(--sub)" }}>{img.alt_text}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Pill({ label, tone }: { label: string; tone: "muted" | "red" }) {
  const map = { muted: { bg: "#111", c: "#aaa" }, red: { bg: "#7a1c1c", c: "#fff" } }[tone];
  return (
    <span className="px-1.5 py-0.5 rounded text-[.55rem] font-bold uppercase tracking-wider"
          style={{ background: map.bg, color: map.c }}>{label}</span>
  );
}
