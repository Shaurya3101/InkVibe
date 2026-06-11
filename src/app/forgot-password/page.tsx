"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Failed to request reset link");
      }

      setIsSent(true);
      toast.success("Reset link generated! Check console output.");
    } catch (err) {
      toast.error("Failed to request password reset link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 rounded-2xl border border-borderCol-light dark:border-borderCol-dark bg-canvas-cardLight dark:bg-canvas-cardDark/40 shadow-sm transition-all duration-300">
        
        {/* Back Link */}
        <div>
          <Link
            href="/login"
            className="flex items-center text-xs font-semibold text-mutedText-light dark:text-mutedText-dark hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Log In
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <span className="font-serif text-3xl font-bold tracking-tight text-ink-light dark:text-ink-dark">
            InkVibe<span className="text-accent">.</span>
          </span>
          <h2 className="mt-4 text-2xl font-serif font-bold text-ink-light dark:text-ink-dark">
            Reset password
          </h2>
          <p className="mt-2 text-sm text-mutedText-light dark:text-mutedText-dark">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {!isSent ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-borderCol-light dark:border-borderCol-dark bg-transparent text-ink-light dark:text-ink-dark focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold tracking-wide text-stone-950 bg-accent hover:bg-accent-hover transition-colors focus:outline-none disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Request Reset Link"}
                <Send className="ml-2 w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 text-center space-y-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-borderCol-light/50 dark:border-borderCol-dark/50">
            <p className="text-sm text-ink-light dark:text-ink-dark">
              If an account is associated with <span className="font-semibold">{email}</span>, a link has been generated.
            </p>
            <p className="text-xs text-mutedText-light dark:text-mutedText-dark italic">
              Note: Because this is a development system, we have logged the password reset URL in the server terminal log. Check your server output window to retrieve the link.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
