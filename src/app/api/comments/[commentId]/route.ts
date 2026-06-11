import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Comment from "@/lib/models/Comment";
import Blog from "@/lib/models/Blog";
import Notification from "@/lib/models/Notification";

// DELETE: Remove a comment or a nested reply
export async function DELETE(req: Request, { params }: { params: { commentId: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized action" }, { status: 401 });
    }

    const { commentId } = params;
    const userId = session.user.id;

    await dbConnect();

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Permission check: comment author or blog owner can delete
    const isCommenter = comment.commented_by.toString() === userId;
    const isBlogAuthor = comment.blog_author.toString() === userId;

    if (!isCommenter && !isBlogAuthor) {
      return NextResponse.json({ error: "Forbidden action" }, { status: 403 });
    }

    let deletedCount = 1;

    if (comment.parent_comment) {
      // If deleting a reply, pull its ID from the parent's children array
      await Comment.findByIdAndUpdate(comment.parent_comment, {
        $pull: { children: comment._id },
      });
      await Comment.deleteOne({ _id: comment._id });
    } else {
      // If deleting a top-level comment, clean up all its child replies too
      deletedCount += comment.children.length;
      await Comment.deleteMany({ _id: { $in: comment.children } });
      await Comment.deleteOne({ _id: comment._id });
    }

    // Update blog stats
    await Blog.findByIdAndUpdate(comment.blog_id, {
      $inc: { totalComments: -deletedCount },
    });

    // Delete related notifications
    await Notification.deleteMany({ comment: comment._id });

    return NextResponse.json({ message: "Comment deleted", deletedCount });
  } catch (err: any) {
    console.error("Delete comment API error:", err);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
