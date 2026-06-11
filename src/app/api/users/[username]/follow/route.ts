import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import Notification from "@/lib/models/Notification";
import { triggerNotificationBroadcast } from "@/lib/socket-helper";

// POST: Toggle follow / unfollow on a user
export async function POST(req: Request, { params }: { params: { username: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized action" }, { status: 401 });
    }

    const { username } = params;
    const currentUserId = session.user.id;

    await dbConnect();

    // Find the user to follow
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return NextResponse.json({ error: "Writer profile not found" }, { status: 404 });
    }

    // Prevent follow self
    if (targetUser._id.toString() === currentUserId) {
      return NextResponse.json({ error: "You cannot follow your own profile" }, { status: 400 });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return NextResponse.json({ error: "User session not found" }, { status: 404 });
    }

    const alreadyFollowing = targetUser.followers.includes(currentUserId as any);

    if (alreadyFollowing) {
      // Unfollow - pull IDs
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== currentUserId);
      currentUser.following = currentUser.following.filter((id) => id.toString() !== targetUser._id.toString());
      
      await targetUser.save();
      await currentUser.save();

      // Clean up notification
      await Notification.deleteOne({
        type: "follow",
        notification_for: targetUser._id,
        user: currentUserId,
      });

      return NextResponse.json({ following: false });
    } else {
      // Follow - push IDs
      targetUser.followers.push(currentUserId as any);
      currentUser.following.push(targetUser._id as any);
      
      await targetUser.save();
      await currentUser.save();

      // Create notification
      const notification = await Notification.create({
        type: "follow",
        notification_for: targetUser._id,
        user: currentUserId,
      });

      const populatedNotification = await Notification.findById(notification._id)
        .populate("user", "name username avatar");

      // Broadcast to Socket server
      await triggerNotificationBroadcast(
        targetUser._id.toString(),
        "follow",
        populatedNotification
      );

      return NextResponse.json({ following: true });
    }
  } catch (err: any) {
    console.error("Follow toggling API error:", err);
    return NextResponse.json({ error: "Failed to process follow" }, { status: 500 });
  }
}
