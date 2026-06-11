import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Blog from "@/lib/models/Blog";
import Comment from "@/lib/models/Comment";
import Notification from "@/lib/models/Notification";
import { triggerNotificationBroadcast } from "@/lib/socket-helper";

// GET: Fetch all comments for a blog (nested hierarchy)
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    await dbConnect();

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Retrieve comments where parent_comment is null (top level)
    const comments = await Comment.find({ blog_id: blog._id, parent_comment: null })
      .sort({ createdAt: -1 })
      .populate("commented_by", "name username avatar")
      .populate({
        path: "children",
        populate: {
          path: "commented_by",
          select: "name username avatar",
        },
      });

    return NextResponse.json({ comments });
  } catch (err: any) {
    console.error("Fetch comments API error:", err);
    return NextResponse.json({ error: "Failed to load comment thread" }, { status: 500 });
  }
}

// POST: Add a new comment or reply to an existing comment
export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized action" }, { status: 401 });
    }

    const { slug } = params;
    const { comment, parentCommentId } = await req.json();

    if (!comment || comment.trim() === "") {
      return NextResponse.json({ error: "Comment text cannot be empty" }, { status: 400 });
    }

    await dbConnect();

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const userId = session.user.id;
    let newComment;

    if (parentCommentId) {
      // Handle nested reply
      const parent = await Comment.findById(parentCommentId);
      if (!parent) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
      }

      newComment = await Comment.create({
        blog_id: blog._id,
        blog_author: blog.author,
        comment,
        commented_by: userId,
        parent_comment: parentCommentId,
        isReply: true,
      });

      // Update parent comment children array
      parent.children.push(newComment._id as any);
      await parent.save();

      // Update blog stats
      await Blog.findByIdAndUpdate(blog._id, { $inc: { totalComments: 1 } });

      // Notify parent commenter (if not replying to self)
      if (parent.commented_by.toString() !== userId) {
        const notification = await Notification.create({
          type: "reply",
          blog: blog._id,
          notification_for: parent.commented_by,
          user: userId,
          comment: newComment._id,
        });

        const populatedNotification = await Notification.findById(notification._id)
          .populate("user", "name username avatar")
          .populate("blog", "title slug");

        // Broadcast to WebSocket server
        await triggerNotificationBroadcast(
          parent.commented_by.toString(),
          "reply",
          populatedNotification
        );
      }
    } else {
      // Handle top-level comment
      newComment = await Comment.create({
        blog_id: blog._id,
        blog_author: blog.author,
        comment,
        commented_by: userId,
      });

      // Update blog total comments
      blog.totalComments += 1;
      await blog.save();

      // Notify blog author (if not commenting on self blog)
      if (blog.author.toString() !== userId) {
        const notification = await Notification.create({
          type: "comment",
          blog: blog._id,
          notification_for: blog.author,
          user: userId,
          comment: newComment._id,
        });

        const populatedNotification = await Notification.findById(notification._id)
          .populate("user", "name username avatar")
          .populate("blog", "title slug");

        // Broadcast to WebSocket server
        await triggerNotificationBroadcast(
          blog.author.toString(),
          "comment",
          populatedNotification
        );
      }
    }

    const populatedComment = await Comment.findById(newComment._id)
      .populate("commented_by", "name username avatar");

    return NextResponse.json({
      message: "Comment posted",
      comment: populatedComment,
    });
  } catch (err: any) {
    console.error("Post comment API error:", err);
    return NextResponse.json({ error: "Failed to submit comment" }, { status: 500 });
  }
}
