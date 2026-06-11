"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

interface ResetPasswordProps {
  params: {
    token: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordProps) {
  const router = useRouter();
  const { token } = params;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Token may be invalid or expired");
      }

      toast.success("Password updated successfully! Please log in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 rounded-2xl border border-borderCol-light dark:border-borderCol-dark bg-canvas-cardLight dark:bg-canvas-cardDark/40 shadow-sm transition-all duration-300">
        
        {/* Header */}
        <div className="text-center">
          <span className="font-serif text-3xl font-bold tracking-tight text-ink-light dark:text-ink-dark">
            InkVibe<span className="text-accent">.</span>
          </span>
          <h2 className="mt-4 text-2xl font-serif font-bold text-ink-light dark:text-ink-dark">
            Set new password
          </h2>
          <p className="mt-2 text-sm text-mutedText-light dark:text-mutedText-dark">
            Choose a strong password to secure your account.
          </p>
        </div>

        {/* Credentials Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* New Password */}
            <div>
              <label htmlFor="password" className="sr-only">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm pl-10 pr-10 py-3 rounded-xl border border-borderCol-light dark:border-borderCol-dark bg-transparent text-ink-light dark:text-ink-dark focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-sm pl-10 pr-10 py-3 rounded-xl border border-borderCol-light dark:border-borderCol-dark bg-transparent text-ink-light dark:text-ink-dark focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || !password || !confirmPassword}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold tracking-wide text-stone-950 bg-accent hover:bg-accent-hover transition-colors focus:outline-none disabled:opacity-50"
            >
              {isSubmitting ? "Updating Password..." : "Update Password"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
