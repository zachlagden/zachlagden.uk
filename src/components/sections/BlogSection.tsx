"use client";

import React from "react";
import Link from "next/link";
import { Newspaper, ArrowRight } from "lucide-react";
import Section from "../ui/Section";
import BlogPostCard from "../blog/BlogPostCard";
import { BlogPostSerialized } from "@/types/blog";

interface BlogSectionProps {
  posts: BlogPostSerialized[];
  sectionIndex?: number;
}

const BlogSection = React.forwardRef<HTMLElement, BlogSectionProps>(
  ({ posts, sectionIndex }, ref) => {
    return (
      <Section
        id="blog"
        title="Blog"
        icon={<Newspaper className="w-6 h-6" aria-hidden="true" />}
        ref={ref}
        sectionIndex={sectionIndex}
      >
        <div className="space-y-8">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <BlogPostCard key={post._id} post={post} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No posts yet. Check back soon!</p>
          )}
          <div className="flex justify-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium border border-neutral-200 rounded-lg hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
            >
              View entire blog
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Section>
    );
  },
);

BlogSection.displayName = "BlogSection";

export default BlogSection;
