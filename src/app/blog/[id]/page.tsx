import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { publicGetBlogPostBySlug } from "@/admin/lib/data/blog";
import { mapRowToBlogPost } from "@/lib/mappers/blog";

export const revalidate = 60;

export default async function BlogDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  const row = await publicGetBlogPostBySlug(slug);
  if (!row) return notFound();
  const post = mapRowToBlogPost(row);

  return (
    <main className="pt-24 pb-20">
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,8,.95) 0%, rgba(8,8,8,.5) 60%, rgba(8,8,8,.3) 100%)" }} />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[820px] mx-auto w-full px-6 pb-10">
            <Link href="/blog" className="inline-block text-[.78rem] mb-4 transition-colors hover:text-white" style={{ color: "var(--sub)" }}>
              ← Back to blog
            </Link>
            <span className="inline-block px-3 py-1 rounded-full text-[.65rem] mb-3 uppercase tracking-wider" style={{ background: "rgba(168,85,247,.18)", color: "var(--a3)" }}>
              {post.category}
            </span>
            <h1 className="font-extrabold text-3xl md:text-5xl leading-tight" style={{ letterSpacing: "-.02em" }}>{post.title}</h1>
            <div className="flex gap-4 mt-3 text-sm" style={{ color: "var(--sub)" }}>
              <span>📅 {post.date}</span>
              <span>⏱ {post.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      <article className="max-w-[820px] mx-auto px-6 mt-10">
        <p className="text-lg leading-[1.85] italic mb-8" style={{ color: "var(--sub)" }}>{post.excerpt}</p>

        {post.content.map((section, idx) => (
          <section key={idx} className="mb-8">
            {section.title && (
              <h2 className="font-extrabold text-xl mt-8 mb-3" style={{ color: "var(--text)" }}>
                {section.title}
              </h2>
            )}
            {section.paragraphs?.map((p, i) => (
              <p key={i} className="text-base leading-[1.85] mb-4" style={{ color: "var(--sub)" }}>{p}</p>
            ))}
            {section.bullets && section.bullets.length > 0 && (
              <ul className="space-y-2.5 list-none p-0 mb-4">
                {section.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-base leading-relaxed" style={{ color: "var(--sub)" }}>
                    <span style={{ color: "var(--a1)" }}>→</span>
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {section.quote && (
              <blockquote
                className="my-6 px-5 py-3 rounded-r-lg italic text-base leading-relaxed"
                style={{
                  borderLeft: "3px solid var(--a1)",
                  background: "rgba(232,67,147,.05)",
                  color: "var(--sub)",
                }}
              >
                {section.quote}
              </blockquote>
            )}
          </section>
        ))}

        <div className="hdivider" />
        <div className="text-center mb-12">
          <p className="mb-6" style={{ color: "var(--sub)" }}>Enjoyed this story?</p>
          <Link href="/blog" className="btn-outline">Read more posts →</Link>
        </div>
      </article>
    </main>
  );
}
