import { notFound } from "next/navigation";
import { requireAdmin } from "@/admin/lib/auth";
import { adminGetBlogPost } from "@/admin/lib/data/blog";
import PageHeader, { BackLink } from "@/admin/components/PageHeader";
import BlogPostForm from "@/admin/components/BlogPostForm";

export const metadata = { title: "Edit blog post · Admin" };

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const post = await adminGetBlogPost(id);
  if (!post) return notFound();
  return (
    <div className="p-8 max-w-[1280px]">
      <BackLink href="/admin/blog" label="All blog posts" />
      <PageHeader label="Edit post" title={post.title} description={`/blog/${post.slug} · last updated ${new Date(post.updated_at).toLocaleString()}`} />
      <BlogPostForm post={post} />
    </div>
  );
}
