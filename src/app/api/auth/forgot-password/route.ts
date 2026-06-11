import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import crypto from "crypto";

// POST: Request a password reset email
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email });

    // Security practice: do not confirm or deny if the email was found
    if (!user) {
      return NextResponse.json({
        message: "If an account exists with that email, a password reset link has been dispatched.",
      });
    }

    // Generate random reset token (64 hex characters)
    const token = crypto.randomBytes(32).toString("hex");
    
    // Save token and 1-hour expiration
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Log the link to the console for easy MERN learning project validation
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password/${token}`;
    console.log("\n=================================================");
    console.log(`PASSWORD RESET TRIGGERED FOR: ${email}`);
    console.log(`RESET URL: ${resetUrl}`);
    console.log("=================================================\n");

    return NextResponse.json({
      message: "If an account exists with that email, a password reset link has been dispatched.",
    });
  } catch (err) {
    console.error("Forgot password API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
