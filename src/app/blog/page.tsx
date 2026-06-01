import { publicListBlogPosts } from "@/admin/lib/data/blog";
import { mapRowToBlogPost } from "@/lib/mappers/blog";
import BlogCard from "@/components/cards/BlogCard";

export const revalidate = 60;

export default async function BlogPage() {
  const rows = await publicListBlogPosts();
  const posts = rows.map(mapRowToBlogPost);
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <main className="pt-32 pb-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="sec-label mb-2">// BLOG</div>
        <h1 className="sec-title">Stories, insights & recaps</h1>
        <p className="sec-sub mb-12">Articles, event recaps, and community stories from the Student Developers Community.</p>

        {featured && <BlogCard post={featured} featured />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1.3rem]">
          {rest.map((p) => (
            <BlogCard key={p.id} post={p} />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="rounded-xl p-10 text-center text-[.88rem]"
               style={{ background: "var(--card)", border: "1px dashed var(--border)", color: "var(--muted)" }}>
            No blog posts yet. Check back soon!
          </div>
        )}
      </div>
    </main>
  );
}
