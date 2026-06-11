"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

// Form Schema Validation with Zod
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      toast.success("Account created! Welcome to InkVibe.");
      router.push("/login?signup=success");
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" });
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-mutedText-light dark:text-mutedText-dark">
            Join a collective of modern writers and thinkers.
          </p>
        </div>

        {/* Credentials Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <User className="w-5 h-5" />
                </span>
                <input
                  id="name"
                  type="text"
                  placeholder="Full Name"
                  {...register("name")}
                  className={`w-full text-sm pl-10 pr-4 py-3 rounded-xl border ${errors.name ? "border-red-500 focus:border-red-500" : "border-borderCol-light dark:border-borderCol-dark focus:border-accent"} bg-transparent text-ink-light dark:text-ink-dark focus:outline-none transition-colors`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="sr-only">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  {...register("email")}
                  className={`w-full text-sm pl-10 pr-4 py-3 rounded-xl border ${errors.email ? "border-red-500 focus:border-red-500" : "border-borderCol-light dark:border-borderCol-dark focus:border-accent"} bg-transparent text-ink-light dark:text-ink-dark focus:outline-none transition-colors`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  {...register("password")}
                  className={`w-full text-sm pl-10 pr-4 py-3 rounded-xl border ${errors.password ? "border-red-500 focus:border-red-500" : "border-borderCol-light dark:border-borderCol-dark focus:border-accent"} bg-transparent text-ink-light dark:text-ink-dark focus:outline-none transition-colors`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold tracking-wide text-stone-950 bg-accent hover:bg-accent-hover transition-colors focus:outline-none disabled:opacity-50"
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-borderCol-light dark:border-borderCol-dark"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-canvas-light dark:bg-canvas-cardDark text-mutedText-light dark:text-mutedText-dark font-medium uppercase tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign In */}
        <div>
          <button
            onClick={handleGoogleLogin}
            className="w-full flex justify-center items-center py-3 px-4 rounded-xl border border-borderCol-light dark:border-borderCol-dark bg-transparent text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors focus:outline-none"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.525 0-6.39-2.865-6.39-6.39s2.865-6.39 6.39-6.39c1.716 0 3.22.68 4.338 1.78l3.053-3.053C19.16 2.378 15.932 1 12.24 1 5.62 1 .25 6.37.25 12.99S5.62 24.98 12.24 24.98c6.16 0 11.233-4.52 11.233-11.233 0-.68-.079-1.35-.227-1.996h-11.006z"
              />
            </svg>
            Google
          </button>
        </div>

        {/* Redirect to Login */}
        <div className="text-center text-sm">
          <span className="text-mutedText-light dark:text-mutedText-dark">
            Already have an account?{" "}
          </span>
          <Link
            href="/login"
            className="font-medium text-accent hover:text-accent-hover transition-colors"
          >
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
}
