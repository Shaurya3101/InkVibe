import React from "react";
import dbConnect from "@/lib/db";
import Blog from "@/lib/models/Blog";
import User from "@/lib/models/User";
import { auth } from "@/lib/auth";
import { parseTipTapToHtmlAndToc } from "@/lib/tiptap-parser";
import { calculateReadingTime } from "@/lib/utils";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import TableOfContents from "@/components/TableOfContents";
import LikeButton from "@/components/LikeButton";
import BookmarkButton from "@/components/BookmarkButton";
import FollowButton from "@/components/FollowButton";
import CommentsSection from "@/components/CommentsSection";
import BlogCard from "@/components/BlogCard";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Eye, Globe } from "lucide-react";
import { notFound } from "next/navigation";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface BlogPageProps {
  params: {
    slug: string;
  };
}

export default async function BlogReadingPage({ params }: BlogPageProps) {
  const { slug } = params;

  await dbConnect();

  // Find blog and increment views by 1
  const blog = (await Blog.findOneAndUpdate(
    { slug, draft: false },
    { $inc: { views: 1 } },
    { new: true }
  ).populate("author", "name username avatar bio followers social_links")) as any;

  if (!blog) {
    notFound();
  }

  // Parse session state to feed initial interactive values
  const session = await auth();
  const currentUserId = session?.user?.id;

  // 1. Initial liked state
  const initialLiked = currentUserId
    ? blog.likes.some((id: any) => id.toString() === currentUserId)
    : false;

  // 2. Initial bookmarked state
  let initialBookmarked = false;
  if (currentUserId) {
    const user = await User.findById(currentUserId).select("bookmarks");
    initialBookmarked = user
      ? user.bookmarks.some((id: any) => id.toString() === blog._id.toString())
      : false;
  }

  // 3. Initial following state
  const initialFollowing = currentUserId
    ? blog.author.followers.some((id: any) => id.toString() === currentUserId)
    : false;

  // Parse TipTap JSON to HTML & TOC outlines
  const { html: parsedHtml, toc } = parseTipTapToHtmlAndToc(blog.content);
  const readTime = calculateReadingTime(blog.content);

  // Fetch similar stories
  const similarBlogsRaw = await Blog.find({
    draft: false,
    tags: { $in: blog.tags },
    _id: { $ne: blog._id },
  })
    .limit(3)
    .populate("author", "name username avatar bio")
    .select("title des banner tags slug totalLikes totalComments views publishedAt createdAt");

  const similarBlogs = JSON.parse(JSON.stringify(similarBlogsRaw));

  return (
    <div className="flex-grow bg-canvas-light dark:bg-canvas-dark transition-colors duration-300 relative">
      
      {/* Scroll indicator */}
      <ReadingProgressBar />

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-mutedText-light dark:text-mutedText-dark hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Stories
          </Link>
        </div>

        {/* Dynamic Reader Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Outlines Left Sidebar (Sticky Table of Contents) */}
          <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 max-h-[80vh] overflow-y-auto pr-4">
            <TableOfContents toc={toc} />
          </div>

          {/* Core Content Middle Section */}
          <div className="lg:col-span-9 space-y-12">
            
            {/* Blog Headers */}
            <header className="space-y-6">
              
              {/* Category tag */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs font-sans font-bold tracking-wider text-accent uppercase"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Headline */}
              <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-ink-light dark:text-ink-dark leading-tight">
                {blog.title}
              </h1>

              {/* Sub descriptor */}
              {blog.des && (
                <p className="text-lg text-mutedText-light dark:text-mutedText-dark font-light leading-relaxed max-w-3xl">
                  {blog.des}
                </p>
              )}

              {/* Meta information details */}
              <div className="pt-4 border-t border-b border-borderCol-light/80 dark:border-borderCol-dark/80 py-4 flex flex-wrap items-center justify-between gap-4">
                
                {/* Author Info */}
                <div className="flex items-center space-x-3">
                  <Link href={`/profile/${blog.author.username}`}>
                    <img
                      src={blog.author.avatar || "/default-avatar.png"}
                      alt={blog.author.name}
                      className="w-10 h-10 rounded-full border border-accent/20 object-cover"
                    />
                  </Link>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/profile/${blog.author.username}`}
                        className="text-sm font-semibold text-ink-light dark:text-ink-dark hover:text-accent transition-colors"
                      >
                        {blog.author.name}
                      </Link>
                      
                      {/* Follow Button */}
                      {currentUserId !== blog.author._id.toString() && (
                        <FollowButton
                          username={blog.author.username}
                          initialFollowing={initialFollowing}
                        />
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-mutedText-light dark:text-mutedText-dark font-light mt-0.5">
                      <span>
                        {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" }
                        )}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {readTime} min read
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {blog.views} reads
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactions actions */}
                <div className="flex items-center space-x-2">
                  <LikeButton
                    slug={slug}
                    initialLikes={blog.totalLikes}
                    initialLiked={initialLiked}
                  />
                  <BookmarkButton
                    slug={slug}
                    initialBookmarked={initialBookmarked}
                  />
                </div>

              </div>

            </header>

            {/* Banner Cover Cover image */}
            {blog.banner && (
              <div className="aspect-[21/9] rounded-3xl overflow-hidden border border-borderCol-light/30 dark:border-borderCol-dark/30 shadow-sm">
                <img src={blog.banner} alt={blog.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Editorial Content body content */}
            <article className="prose max-w-none">
              <div
                className="tiptap-content"
                dangerouslySetInnerHTML={{ __html: parsedHtml }}
              />
            </article>

            {/* Author Profile card box */}
            <div className="bg-stone-50 dark:bg-stone-900/10 border border-borderCol-light/80 dark:border-borderCol-dark/80 p-6 md:p-8 rounded-3xl mt-12 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <img
                src={blog.author.avatar || "/default-avatar.png"}
                alt={blog.author.name}
                className="w-16 h-16 rounded-full border border-accent/20 object-cover"
              />
              <div className="flex-grow text-center md:text-left space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ink-light dark:text-ink-dark">
                      Written by {blog.author.name}
                    </h3>
                    <p className="text-xs text-mutedText-light dark:text-mutedText-dark font-light">
                      @{blog.author.username} • {blog.author.followers.length} followers
                    </p>
                  </div>
                  {currentUserId !== blog.author._id.toString() && (
                    <div className="flex justify-center md:justify-end">
                      <FollowButton
                        username={blog.author.username}
                        initialFollowing={initialFollowing}
                      />
                    </div>
                  )}
                </div>
                
                {blog.author.bio && (
                  <p className="text-sm text-stone-600 dark:text-stone-400 font-light leading-relaxed">
                    {blog.author.bio}
                  </p>
                )}

                {/* Social networks links */}
                {blog.author.social_links && (
                  <div className="flex justify-center md:justify-start gap-4 pt-2 text-stone-500 dark:text-stone-400">
                    {blog.author.social_links.github && (
                      <a href={blog.author.social_links.github} target="_blank" rel="noopener" className="hover:text-accent transition-colors">
                        <GithubIcon className="w-4 h-4" />
                      </a>
                    )}
                    {blog.author.social_links.twitter && (
                      <a href={blog.author.social_links.twitter} target="_blank" rel="noopener" className="hover:text-accent transition-colors">
                        <TwitterIcon className="w-4 h-4" />
                      </a>
                    )}
                    {blog.author.social_links.website && (
                      <a href={blog.author.social_links.website} target="_blank" rel="noopener" className="hover:text-accent transition-colors">
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                    {blog.author.social_links.instagram && (
                      <a href={blog.author.social_links.instagram} target="_blank" rel="noopener" className="hover:text-accent transition-colors">
                        <InstagramIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Comments Thread Section */}
            <div className="pt-12 border-t border-borderCol-light/80 dark:border-borderCol-dark/80">
              <CommentsSection
                blogSlug={slug}
                blogAuthorId={blog.author._id.toString()}
              />
            </div>

            {/* Similar Blog Recommendations Grid */}
            {similarBlogs.length > 0 && (
              <div className="pt-12 border-t border-borderCol-light/80 dark:border-borderCol-dark/80 space-y-6">
                <div className="flex items-center space-x-2">
                  <span className="h-[1px] w-6 bg-accent"></span>
                  <h3 className="font-serif text-lg font-bold text-ink-light dark:text-ink-dark">
                    Similar Articles
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {similarBlogs.map((item: any) => (
                    <div key={item._id} className="border border-borderCol-light/50 dark:border-borderCol-dark/50 rounded-2xl overflow-hidden bg-canvas-cardLight dark:bg-canvas-cardDark/10 p-4 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        {item.banner && (
                          <Link href={`/blog/${item.slug}`} className="block aspect-[16/9] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-borderCol-light/20">
                            <img src={item.banner} alt={item.title} className="w-full h-full object-cover hover:scale-[1.02] transition-transform" />
                          </Link>
                        )}
                        <Link href={`/blog/${item.slug}`} className="font-sans font-semibold text-sm text-ink-light dark:text-ink-dark hover:text-accent transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </Link>
                      </div>
                      <div className="flex items-center space-x-2 pt-2 border-t border-borderCol-light/20">
                        <img src={item.author.avatar || "/default-avatar.png"} alt={item.author.name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-[10px] text-mutedText-light dark:text-mutedText-dark font-medium">{item.author.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
