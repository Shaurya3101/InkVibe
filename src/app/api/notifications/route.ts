import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Notification from "@/lib/models/Notification";

// GET: Fetch notifications or count unread ones
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized action" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const countOnly = searchParams.get("count") === "true";
    const filter = searchParams.get("filter") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    await dbConnect();
    const userId = session.user.id;

    // Fast path to return only the badge count
    if (countOnly) {
      const unreadCount = await Notification.countDocuments({
        notification_for: userId,
        seen: false,
      });
      return NextResponse.json({ unreadCount });
    }

    let query: any = { notification_for: userId };
    if (filter === "unseen") {
      query.seen = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name username avatar")
      .populate("blog", "title slug")
      .populate("comment", "comment");

    return NextResponse.json({ notifications });
  } catch (err: any) {
    console.error("Fetch notifications API error:", err);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}

// PUT: Mark all notifications as seen
export async function PUT() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized action" }, { status: 401 });
    }

    await dbConnect();
    const userId = session.user.id;

    // Set all unseen notifications to seen
    await Notification.updateMany(
      { notification_for: userId, seen: false },
      { $set: { seen: true } }
    );

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (err: any) {
    console.error("Mark notifications read API error:", err);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
