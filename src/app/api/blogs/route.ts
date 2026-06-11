import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Blog from "@/lib/models/Blog";
import User from "@/lib/models/User";
import { generateSlug } from "@/lib/utils";

// GET: Fetch published blogs with query filters
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const tag = searchParams.get("tag");
    const author = searchParams.get("author");
    const trending = searchParams.get("trending") === "true";
    
    const skip = (page - 1) * limit;
    let query: any = { draft: false };

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    // Filter by author username
    if (author) {
      const user = await User.findOne({ username: author });
      if (!user) {
        return NextResponse.json({ blogs: [], totalBlogs: 0, totalPages: 0 });
      }
      query.author = user._id;
    }

    // Filter by text search query
    if (search) {
      query.$text = { $search: search };
    }

    let sort: any = { publishedAt: -1 };
    
    // Sort by views & likes count if requesting trending
    if (trending) {
      sort = { views: -1, totalLikes: -1 };
    }

    const blogs = await Blog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("author", "name username avatar bio")
      .select("title des banner tags slug totalLikes totalComments views publishedAt createdAt");

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit);

    return NextResponse.json({ blogs, totalBlogs, totalPages, currentPage: page });
  } catch (err: any) {
    console.error("Fetch blogs API error:", err);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

// POST: Create a new article or draft
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized action" }, { status: 401 });
    }

    const { title, banner, des, content, tags, draft } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content content are required" }, { status: 400 });
    }

    await dbConnect();

    const slug = generateSlug(title);

    // Create the blog post
    const newBlog = await Blog.create({
      title,
      banner: banner || "",
      des: des || "",
      content,
      tags: tags || [],
      author: session.user.id,
      slug,
      draft: draft !== undefined ? draft : true,
      publishedAt: draft === false ? new Date() : undefined,
    });

    return NextResponse.json({
      message: draft ? "Draft saved successfully" : "Article published successfully",
      blog: newBlog,
    }, { status: 201 });
  } catch (err: any) {
    console.error("Create blog API error:", err);
    return NextResponse.json({ error: "Failed to save article" }, { status: 500 });
  }
}
