import React from "react";
import Link from "next/link";
import { Heart, MessageSquare, Eye, Calendar } from "lucide-react";

interface BlogCardProps {
  blog: {
    title: string;
    des?: string;
    banner?: string;
    tags: string[];
    slug: string;
    totalLikes: number;
    totalComments: number;
    views: number;
    publishedAt?: string;
    createdAt: string;
    author: {
      name: string;
      username: string;
      avatar: string;
    };
  };
}

export default function BlogCard({ blog }: BlogCardProps) {
  const publishedDate = new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  return (
    <article className="group flex flex-col space-y-3 p-4 rounded-2xl border border-borderCol-light/80 dark:border-borderCol-dark/80 bg-canvas-cardLight dark:bg-canvas-cardDark/30 hover:border-accent/30 dark:hover:border-accent/30 transition-all duration-300">
      
      {/* Cover Image */}
      {blog.banner && (
        <Link href={`/blog/${blog.slug}`} className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-borderCol-light/30 dark:border-borderCol-dark/30">
          <img
            src={blog.banner}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            loading="lazy"
          />
        </Link>
      )}

      {/* Content Area */}
      <div className="flex-grow flex flex-col space-y-2.5">
        
        {/* Category Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {blog.tags.slice(0, 2).map((tag, idx) => (
              <Link
                key={idx}
                href={`/search?tag=${encodeURIComponent(tag)}`}
                className="text-[10px] font-sans font-semibold tracking-wider text-accent uppercase hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/blog/${blog.slug}`}>
          <h3 className="font-serif text-xl font-bold tracking-tight text-ink-light dark:text-ink-dark group-hover:text-accent transition-colors line-clamp-2">
            {blog.title}
          </h3>
        </Link>

        {/* Description Description */}
        {blog.des && (
          <p className="text-sm text-mutedText-light dark:text-mutedText-dark font-light line-clamp-2 leading-relaxed">
            {blog.des}
          </p>
        )}
      </div>

      {/* Metadata Bottom */}
      <div className="pt-3 border-t border-borderCol-light/50 dark:border-borderCol-dark/50 flex items-center justify-between">
        
        {/* Author Avatar & Username */}
        <Link href={`/profile/${blog.author.username}`} className="flex items-center space-x-2">
          <img
            src={blog.author.avatar || "/default-avatar.png"}
            alt={blog.author.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(blog.author.name)}`;
            }}
            className="w-6 h-6 rounded-full border border-accent/20 object-cover"
          />
          <div className="flex flex-col text-[11px] leading-tight">
            <span className="font-medium text-stone-700 dark:text-stone-300 hover:text-accent transition-colors">
              {blog.author.name}
            </span>
            <span className="text-mutedText-light dark:text-mutedText-dark text-[9px]">
              {publishedDate}
            </span>
          </div>
        </Link>

        {/* Engagement Stats */}
        <div className="flex items-center space-x-3 text-stone-500 dark:text-stone-400 text-xs">
          <span className="flex items-center" title="Reads views">
            <Eye className="w-3.5 h-3.5 mr-1" />
            {blog.views}
          </span>
          <span className="flex items-center" title="Likes count">
            <Heart className="w-3.5 h-3.5 mr-1 fill-stone-500/10 dark:fill-stone-400/10" />
            {blog.totalLikes}
          </span>
          <span className="flex items-center" title="Comments count">
            <MessageSquare className="w-3.5 h-3.5 mr-1" />
            {blog.totalComments}
          </span>
        </div>

      </div>

    </article>
  );
}
