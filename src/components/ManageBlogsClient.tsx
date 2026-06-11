"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Edit, Trash2, Eye, FileText, BookOpen, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface BlogData {
  _id: string;
  title: string;
  slug: string;
  banner?: string;
  draft: boolean;
  views: number;
  totalLikes: number;
  totalComments: number;
  createdAt: string;
  publishedAt?: string;
}

interface ManageBlogsClientProps {
  initialBlogs: BlogData[];
}

export default function ManageBlogsClient({ initialBlogs }: ManageBlogsClientProps) {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogData[]>(initialBlogs);
  const [activeTab, setActiveTab] = useState<"published" | "drafts">("published");

  const filteredBlogs = blogs.filter((b) => {
    if (activeTab === "published") return !b.draft;
    return b.draft;
  });

  const handleDelete = async (slug: string, title: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${title}"?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/blogs/${slug}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete article");
      }

      toast.success("Article deleted successfully");
      setBlogs(blogs.filter((b) => b.slug !== slug));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete article");
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Tabs triggers */}
      <div className="flex border-b border-borderCol-light/80 dark:border-borderCol-dark/80 pb-3 gap-6">
        <button
          onClick={() => setActiveTab("published")}
          className={`flex items-center space-x-1.5 pb-3 -mb-3.5 text-xs font-semibold transition-all ${
            activeTab === "published"
              ? "text-accent border-b-2 border-accent"
              : "text-stone-500 hover:text-accent"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Published Articles ({blogs.filter((b) => !b.draft).length})</span>
        </button>
        <button
          onClick={() => setActiveTab("drafts")}
          className={`flex items-center space-x-1.5 pb-3 -mb-3.5 text-xs font-semibold transition-all ${
            activeTab === "drafts"
              ? "text-accent border-b-2 border-accent"
              : "text-stone-500 hover:text-accent"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Drafts ({blogs.filter((b) => b.draft).length})</span>
        </button>
      </div>

      {/* Articles List */}
      {filteredBlogs.length > 0 ? (
        <div className="space-y-4">
          {filteredBlogs.map((blog) => (
            <div
              key={blog._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-borderCol-light/50 dark:border-borderCol-dark/50 bg-canvas-cardLight dark:bg-canvas-cardDark/10 hover:border-accent/20 transition-all gap-4"
            >
              <div className="flex items-start space-x-4 min-w-0">
                {blog.banner && (
                  <div className="hidden sm:block w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-borderCol-light/25 bg-stone-50">
                    <img src={blog.banner} alt={blog.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="min-w-0 space-y-1">
                  <h3 className="font-sans text-sm font-semibold text-ink-light dark:text-ink-dark line-clamp-1">
                    {blog.title}
                  </h3>
                  <p className="text-[10px] text-mutedText-light dark:text-mutedText-dark font-light">
                    {activeTab === "published"
                      ? `Published ${new Date(blog.publishedAt || "").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                      : `Created ${new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                  </p>
                  
                  {activeTab === "published" && (
                    <div className="flex items-center space-x-3 text-[10px] text-stone-500 mt-1">
                      <span>{blog.views} views</span>
                      <span>•</span>
                      <span>{blog.totalLikes} likes</span>
                      <span>•</span>
                      <span>{blog.totalComments} comments</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons panel */}
              <div className="flex items-center justify-end space-x-2.5">
                {activeTab === "published" && (
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="p-2 rounded-full border border-borderCol-light/60 dark:border-borderCol-dark/60 text-stone-600 dark:text-stone-400 hover:text-accent hover:border-accent transition-colors"
                    title="View post"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  href={`/write?edit=${blog.slug}`}
                  className="p-2 rounded-full border border-borderCol-light/60 dark:border-borderCol-dark/60 text-stone-600 dark:text-stone-400 hover:text-accent hover:border-accent transition-colors"
                  title="Edit post"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(blog.slug, blog.title)}
                  className="p-2 rounded-full border border-borderCol-light/60 dark:border-borderCol-dark/60 text-stone-600 dark:text-stone-400 hover:text-red-500 hover:border-red-500 transition-colors"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-borderCol-light dark:border-borderCol-dark rounded-2xl p-8 bg-stone-50/10">
          <p className="text-sm text-mutedText-light dark:text-mutedText-dark italic mb-4">
            No {activeTab} articles found.
          </p>
          <Link
            href="/write"
            className="inline-flex items-center bg-accent hover:bg-accent-hover text-stone-950 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Begin a Draft
          </Link>
        </div>
      )}

    </div>
  );
}
