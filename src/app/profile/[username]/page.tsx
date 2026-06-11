import React from "react";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import Blog from "@/lib/models/Blog";
import { auth } from "@/lib/auth";
import BlogCard from "@/components/BlogCard";
import FollowButton from "@/components/FollowButton";
import Link from "next/link";
import { Globe, Calendar, Users, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface ProfileProps {
  params: {
    username: string;
  };
}

export default async function ProfilePage({ params }: ProfileProps) {
  const { username } = params;

  await dbConnect();

  // Retrieve user details
  const user = await User.findOne({ username })
    .select("name username email avatar bio social_links followers following createdAt");

  if (!user) {
    notFound();
  }

  // Check auth session
  const session = await auth();
  const currentUserId = session?.user?.id;
  const isSelf = currentUserId === user._id.toString();

  // Check if current user is following target user
  const isFollowing = currentUserId
    ? user.followers.some((id) => id.toString() === currentUserId)
    : false;

  // Retrieve published blogs authored by this writer
  const blogsRaw = await Blog.find({ author: user._id, draft: false })
    .sort({ publishedAt: -1 })
    .select("title des banner tags slug totalLikes totalComments views publishedAt createdAt");

  // Convert mongoose documents to JSON
  const blogs = JSON.parse(JSON.stringify(blogsRaw));
  const userData = JSON.parse(JSON.stringify(user));
  
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex-grow bg-canvas-light dark:bg-canvas-dark transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Profile Card Header */}
        <div className="p-6 md:p-8 rounded-3xl border border-borderCol-light/80 dark:border-borderCol-dark/80 bg-canvas-cardLight dark:bg-canvas-cardDark/30 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          
          {/* Avatar */}
          <img
            src={userData.avatar || "/default-avatar.png"}
            alt={userData.name}
            className="w-24 h-24 rounded-full border border-accent/20 object-cover shadow-sm"
          />

          {/* Details */}
          <div className="flex-grow text-center md:text-left space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-ink-light dark:text-ink-dark">
                  {userData.name}
                </h1>
                <p className="text-xs text-mutedText-light dark:text-mutedText-dark font-light mt-0.5">
                  @{userData.username}
                </p>
              </div>

              {/* Action Button follow or edit */}
              <div className="flex justify-center md:justify-end">
                {isSelf ? (
                  <Link
                    href="/profile/edit"
                    className="border border-borderCol-light dark:border-borderCol-dark hover:border-accent text-stone-750 dark:text-stone-250 hover:text-accent px-5 py-2 rounded-full text-xs font-semibold transition-colors"
                  >
                    Edit Profile
                  </Link>
                ) : (
                  <FollowButton
                    username={userData.username}
                    initialFollowing={isFollowing}
                  />
                )}
              </div>
            </div>

            {/* Bio text */}
            {userData.bio && (
              <p className="text-sm text-stone-600 dark:text-stone-400 font-light leading-relaxed max-w-2xl">
                {userData.bio}
              </p>
            )}

            {/* Counts & Metas */}
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-mutedText-light dark:text-mutedText-dark font-light">
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-stone-400" />
                <span className="font-semibold text-ink-light dark:text-ink-dark mr-1">{userData.followers.length}</span> followers
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-stone-400" />
                <span className="font-semibold text-ink-light dark:text-ink-dark mr-1">{userData.following.length}</span> following
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-stone-400" />
                Joined {joinDate}
              </span>
            </div>

            {/* Social Links */}
            {userData.social_links && (
              <div className="flex justify-center md:justify-start gap-4 text-stone-500 dark:text-stone-400">
                {userData.social_links.github && (
                  <a href={userData.social_links.github} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                    <GithubIcon className="w-4.5 h-4.5" />
                  </a>
                )}
                {userData.social_links.twitter && (
                  <a href={userData.social_links.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                    <TwitterIcon className="w-4.5 h-4.5" />
                  </a>
                )}
                {userData.social_links.website && (
                  <a href={userData.social_links.website} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                    <Globe className="w-4.5 h-4.5" />
                  </a>
                )}
                {userData.social_links.instagram && (
                  <a href={userData.social_links.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                    <InstagramIcon className="w-4.5 h-4.5" />
                  </a>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Stories written Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 border-b border-borderCol-light/50 dark:border-borderCol-dark/50 pb-3">
            <span className="h-[1px] w-6 bg-accent"></span>
            <h2 className="font-serif text-xl font-bold text-ink-light dark:text-ink-dark flex items-center">
              <BookOpen className="w-4.5 h-4.5 mr-2 text-accent" />
              Published Stories ({blogs.length})
            </h2>
          </div>

          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog: any) => {
                // Manually inject author metadata since populated details are not present on the blog objects fetched directly in profile route
                const blogWithAuthor = {
                  ...blog,
                  author: {
                    name: userData.name,
                    username: userData.username,
                    avatar: userData.avatar,
                  },
                };
                return <BlogCard key={blog._id} blog={blogWithAuthor} />;
              })}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-borderCol-light dark:border-borderCol-dark rounded-3xl p-8 bg-stone-50/10">
              <p className="text-sm text-mutedText-light dark:text-mutedText-dark italic">
                {userData.name} has not published any stories yet.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
