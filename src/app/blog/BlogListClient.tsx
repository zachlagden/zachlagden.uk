"use client";

import { useState, useCallback } from "react";
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogTagBadge from "@/components/blog/BlogTagBadge";
import BlogSearch from "@/components/blog/BlogSearch";
import BlogPagination from "@/components/blog/BlogPagination";
import { BlogPostSerialized } from "@/types/blog";

interface BlogListClientProps {
  initialPosts: BlogPostSerialized[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  tags: string[];
  activeTag?: string;
}

export default function BlogListClient({
  initialPosts,
  initialTotal,
  initialPage,
  initialTotalPages,
  tags,
  activeTag,
}: BlogListClientProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [selectedTag, setSelectedTag] = useState(activeTag || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(
    async (newPage: number, tag: string, search: string) => {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(newPage),
        limit: "10",
      });
      if (tag) params.set("tag", tag);
      if (search) params.set("search", search);

      const res = await fetch(`/api/blog/posts?${params}`);
      const data = await res.json();

      setPosts(data.posts);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setLoading(false);
    },
    [],
  );

  const handleTagClick = (tag: string) => {
    const newTag = selectedTag === tag ? "" : tag;
    setSelectedTag(newTag);
    void fetchPosts(1, newTag, searchQuery);
  };

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      void fetchPosts(1, selectedTag, query);
    },
    [selectedTag, fetchPosts],
  );

  const handlePageChange = (newPage: number) => {
    void fetchPosts(newPage, selectedTag, searchQuery);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const featured = posts[0];
  const rest = posts.slice(1);

  if (total === 0 && !searchQuery && !selectedTag) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-0 py-16">
        <h1 className="text-4xl font-heading font-bold tracking-tight mb-4">
          Blog
        </h1>
        <p className="text-neutral-500 text-lg">
          No posts yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-0 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-heading font-bold tracking-tight mb-2">
          Blog
        </h1>
        <p className="text-neutral-500">
          Thoughts on development, technology, and building things.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <BlogSearch onSearch={handleSearch} />
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((tag) => (
            <button key={tag} onClick={() => handleTagClick(tag)}>
              <BlogTagBadge tag={tag} active={selectedTag === tag} />
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-neutral-100 rounded-lg h-48"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-neutral-500 text-center py-12">
          No posts found matching your search.
        </p>
      ) : (
        <>
          {featured && <BlogPostCard post={featured} featured index={0} />}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {rest.map((post, i) => (
                <BlogPostCard key={post._id} post={post} index={i + 1} />
              ))}
            </div>
          )}
        </>
      )}

      <BlogPagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
