import { requireAdmin } from "@/admin/lib/auth";
import PageHeader, { BackLink } from "@/admin/components/PageHeader";
import BlogPostForm from "@/admin/components/BlogPostForm";

export const metadata = { title: "New blog post · Admin" };

export default async function NewBlogPostPage() {
  await requireAdmin();
  return (
    <div className="p-8 max-w-[1280px]">
      <BackLink href="/admin/blog" label="All blog posts" />
      <PageHeader label="New post" title="Write blog post" description="Drafts are hidden from the public site until you publish." />
      <BlogPostForm />
    </div>
  );
}
