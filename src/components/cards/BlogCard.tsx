"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/types/blog";

const CAT_STYLES: Record<string, { bg: string; color: string }> = {
  article:   { bg: "rgba(249,115,22,.14)", color: "var(--a2)" },
  event:     { bg: "rgba(232,67,147,.14)", color: "var(--a1)" },
  growth:    { bg: "rgba(34,197,94,.14)",   color: "#22c55e" },
  community: { bg: "rgba(168,85,247,.14)",  color: "var(--a3)" },
  digital:   { bg: "rgba(6,182,212,.14)",   color: "#06b6d4" },
};

export default function BlogCard({
  post,
  featured = false,
}: {
  post: BlogPost;
  featured?: boolean;
}) {
  const style = CAT_STYLES[post.category] ?? CAT_STYLES.article;

  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -4 }}
      >
        <Link
          href={`/blog/${post.id}`}
          className="grid md:grid-cols-[1.1fr_1fr] gap-8 rounded-[18px] overflow-hidden cursor-pointer mb-8"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform duration-500 hover:scale-[1.04]" />
          </div>
          <div className="p-8 flex flex-col gap-3 justify-center">
            <span
              className="inline-block px-[.7rem] py-[.22rem] rounded-full text-[.6rem] font-mono uppercase tracking-wider w-fit"
              style={{ background: style.bg, color: style.color, fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}
            >
              ★ Featured · {post.category}
            </span>
            <h2 className="font-extrabold text-[1.55rem] leading-tight" style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", color: "var(--text)" }}>
              {post.title}
            </h2>
            <p className="text-sm leading-[1.7]" style={{ color: "var(--sub)" }}>{post.excerpt}</p>
            <div className="flex gap-[.8rem] text-[.66rem] font-mono mt-1" style={{ color: "var(--muted)", fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>
              <span>📅 {post.date}</span>
              <span>⏱ {post.readTime}</span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -6 }}
      transition-property="transform,box-shadow"
    >
      <Link
        href={`/blog/${post.id}`}
        className="block rounded-[15px] overflow-hidden cursor-pointer h-full"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="relative h-[170px] overflow-hidden">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform duration-500 hover:scale-[1.06]" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
        <div className="p-[1.2rem_1.3rem_1.4rem] flex flex-col gap-2">
          <span
            className="inline-block px-[.7rem] py-[.22rem] rounded-full text-[.6rem] font-mono uppercase tracking-wider w-fit"
            style={{ background: style.bg, color: style.color, fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}
          >
            {post.category}
          </span>
          <h3 className="font-bold text-base leading-tight" style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", color: "var(--text)" }}>{post.title}</h3>
          <p className="text-[.8rem] leading-[1.6] line-clamp-3" style={{ color: "var(--sub)" }}>{post.excerpt}</p>
          <div className="flex gap-[.8rem] text-[.66rem] font-mono mt-[.3rem]" style={{ color: "var(--muted)", fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>
            <span>{post.date}</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
