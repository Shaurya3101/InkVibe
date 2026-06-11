import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import Blog from "@/lib/models/Blog";

// POST: Toggle bookmarking an article for the current user
export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized action" }, { status: 401 });
    }

    const { slug } = params;
    const userId = session.user.id;

    await dbConnect();

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const isBookmarked = user.bookmarks.includes(blog._id as any);

    if (isBookmarked) {
      // Pull blog ID from user bookmarks list
      user.bookmarks = user.bookmarks.filter((id) => id.toString() !== blog._id.toString());
      await user.save();
      return NextResponse.json({ bookmarked: false });
    } else {
      // Push blog ID to user bookmarks list
      user.bookmarks.push(blog._id as any);
      await user.save();
      return NextResponse.json({ bookmarked: true });
    }
  } catch (err: any) {
    console.error("Bookmark toggle API error:", err);
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 });
  }
}
