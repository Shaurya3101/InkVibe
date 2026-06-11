"use client";

import React, { useState } from "react";
import { Bookmark } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface BookmarkButtonProps {
  slug: string;
  initialBookmarked: boolean;
}

export default function BookmarkButton({ slug, initialBookmarked }: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const handleBookmark = async () => {
    if (!session) {
      toast.error("Please log in to save this article");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/blogs/${slug}/bookmark`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();
      setBookmarked(data.bookmarked);
      
      toast.success(
        data.bookmarked
          ? "Article saved to bookmarks"
          : "Article removed from bookmarks",
        {
          style: {
            borderRadius: "12px",
            background: "#121212",
            color: "#f4f3ef",
            border: "1px solid #c5a880",
          }
        }
      );
    } catch (err) {
      toast.error("Failed to update bookmark status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBookmark}
      disabled={loading}
      className={`p-2 rounded-full border transition-all ${
        bookmarked
          ? "bg-accent/10 border-accent text-accent"
          : "border-borderCol-light dark:border-borderCol-dark hover:border-accent hover:text-accent text-stone-600 dark:text-stone-300"
      }`}
      title={bookmarked ? "Remove Bookmark" : "Save Article"}
    >
      <Bookmark className={`w-4.5 h-4.5 ${bookmarked ? "fill-accent" : ""}`} />
    </button>
  );
}
