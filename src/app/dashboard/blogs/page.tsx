import React from "react";
import dbConnect from "@/lib/db";
import Blog from "@/lib/models/Blog";
import { auth } from "@/lib/auth";
import ManageBlogsClient from "@/components/ManageBlogsClient";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default async function ManageBlogsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  await dbConnect();

  // Retrieve all blogs authored by this user
  const blogsRaw = await Blog.find({ author: userId }).sort({ createdAt: -1 });

  // Convert Mongoose documents into plain JSON for safety in client props
  const blogs = JSON.parse(JSON.stringify(blogsRaw));

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
              Manage your published articles and raw drafts.
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

        {/* Dashboard Navigation */}
        <div className="flex space-x-6 border-b border-borderCol-light/30 dark:border-borderCol-dark/30 pb-4 text-xs font-semibold text-stone-500 dark:text-stone-400">
          <Link href="/dashboard" className="hover:text-accent transition-colors pb-4 -mb-4">
            Analytics Overview
          </Link>
          <Link href="/dashboard/blogs" className="text-accent border-b border-accent pb-4 -mb-4">
            Manage Stories
          </Link>
          <Link href="/profile/edit" className="hover:text-accent transition-colors pb-4 -mb-4">
            Profile Preferences
          </Link>
        </div>

        {/* Client Management Panel */}
        <ManageBlogsClient initialBlogs={blogs} />

      </div>
    </div>
  );
}
