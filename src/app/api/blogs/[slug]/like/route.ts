import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Blog from "@/lib/models/Blog";
import Notification from "@/lib/models/Notification";
import { triggerNotificationBroadcast } from "@/lib/socket-helper";

// POST: Toggle like / unlike on an article
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

    const alreadyLiked = blog.likes.some((id: any) => id.toString() === userId);

    if (alreadyLiked) {
      // Pull user from likes array & decrement counter
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
      blog.totalLikes = Math.max(0, blog.totalLikes - 1);
      await blog.save();

      // Clean up notification
      await Notification.deleteOne({
        type: "like",
        blog: blog._id,
        user: userId,
        notification_for: blog.author,
      });

      return NextResponse.json({ liked: false, totalLikes: blog.totalLikes });
    } else {
      // Add user to likes array & increment counter
      blog.likes.push(userId as any);
      blog.totalLikes += 1;
      await blog.save();

      // Only notify if liking someone else's article
      if (blog.author.toString() !== userId) {
        const notification = await Notification.create({
          type: "like",
          blog: blog._id,
          notification_for: blog.author,
          user: userId,
        });

        const populatedNotification = await Notification.findById(notification._id)
          .populate("user", "name username avatar")
          .populate("blog", "title slug");

        // Send real-time notification
        await triggerNotificationBroadcast(
          blog.author.toString(),
          "like",
          populatedNotification
        );
      }

      return NextResponse.json({ liked: true, totalLikes: blog.totalLikes });
    }
  } catch (err: any) {
    console.error("Like toggle API error:", err);
    return NextResponse.json({ error: "Failed to process like" }, { status: 500 });
  }
}
