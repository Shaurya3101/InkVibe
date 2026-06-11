import React from "react";
import dbConnect from "@/lib/db";
import Blog from "@/lib/models/Blog";
import BlogCard from "@/components/BlogCard";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { PenTool, ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";

interface HomeProps {
  searchParams: {
    page?: string;
  };
}

export const revalidate = 60; // Revalidate home page cache every 60 seconds

export default async function HomePage({ searchParams }: HomeProps) {
  const currentPage = parseInt(searchParams.page || "1");
  const limit = 6;
  const skip = (currentPage - 1) * limit;

  await dbConnect();

  // Fetch featured blog (highest views, published, not draft)
  const featuredBlogRaw = await Blog.findOne({ draft: false })
    .sort({ views: -1, publishedAt: -1 })
    .populate("author", "name username avatar bio")
    .select("title des banner tags slug totalLikes totalComments views publishedAt createdAt");

  // Fetch latest blogs (excluding the featured blog to avoid duplicate display)
  const query: any = { draft: false };
  if (featuredBlogRaw) {
    query._id = { $ne: featuredBlogRaw._id };
  }

  const latestBlogsRaw = await Blog.find(query)
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "name username avatar bio")
    .select("title des banner tags slug totalLikes totalComments views publishedAt createdAt");

  const totalBlogs = await Blog.countDocuments(query);
  const totalPages = Math.ceil(totalBlogs / limit);

  // Convert Mongoose documents to plain JSON for client component safety
  const featuredBlog = featuredBlogRaw ? JSON.parse(JSON.stringify(featuredBlogRaw)) : null;
  const latestBlogs = latestBlogsRaw ? JSON.parse(JSON.stringify(latestBlogsRaw)) : [];

  return (
    <div className="flex-grow bg-canvas-light dark:bg-canvas-dark transition-colors duration-300">
      
      {/* Luxury Hero Banner */}
      <section className="relative overflow-hidden border-b border-borderCol-light dark:border-borderCol-dark bg-stone-50 dark:bg-stone-900/10 py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-accent/10 border border-accent/20 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-accent">
            <PenTool className="w-3.5 h-3.5 mr-1" />
            <span>Welcome to the inkwell of high ideas</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-ink-light dark:text-ink-dark max-w-3xl leading-[1.15]">
            Where thoughts find their <span className="text-accent italic font-light">perfect cadence</span>.
          </h1>
          <p className="text-stone-600 dark:text-stone-400 max-w-xl text-base md:text-lg font-light leading-relaxed">
            InkVibe is a premium, distraction-free space for modern writers, designers, and tech thinkers to read, compose, and connect.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="bg-accent hover:bg-accent-hover text-stone-950 px-8 py-3 rounded-full text-sm font-semibold tracking-wide transition-all shadow-sm hover:shadow-md"
            >
              Start Writing
            </Link>
            <Link
              href="/search"
              className="border border-borderCol-light dark:border-borderCol-dark text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-950 px-8 py-3 rounded-full text-sm font-medium transition-all"
            >
              Explore Articles
            </Link>
          </div>
        </div>

        {/* Ambient background glows */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[250px] h-[250px] bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none"></div>
      </section>

      {/* Main Grid Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Blogs Feed */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Featured Section */}
            {featuredBlog && currentPage === 1 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <span className="h-[1px] w-6 bg-accent"></span>
                  <span className="text-xs font-semibold tracking-widest text-accent uppercase">Featured Story</span>
                </div>
                <div className="group grid grid-cols-1 md:grid-cols-12 gap-6 rounded-3xl border border-borderCol-light/80 dark:border-borderCol-dark/80 bg-canvas-cardLight dark:bg-canvas-cardDark/30 overflow-hidden p-6 hover:border-accent/30 transition-all duration-300">
                  {featuredBlog.banner && (
                    <Link href={`/blog/${featuredBlog.slug}`} className="md:col-span-7 aspect-[16/10] rounded-xl overflow-hidden border border-borderCol-light/30 dark:border-borderCol-dark/30">
                      <img
                        src={featuredBlog.banner}
                        alt={featuredBlog.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </Link>
                  )}
                  <div className="md:col-span-5 flex flex-col justify-between py-2 space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {featuredBlog.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-[10px] font-sans font-bold tracking-wider text-accent uppercase">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <Link href={`/blog/${featuredBlog.slug}`}>
                        <h2 className="font-serif text-2xl font-bold tracking-tight text-ink-light dark:text-ink-dark group-hover:text-accent transition-colors line-clamp-3 leading-snug">
                          {featuredBlog.title}
                        </h2>
                      </Link>
                      <p className="text-sm text-mutedText-light dark:text-mutedText-dark font-light line-clamp-3 leading-relaxed">
                        {featuredBlog.des}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-borderCol-light/30 dark:border-borderCol-dark/30">
                      <Link href={`/profile/${featuredBlog.author.username}`} className="flex items-center space-x-2">
                        <img
                          src={featuredBlog.author.avatar || "/default-avatar.png"}
                          alt={featuredBlog.author.name}
                          className="w-7 h-7 rounded-full border border-accent/20 object-cover"
                        />
                        <div className="flex flex-col text-[11px] leading-tight">
                          <span className="font-medium text-stone-700 dark:text-stone-300">{featuredBlog.author.name}</span>
                          <span className="text-[9px] text-mutedText-light dark:text-mutedText-dark">
                            {new Date(featuredBlog.publishedAt || featuredBlog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </Link>
                      <Link href={`/blog/${featuredBlog.slug}`} className="text-stone-800 dark:text-stone-200 hover:text-accent transition-colors">
                        <ArrowUpRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Latest Grid Feed */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="h-[1px] w-6 bg-accent"></span>
                  <span className="text-xs font-semibold tracking-widest text-accent uppercase">Latest Stories</span>
                </div>
              </div>

              {latestBlogs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {latestBlogs.map((blog: any) => (
                    <BlogCard key={blog._id} blog={blog} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-borderCol-light dark:border-borderCol-dark rounded-3xl p-8 bg-stone-50/30">
                  <p className="text-sm text-mutedText-light dark:text-mutedText-dark italic">
                    No articles published in this feed yet. Check back later or create one.
                  </p>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pt-8 flex items-center justify-center space-x-4 border-t border-borderCol-light/50 dark:border-borderCol-dark/50">
                  {currentPage > 1 ? (
                    <Link
                      href={`/?page=${currentPage - 1}`}
                      className="flex items-center text-xs font-semibold px-4 py-2 border border-borderCol-light dark:border-borderCol-dark rounded-full hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      Newer Posts
                    </Link>
                  ) : (
                    <span className="flex items-center text-xs font-semibold px-4 py-2 border border-borderCol-light/50 dark:border-borderCol-dark/50 rounded-full opacity-40 cursor-not-allowed">
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      Newer Posts
                    </span>
                  )}

                  <span className="text-xs font-semibold text-mutedText-light dark:text-mutedText-dark">
                    Page {currentPage} of {totalPages}
                  </span>

                  {currentPage < totalPages ? (
                    <Link
                      href={`/?page=${currentPage + 1}`}
                      className="flex items-center text-xs font-semibold px-4 py-2 border border-borderCol-light dark:border-borderCol-dark rounded-full hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
                    >
                      Older Posts
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  ) : (
                    <span className="flex items-center text-xs font-semibold px-4 py-2 border border-borderCol-light/50 dark:border-borderCol-dark/50 rounded-full opacity-40 cursor-not-allowed">
                      Older Posts
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </span>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-4">
            <Sidebar />
          </div>

        </div>
      </section>

    </div>
  );
}
