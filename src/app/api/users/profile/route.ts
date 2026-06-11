import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

// PUT: Update the authenticated user's profile details
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized action" }, { status: 401 });
    }

    const { name, avatar, bio, social_links } = await req.json();
    const userId = session.user.id;

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;
    if (social_links) {
      user.social_links = {
        github: social_links.github !== undefined ? social_links.github : user.social_links?.github || "",
        twitter: social_links.twitter !== undefined ? social_links.twitter : user.social_links?.twitter || "",
        website: social_links.website !== undefined ? social_links.website : user.social_links?.website || "",
        instagram: social_links.instagram !== undefined ? social_links.instagram : user.social_links?.instagram || "",
      };
    }

    await user.save();

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        social_links: user.social_links,
      },
    });
  } catch (err: any) {
    console.error("Profile update API error:", err);
    return NextResponse.json({ error: "Failed to update profile details" }, { status: 500 });
  }
}
