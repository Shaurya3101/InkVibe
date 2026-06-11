"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Flame, Tag, ArrowUpRight } from "lucide-react";

interface TrendingBlog {
  _id: string;
  title: string;
  slug: string;
  views: number;
  totalLikes: number;
  author: {
    name: string;
    username: string;
  };
}

export default function Sidebar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingBlogs, setTrendingBlogs] = useState<TrendingBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const popularCategories = [
    "technology",
    "design",
    "philosophy",
    "productivity",
    "creativity",
    "lifestyle",
  ];

  useEffect(() => {
    fetch("/api/blogs?trending=true&limit=5")
      .then((res) => res.json())
      .then((data) => {
        if (data.blogs) {
          setTrendingBlogs(data.blogs);
        }
      })
      .catch((err) => console.error("Error fetching trending blogs:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <aside className="w-full space-y-8 lg:sticky lg:top-24">
      
      {/* Dynamic Search Box */}
      <div className="p-6 rounded-2xl border border-borderCol-light/80 dark:border-borderCol-dark/80 bg-canvas-cardLight dark:bg-canvas-cardDark/30">
        <h3 className="font-serif text-base font-bold text-ink-light dark:text-ink-dark flex items-center mb-4">
          <Search className="w-4 h-4 mr-2 text-accent" />
          Explore InkVibe
        </h3>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search titles, tags, writers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs px-4 py-3 rounded-xl border border-borderCol-light dark:border-borderCol-dark bg-transparent text-ink-light dark:text-ink-dark focus:outline-none focus:border-accent transition-colors"
          />
          <button type="submit" className="absolute right-3 top-3 text-stone-400 hover:text-accent transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Category Pills Filters */}
      <div className="p-6 rounded-2xl border border-borderCol-light/80 dark:border-borderCol-dark/80 bg-canvas-cardLight dark:bg-canvas-cardDark/30">
        <h3 className="font-serif text-base font-bold text-ink-light dark:text-ink-dark flex items-center mb-4">
          <Tag className="w-4 h-4 mr-2 text-accent" />
          Popular Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularCategories.map((category) => (
            <Link
              key={category}
              href={`/search?tag=${category}`}
              className="bg-stone-50 dark:bg-stone-900 border border-borderCol-light dark:border-borderCol-dark text-stone-600 dark:text-stone-300 px-3 py-1.5 rounded-full text-xs font-medium hover:border-accent hover:text-accent transition-colors"
            >
              #{category}
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Posts Widgets */}
      <div className="p-6 rounded-2xl border border-borderCol-light/80 dark:border-borderCol-dark/80 bg-canvas-cardLight dark:bg-canvas-cardDark/30">
        <h3 className="font-serif text-base font-bold text-ink-light dark:text-ink-dark flex items-center mb-4">
          <Flame className="w-4 h-4 mr-2 text-accent" />
          Trending Discussions
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="animate-pulse space-y-2">
                <div className="h-3.5 bg-stone-100 dark:bg-stone-900 rounded w-5/6"></div>
                <div className="h-2.5 bg-stone-100 dark:bg-stone-900 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : trendingBlogs.length > 0 ? (
          <div className="space-y-5">
            {trendingBlogs.map((blog, idx) => (
              <div key={blog._id} className="flex space-x-3 group">
                <span className="font-serif text-3xl font-bold text-accent/20 dark:text-accent/10 group-hover:text-accent/40 transition-colors leading-none">
                  0{idx + 1}
                </span>
                <div className="space-y-1">
                  <Link href={`/blog/${blog.slug}`} className="font-sans text-sm font-semibold text-ink-light dark:text-ink-dark hover:text-accent dark:hover:text-accent transition-colors line-clamp-2">
                    {blog.title}
                  </Link>
                  <div className="flex items-center text-[10px] text-mutedText-light dark:text-mutedText-dark space-x-2">
                    <span>By @{blog.author.username}</span>
                    <span>•</span>
                    <span>{blog.views} reads</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-mutedText-light dark:text-mutedText-dark italic py-2">
            No trending articles found.
          </p>
        )}
      </div>

    </aside>
  );
}
