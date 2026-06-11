import React from "react";
import dbConnect from "@/lib/db";
import Blog from "@/lib/models/Blog";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  BookOpen, 
  FileText, 
  User, 
  PlusCircle, 
  ArrowUpRight 
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  await dbConnect();

  // Retrieve all blogs written by the user
  const blogs = await Blog.find({ author: userId });

  // Calculate analytics totals
  const totalViews = blogs.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalLikes = blogs.reduce((acc, curr) => acc + (curr.totalLikes || 0), 0);
  const totalComments = blogs.reduce((acc, curr) => acc + (curr.totalComments || 0), 0);
  
  const publishedCount = blogs.filter((b) => !b.draft).length;
  const draftCount = blogs.filter((b) => b.draft).length;

  // Sort user's blogs by views to list top performing ones
  const topBlogs = [...blogs]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return (
    <div className="flex-grow bg-canvas-light dark:bg-canvas-dark transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-borderCol-light/50 dark:border-borderCol-dark/50 pb-6 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-ink-light dark:text-ink-dark">
              Author Dashboard
            </h1>
            <p className="text-xs text-mutedText-light dark:text-mutedText-dark font-light mt-1">
              Analyze your readers engagement and post performance.
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/write"
              className="bg-accent hover:bg-accent-hover text-stone-950 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide flex items-center transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Write New Post
            </Link>
          </div>
        </div>

        {/* Dashboard Nav bar links */}
        <div className="flex space-x-6 border-b border-borderCol-light/30 dark:border-borderCol-dark/30 pb-4 text-xs font-semibold text-stone-500 dark:text-stone-400">
          <Link href="/dashboard" className="text-accent border-b border-accent pb-4 -mb-4">
            Analytics Overview
          </Link>
          <Link href="/dashboard/blogs" className="hover:text-accent transition-colors pb-4 -mb-4">
            Manage Stories
          </Link>
          <Link href="/profile/edit" className="hover:text-accent transition-colors pb-4 -mb-4">
            Profile Preferences
          </Link>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card: Views */}
          <div className="p-6 rounded-2xl border border-borderCol-light dark:border-borderCol-dark bg-canvas-cardLight dark:bg-canvas-cardDark/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Total Reads</span>
              <Eye className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-serif font-bold text-ink-light dark:text-ink-dark">{totalViews}</h3>
              <p className="text-[10px] text-mutedText-light dark:text-mutedText-dark">Across all published pages</p>
            </div>
          </div>

          {/* Card: Likes */}
          <div className="p-6 rounded-2xl border border-borderCol-light dark:border-borderCol-dark bg-canvas-cardLight dark:bg-canvas-cardDark/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Total Likes</span>
              <Heart className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-serif font-bold text-ink-light dark:text-ink-dark">{totalLikes}</h3>
              <p className="text-[10px] text-mutedText-light dark:text-mutedText-dark font-light">From active reader likes</p>
            </div>
          </div>

          {/* Card: Comments */}
          <div className="p-6 rounded-2xl border border-borderCol-light dark:border-borderCol-dark bg-canvas-cardLight dark:bg-canvas-cardDark/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Discussion Responses</span>
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-serif font-bold text-ink-light dark:text-ink-dark">{totalComments}</h3>
              <p className="text-[10px] text-mutedText-light dark:text-mutedText-dark font-light">Replies and comments threads</p>
            </div>
          </div>

          {/* Card: Count Articles */}
          <div className="p-6 rounded-2xl border border-borderCol-light dark:border-borderCol-dark bg-canvas-cardLight dark:bg-canvas-cardDark/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Drafts vs. Published</span>
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-serif font-bold text-ink-light dark:text-ink-dark">
                {publishedCount} <span className="text-xs text-mutedText-light dark:text-mutedText-dark font-light">published</span> / {draftCount} <span className="text-xs text-mutedText-light dark:text-mutedText-dark font-light">drafts</span>
              </h3>
              <p className="text-[10px] text-mutedText-light dark:text-mutedText-dark font-light">Total articles created: {blogs.length}</p>
            </div>
          </div>

        </div>

        {/* Detail lists */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          
          {/* Top performing blogs list */}
          <div className="lg:col-span-8 p-6 md:p-8 rounded-2xl border border-borderCol-light dark:border-borderCol-dark bg-canvas-cardLight dark:bg-canvas-cardDark/30 space-y-6">
            <div className="flex items-center space-x-2">
              <span className="h-[1px] w-6 bg-accent"></span>
              <h3 className="font-serif text-lg font-bold text-ink-light dark:text-ink-dark">
                Top Performing Stories
              </h3>
            </div>

            {topBlogs.length > 0 ? (
              <div className="space-y-4">
                {topBlogs.map((blog) => (
                  <div
                    key={blog._id.toString()}
                    className="flex items-center justify-between p-4 rounded-xl border border-borderCol-light/50 dark:border-borderCol-dark/50 bg-stone-50/20 hover:border-accent/30 transition-all group"
                  >
                    <div className="min-w-0 pr-4 space-y-1">
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="font-sans text-sm font-semibold text-ink-light dark:text-ink-dark group-hover:text-accent transition-colors line-clamp-1"
                      >
                        {blog.title}
                      </Link>
                      <div className="flex items-center text-[10px] text-mutedText-light dark:text-mutedText-dark space-x-3">
                        <span>Created {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span>•</span>
                        <span className={blog.draft ? "text-amber-500 font-semibold" : "text-emerald-500 font-semibold"}>
                          {blog.draft ? "Draft" : "Published"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-xs text-stone-500 dark:text-stone-400">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-ink-light dark:text-ink-dark flex items-center">
                          <Eye className="w-3.5 h-3.5 mr-1 text-accent" />
                          {blog.views}
                        </span>
                        <span className="text-[9px] text-stone-400">Reads</span>
                      </div>
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="text-stone-700 dark:text-stone-300 hover:text-accent transition-colors"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-mutedText-light dark:text-mutedText-dark italic">
                You have not created any articles yet.
              </p>
            )}
          </div>

          {/* Quick Actions and shortcut tips */}
          <div className="lg:col-span-4 p-6 rounded-2xl border border-borderCol-light dark:border-borderCol-dark bg-canvas-cardLight dark:bg-canvas-cardDark/30 space-y-6">
            <div className="flex items-center space-x-2">
              <span className="h-[1px] w-6 bg-accent"></span>
              <h3 className="font-serif text-lg font-bold text-ink-light dark:text-ink-dark">
                Quick Shortcuts
              </h3>
            </div>
            
            <div className="flex flex-col space-y-3.5 text-sm font-medium">
              <Link
                href="/write"
                className="flex items-center p-3 rounded-xl border border-borderCol-light/50 dark:border-borderCol-dark/50 hover:border-accent text-stone-750 dark:text-stone-250 transition-all"
              >
                <PlusCircle className="w-4 h-4 mr-2.5 text-accent" />
                <span>Begin a new draft</span>
              </Link>
              <Link
                href="/dashboard/blogs"
                className="flex items-center p-3 rounded-xl border border-borderCol-light/50 dark:border-borderCol-dark/50 hover:border-accent text-stone-750 dark:text-stone-250 transition-all"
              >
                <FileText className="w-4 h-4 mr-2.5 text-accent" />
                <span>Manage draft stories</span>
              </Link>
              <Link
                href="/profile/edit"
                className="flex items-center p-3 rounded-xl border border-borderCol-light/50 dark:border-borderCol-dark/50 hover:border-accent text-stone-750 dark:text-stone-250 transition-all"
              >
                <User className="w-4 h-4 mr-2.5 text-accent" />
                <span>Customize profile card</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
