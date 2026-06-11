import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

// GET: Retrieve public profile of a user by username
export async function GET(req: Request, { params }: { params: { username: string } }) {
  try {
    const { username } = params;
    await dbConnect();

    const user = await User.findOne({ username })
      .select("name username email avatar bio social_links followers following");

    if (!user) {
      return NextResponse.json({ error: "Writer not found" }, { status: 404 });
    }

    const session = await auth();
    let isFollowing = false;
    const currentUserId = session?.user?.id;
    if (currentUserId) {
      isFollowing = user.followers.some((id) => id.toString() === currentUserId);
    }

    const userData = {
      id: user._id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      social_links: user.social_links,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing,
    };

    return NextResponse.json({ user: userData });
  } catch (err: any) {
    console.error("Fetch user profile API error:", err);
    return NextResponse.json({ error: "Failed to retrieve user profile" }, { status: 500 });
  }
}
