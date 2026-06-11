"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface FollowButtonProps {
  username: string;
  initialFollowing: boolean;
  onToggleSuccess?: (following: boolean) => void;
}

export default function FollowButton({ username, initialFollowing, onToggleSuccess }: FollowButtonProps) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (!session) {
      toast.error("Please log in to follow writers");
      return;
    }

    if ((session?.user as any)?.username === username) {
      toast.error("You cannot follow your own profile");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/users/${username}/follow`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();
      setFollowing(data.following);
      if (onToggleSuccess) {
        onToggleSuccess(data.following);
      }

      toast.success(
        data.following ? `You are now following @${username}` : `You unfollowed @${username}`
      );
    } catch (err) {
      toast.error("Failed to follow writer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
        following
          ? "border border-borderCol-light dark:border-borderCol-dark text-stone-600 dark:text-stone-300 hover:border-red-500 hover:text-red-500"
          : "bg-accent hover:bg-accent-hover text-stone-950 shadow-sm"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
