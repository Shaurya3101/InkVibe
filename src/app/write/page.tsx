"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Editor from "@/components/Editor";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface InitialBlogData {
  title: string;
  banner: string;
  des: string;
  content: string;
  tags: string[];
  draft: boolean;
}

function WriteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const editSlug = searchParams.get("edit");
  const [initialData, setInitialData] = useState<InitialBlogData | null>(null);
  const [isLoading, setIsLoading] = useState(!!editSlug);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch blog data if in edit mode
  useEffect(() => {
    if (!editSlug) return;

    const fetchBlogData = async () => {
      try {
        const res = await fetch(`/api/blogs/${editSlug}`);
        if (!res.ok) {
          throw new Error("Failed to load article data");
        }
        
        const data = await res.json();
        
        // Safety check: verify ownership
        if (session?.user?.id && data.blog.author._id !== session.user.id) {
          toast.error("You are not authorized to edit this article");
          router.push("/dashboard/blogs");
          return;
        }

        setInitialData({
          title: data.blog.title,
          banner: data.blog.banner || "",
          des: data.blog.des || "",
          content: data.blog.content,
          tags: data.blog.tags || [],
          draft: data.blog.draft,
        });
      } catch (err: any) {
        toast.error(err.message || "Failed to load article");
        router.push("/dashboard/blogs");
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchBlogData();
    }
  }, [editSlug, session, router]);

  const handleSave = async (data: {
    title: string;
    banner: string;
    des: string;
    content: string;
    tags: string[];
    draft: boolean;
  }) => {
    try {
      setIsSubmitting(true);
      
      const url = editSlug ? `/api/blogs/${editSlug}` : "/api/blogs";
      const method = editSlug ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to save article");
      }

      toast.success(
        data.draft
          ? "Draft article saved successfully"
          : "Article published successfully!"
      );
      
      router.push("/dashboard/blogs");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save article");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow bg-canvas-light dark:bg-canvas-dark flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-xs text-mutedText-light dark:text-mutedText-dark font-light">
            Retrieving story details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-canvas-light dark:bg-canvas-dark transition-colors duration-300 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="border-b border-borderCol-light/50 dark:border-borderCol-dark/50 pb-4">
          <h1 className="font-serif text-3xl font-bold text-ink-light dark:text-ink-dark">
            {editSlug ? "Edit Story" : "Compose Story"}
          </h1>
          <p className="text-xs text-mutedText-light dark:text-mutedText-dark font-light mt-1">
            {editSlug ? "Refine your narrative, details, and layout structure." : "Express your ideas in a beautiful, structured format."}
          </p>
        </div>

        {/* Rich Text Editor */}
        <div className="bg-canvas-cardLight dark:bg-canvas-cardDark/10 p-6 md:p-8 rounded-3xl border border-borderCol-light/80 dark:border-borderCol-dark/80 shadow-sm">
          <Editor 
            key={initialData ? "edit-mode" : "new-mode"} // Re-render editor when initialData is loaded
            initialData={initialData || undefined} 
            onSave={handleSave} 
            isSubmitting={isSubmitting} 
          />
        </div>

      </div>
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center py-20 px-4">
        <div className="text-center font-serif text-lg font-light text-mutedText-light dark:text-mutedText-dark">
          Loading editor...
        </div>
      </div>
    }>
      <WriteForm />
    </Suspense>
  );
}
