import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await dbConnect();

    // Check if email already registered
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // Generate unique username from email prefix
    let baseUsername = email.split("@")[0];
    baseUsername = baseUsername.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    let username = baseUsername;
    let userExists = await User.findOne({ username });
    let counter = 1;

    while (userExists) {
      username = `${baseUsername}${counter}`;
      userExists = await User.findOne({ username });
      counter++;
    }

    // Hash password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in the database
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      username,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      social_links: { github: "", twitter: "", website: "", instagram: "" },
    });

    return NextResponse.json({
      message: "Successfully registered account",
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      }
    }, { status: 201 });

  } catch (err: any) {
    console.error("Signup route error:", err);
    return NextResponse.json({ error: "Registration failed due to a server error" }, { status: 500 });
  }
}
