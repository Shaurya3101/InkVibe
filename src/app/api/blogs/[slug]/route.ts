import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Blog from "@/lib/models/Blog";

// GET: Fetch single blog by slug & increment views
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    await dbConnect();

    // Find and increment views in a single operation
    const blog = await Blog.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    ).populate("author", "name username avatar bio followers");

    if (!blog) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (err: any) {
    console.error("Fetch single blog API error:", err);
    return NextResponse.json({ error: "Failed to load article" }, { status: 500 });
  }
}

// PUT: Update an article or toggle draft status
export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized action" }, { status: 401 });
    }

    const { slug } = params;
    const { title, banner, des, content, tags, draft } = await req.json();

    await dbConnect();

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Enforce ownership
    if (blog.author.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this article" }, { status: 403 });
    }

    // Perform updates
    if (title) blog.title = title;
    if (banner !== undefined) blog.banner = banner;
    if (des !== undefined) blog.des = des;
    if (content) blog.content = content;
    if (tags) blog.tags = tags;
    
    if (draft !== undefined) {
      if (blog.draft && !draft) {
        blog.publishedAt = new Date();
      }
      blog.draft = draft;
    }

    await blog.save();

    return NextResponse.json({ message: "Article updated successfully", blog });
  } catch (err: any) {
    console.error("Update blog API error:", err);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

// DELETE: Delete an article
export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized action" }, { status: 401 });
    }

    const { slug } = params;
    await dbConnect();

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Enforce ownership
    if (blog.author.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this article" }, { status: 403 });
    }

    await Blog.deleteOne({ _id: blog._id });

    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (err: any) {
    console.error("Delete blog API error:", err);
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
