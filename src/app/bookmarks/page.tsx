import React from "react";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import Blog from "@/lib/models/Blog"; // Need to import Blog for Mongoose model registry
import { auth } from "@/lib/auth";
import BlogCard from "@/components/BlogCard";
import { redirect } from "next/navigation";
import { Bookmark, BookOpen } from "lucide-react";

export default async function BookmarksPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  await dbConnect();

  // Fetch user and populate their bookmarked blogs
  const user = await User.findById(userId).populate({
    path: "bookmarks",
    populate: {
      path: "author",
      select: "name username avatar bio",
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Convert populated Mongoose documents to JSON
  const bookmarkedBlogs = JSON.parse(JSON.stringify(user.bookmarks || []));

  return (
    <div className="flex-grow bg-canvas-light dark:bg-canvas-dark transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="border-b border-borderCol-light/50 dark:border-borderCol-dark/50 pb-6">
          <h1 className="font-serif text-3xl font-bold text-ink-light dark:text-ink-dark flex items-center">
            <Bookmark className="w-7 h-7 mr-2 text-accent" />
            Saved Bookmarks
          </h1>
          <p className="text-xs text-mutedText-light dark:text-mutedText-dark font-light mt-1">
            Access your curated library of bookmarked posts.
          </p>
        </div>

        {/* Bookmarks Grid Feed */}
        {bookmarkedBlogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedBlogs.map((blog: any) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-borderCol-light dark:border-borderCol-dark rounded-3xl p-8 bg-stone-50/10 max-w-xl mx-auto space-y-4">
            <BookOpen className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto" />
            <h3 className="font-serif text-base font-bold text-ink-light dark:text-ink-dark">
              No Bookmarks Saved
            </h3>
            <p className="text-xs text-mutedText-light dark:text-mutedText-dark font-light max-w-xs mx-auto">
              Start exploring stories and bookmark them to keep them safe in this collection.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
