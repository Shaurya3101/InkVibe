"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface LikeButtonProps {
  slug: string;
  initialLikes: number;
  initialLiked: boolean;
}

export default function LikeButton({ slug, initialLikes, initialLiked }: LikeButtonProps) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!session) {
      toast.error("Please log in to like this article");
      return;
    }

    try {
      setLoading(true);
      
      const res = await fetch(`/api/blogs/${slug}/like`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();
      setLiked(data.liked);
      setLikes(data.totalLikes);
    } catch (err) {
      toast.error("Failed to process like. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center space-x-1.5 px-4 py-2 rounded-full border text-xs font-semibold transition-all ${
        liked
          ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
          : "border-borderCol-light dark:border-borderCol-dark hover:border-accent hover:text-accent text-stone-600 dark:text-stone-300"
      }`}
    >
      <Heart className={`w-4.5 h-4.5 transition-transform ${liked ? "fill-red-500 text-red-500 scale-110" : ""}`} />
      <span>{likes}</span>
    </button>
  );
}
