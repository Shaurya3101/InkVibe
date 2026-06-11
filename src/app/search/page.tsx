import React from "react";
import dbConnect from "@/lib/db";
import Blog from "@/lib/models/Blog";
import User from "@/lib/models/User";
import BlogCard from "@/components/BlogCard";
import Link from "next/link";
import { Search, Tag, User as UserIcon, BookOpen } from "lucide-react";

interface SearchProps {
  searchParams: {
    q?: string;
    tag?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchProps) {
  const queryText = searchParams.q || "";
  const tagFilter = searchParams.tag || "";

  await dbConnect();

  let blogs = [];
  let users = [];
  let title = "Search InkVibe";
  let subtitle = "Discover articles, subjects, and writers.";

  if (queryText) {
    title = `Search results for "${queryText}"`;
    subtitle = `Found matching articles and writer accounts.`;

    // 1. Text search on Blogs (only published ones)
    blogs = await Blog.find({
      draft: false,
      $text: { $search: queryText }
    })
      .sort({ publishedAt: -1 })
      .populate("author", "name username avatar bio")
      .select("title des banner tags slug totalLikes totalComments views publishedAt createdAt");

    // 2. Partial match search on Users
    const searchRegex = new RegExp(queryText, "i");
    users = await User.find({
      $or: [
        { name: searchRegex },
        { username: searchRegex },
        { bio: searchRegex }
      ]
    })
      .limit(6)
      .select("name username avatar bio followers");
  } else if (tagFilter) {
    title = `Category: #${tagFilter}`;
    subtitle = `Articles filed under the topic of ${tagFilter}.`;

    // Fetch blogs matching this specific tag
    blogs = await Blog.find({
      draft: false,
      tags: tagFilter
    })
      .sort({ publishedAt: -1 })
      .populate("author", "name username avatar bio")
      .select("title des banner tags slug totalLikes totalComments views publishedAt createdAt");
  }

  return (
    <div className="flex-grow bg-canvas-light dark:bg-canvas-dark py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Title */}
        <div className="border-b border-borderCol-light/50 dark:border-borderCol-dark/50 pb-8 space-y-2">
          <h1 className="font-serif text-3xl font-bold text-ink-light dark:text-ink-dark">
            {title}
          </h1>
          <p className="text-sm text-mutedText-light dark:text-mutedText-dark font-light">
            {subtitle}
          </p>
        </div>

        {/* Local Search Form (If no search triggered yet, or for a new attempt) */}
        {!queryText && !tagFilter && (
          <div className="max-w-xl mx-auto py-12 text-center space-y-6">
            <Search className="w-12 h-12 text-accent mx-auto" />
            <form action="/search" method="GET" className="relative">
              <input
                type="text"
                name="q"
                required
                placeholder="What are you looking for?"
                className="w-full text-base px-6 py-4 rounded-2xl border border-borderCol-light dark:border-borderCol-dark bg-canvas-cardLight dark:bg-canvas-cardDark/30 text-ink-light dark:text-ink-dark focus:outline-none focus:border-accent transition-colors shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-4 top-3.5 bg-accent hover:bg-accent-hover text-stone-950 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Display grids */}
        {(queryText || tagFilter) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Match Blogs */}
            <div className="lg:col-span-8 space-y-6">
              <h2 className="font-serif text-xl font-bold text-ink-light dark:text-ink-dark flex items-center border-b border-borderCol-light/30 dark:border-borderCol-dark/30 pb-3">
                <BookOpen className="w-4.5 h-4.5 mr-2 text-accent" />
                Articles ({blogs.length})
              </h2>

              {blogs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {blogs.map((blog: any) => (
                    <BlogCard key={blog._id} blog={JSON.parse(JSON.stringify(blog))} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-borderCol-light dark:border-borderCol-dark rounded-2xl bg-stone-50/10">
                  <p className="text-sm text-mutedText-light dark:text-mutedText-dark italic">
                    No matching articles found. Try different keywords.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Match Writers (Only shown on text queries, not tags) */}
            {queryText && (
              <div className="lg:col-span-4 space-y-6">
                <h2 className="font-serif text-xl font-bold text-ink-light dark:text-ink-dark flex items-center border-b border-borderCol-light/30 dark:border-borderCol-dark/30 pb-3">
                  <UserIcon className="w-4.5 h-4.5 mr-2 text-accent" />
                  Writers ({users.length})
                </h2>

                {users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <Link
                        key={user._id}
                        href={`/profile/${user.username}`}
                        className="flex items-center space-x-4 p-4 rounded-xl border border-borderCol-light/50 dark:border-borderCol-dark/50 bg-canvas-cardLight dark:bg-canvas-cardDark/30 hover:border-accent/40 transition-all"
                      >
                        <img
                          src={user.avatar || "/default-avatar.png"}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-accent/20"
                        />
                        <div className="flex-grow min-w-0">
                          <h4 className="text-sm font-semibold text-ink-light dark:text-ink-dark truncate">
                            {user.name}
                          </h4>
                          <p className="text-xs text-mutedText-light dark:text-mutedText-dark truncate">
                            @{user.username}
                          </p>
                          {user.bio && (
                            <p className="text-xs text-mutedText-light dark:text-mutedText-dark mt-1 line-clamp-1">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-borderCol-light dark:border-borderCol-dark rounded-2xl bg-stone-50/10">
                    <p className="text-xs text-mutedText-light dark:text-mutedText-dark italic">
                      No matching writers found.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
