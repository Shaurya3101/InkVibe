import React from "react";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { auth } from "@/lib/auth";
import EditProfileClient from "@/components/EditProfileClient";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EditProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Protect on server-side just in case
  if (!userId) {
    redirect("/login");
  }

  await dbConnect();

  // Find user by ID
  const userRaw = await User.findById(userId)
    .select("name avatar bio social_links");

  if (!userRaw) {
    redirect("/login");
  }

  const user = JSON.parse(JSON.stringify(userRaw));

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
              Customize your profile metadata and contact information.
            </p>
          </div>
        </div>

        {/* Dashboard Navigation */}
        <div className="flex space-x-6 border-b border-borderCol-light/30 dark:border-borderCol-dark/30 pb-4 text-xs font-semibold text-stone-500 dark:text-stone-400">
          <Link href="/dashboard" className="hover:text-accent transition-colors pb-4 -mb-4">
            Analytics Overview
          </Link>
          <Link href="/dashboard/blogs" className="hover:text-accent transition-colors pb-4 -mb-4">
            Manage Stories
          </Link>
          <Link href="/profile/edit" className="text-accent border-b border-accent pb-4 -mb-4">
            Profile Preferences
          </Link>
        </div>

        {/* Profile Form */}
        <div className="p-6 md:p-8 rounded-3xl border border-borderCol-light dark:border-borderCol-dark bg-canvas-cardLight dark:bg-canvas-cardDark/30 max-w-4xl">
          <EditProfileClient initialUser={user} />
        </div>

      </div>
    </div>
  );
}
