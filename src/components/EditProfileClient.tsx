"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { toast } from "react-hot-toast";
import { Camera, Globe, Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-stone-400">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-stone-400">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-stone-400">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// Validation schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(250, "Bio must be under 250 characters").optional(),
  social_links: z.object({
    github: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
    twitter: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
    website: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
    instagram: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileClientProps {
  initialUser: {
    name: string;
    avatar: string;
    bio?: string;
    social_links?: {
      github?: string;
      twitter?: string;
      website?: string;
      instagram?: string;
    };
  };
}

export default function EditProfileClient({ initialUser }: EditProfileClientProps) {
  const router = useRouter();
  const { update } = useSession();
  
  const [avatar, setAvatar] = useState(initialUser.avatar || "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialUser.name,
      bio: initialUser.bio || "",
      social_links: {
        github: initialUser.social_links?.github || "",
        twitter: initialUser.social_links?.twitter || "",
        website: initialUser.social_links?.website || "",
        instagram: initialUser.social_links?.instagram || "",
      },
    },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const url = await uploadToCloudinary(file, "avatars");
      setAvatar(url);
      
      // Update local NextAuth session cache directly
      await update({ image: url });
      
      toast.success("Avatar image uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload avatar image");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSaving(true);
      
      const payload = {
        name: values.name,
        bio: values.bio,
        avatar,
        social_links: values.social_links,
      };

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to update profile");
      }

      // Sync updated name into NextAuth session
      await update({ name: values.name });

      toast.success("Profile preferences updated successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      
      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative group">
          <img
            src={avatar || "/default-avatar.png"}
            alt={initialUser.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initialUser.name)}`;
            }}
            className="w-24 h-24 rounded-full object-cover border-2 border-accent/20 group-hover:opacity-75 transition-opacity"
          />
          <button
            type="button"
            disabled={isUploadingAvatar}
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer disabled:opacity-50"
          >
            {isUploadingAvatar ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <p className="text-[10px] text-mutedText-light dark:text-mutedText-dark font-light">
          Click the circle to upload a custom avatar
        </p>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: General Profile */}
        <div className="space-y-4">
          <h3 className="font-serif text-sm font-semibold text-ink-light dark:text-ink-dark border-b border-borderCol-light dark:border-borderCol-dark pb-2">
            General Preferences
          </h3>
          
          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Public Display Name
            </label>
            <input
              type="text"
              {...register("name")}
              className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${errors.name ? "border-red-500" : "border-borderCol-light dark:border-borderCol-dark"} bg-transparent text-ink-light dark:text-ink-dark focus:outline-none focus:border-accent`}
            />
            {errors.name && (
              <p className="mt-1 text-[10px] text-red-500 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Biography */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Author Biography (Limit 250 characters)
            </label>
            <textarea
              rows={4}
              {...register("bio")}
              className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${errors.bio ? "border-red-500" : "border-borderCol-light dark:border-borderCol-dark"} bg-transparent text-ink-light dark:text-ink-dark focus:outline-none focus:border-accent resize-none`}
            />
            {errors.bio && (
              <p className="mt-1 text-[10px] text-red-500 font-medium">{errors.bio.message}</p>
            )}
          </div>
        </div>

        {/* Right Side: Social links */}
        <div className="space-y-4">
          <h3 className="font-serif text-sm font-semibold text-ink-light dark:text-ink-dark border-b border-borderCol-light dark:border-borderCol-dark pb-2">
            Social Accounts Links
          </h3>

          {/* GitHub */}
          <div>
            <label className="flex items-center text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              <GithubIcon /> GitHub URL
            </label>
            <input
              type="text"
              {...register("social_links.github")}
              placeholder="https://github.com/username"
              className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${errors.social_links?.github ? "border-red-500" : "border-borderCol-light dark:border-borderCol-dark"} bg-transparent text-ink-light dark:text-ink-dark focus:outline-none focus:border-accent`}
            />
            {errors.social_links?.github && (
              <p className="mt-1 text-[10px] text-red-500 font-medium">{errors.social_links.github.message}</p>
            )}
          </div>

          {/* Twitter */}
          <div>
            <label className="flex items-center text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              <TwitterIcon /> Twitter URL
            </label>
            <input
              type="text"
              {...register("social_links.twitter")}
              placeholder="https://twitter.com/username"
              className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${errors.social_links?.twitter ? "border-red-500" : "border-borderCol-light dark:border-borderCol-dark"} bg-transparent text-ink-light dark:text-ink-dark focus:outline-none focus:border-accent`}
            />
            {errors.social_links?.twitter && (
              <p className="mt-1 text-[10px] text-red-500 font-medium">{errors.social_links.twitter.message}</p>
            )}
          </div>

          {/* Website */}
          <div>
            <label className="flex items-center text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              <Globe className="w-3.5 h-3.5 mr-1.5 text-stone-400" /> Personal Website
            </label>
            <input
              type="text"
              {...register("social_links.website")}
              placeholder="https://mywebsite.com"
              className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${errors.social_links?.website ? "border-red-500" : "border-borderCol-light dark:border-borderCol-dark"} bg-transparent text-ink-light dark:text-ink-dark focus:outline-none focus:border-accent`}
            />
            {errors.social_links?.website && (
              <p className="mt-1 text-[10px] text-red-500 font-medium">{errors.social_links.website.message}</p>
            )}
          </div>

          {/* Instagram */}
          <div>
            <label className="flex items-center text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              <InstagramIcon /> Instagram URL
            </label>
            <input
              type="text"
              {...register("social_links.instagram")}
              placeholder="https://instagram.com/username"
              className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${errors.social_links?.instagram ? "border-red-500" : "border-borderCol-light dark:border-borderCol-dark"} bg-transparent text-ink-light dark:text-ink-dark focus:outline-none focus:border-accent`}
            />
            {errors.social_links?.instagram && (
              <p className="mt-1 text-[10px] text-red-500 font-medium">{errors.social_links.instagram.message}</p>
            )}
          </div>
        </div>

      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-borderCol-light/50 dark:border-borderCol-dark/50">
        <Link
          href={`/profile/${initialUser.name}`} // Or dashboard
          className="border border-borderCol-light dark:border-borderCol-dark text-stone-700 dark:text-stone-300 px-6 py-2.5 rounded-full text-xs font-medium transition-all hover:bg-stone-50 dark:hover:bg-stone-950"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="bg-accent hover:bg-accent-hover text-stone-950 px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Saving Preferences...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Preferences
            </>
          )}
        </button>
      </div>

    </form>
  );
}
