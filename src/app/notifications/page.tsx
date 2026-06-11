"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useNotificationStore, INotificationData } from "@/store/useNotificationStore";
import { toast } from "react-hot-toast";
import { Heart, MessageSquare, UserPlus, Bell, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState<INotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  useEffect(() => {
    if (!session) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setNotifications(data.notifications || []);
        
        // Mark all as seen on mount
        await fetch("/api/notifications", { method: "PUT" });
        markAllAsRead();
      } catch (err) {
        toast.error("Failed to load notifications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [session, markAllAsRead]);

  if (!session) {
    return (
      <div className="flex-grow flex items-center justify-center bg-canvas-light dark:bg-canvas-dark">
        <p className="text-xs text-mutedText-light dark:text-mutedText-dark">
          Please log in to view your notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-canvas-light dark:bg-canvas-dark transition-colors duration-300 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-mutedText-light dark:text-mutedText-dark hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Feed
          </Link>
        </div>

        {/* Header Title */}
        <div className="border-b border-borderCol-light/50 dark:border-borderCol-dark/50 pb-6">
          <h1 className="font-serif text-3xl font-bold text-ink-light dark:text-ink-dark flex items-center">
            <Bell className="w-7 h-7 mr-2 text-accent" />
            Notifications
          </h1>
          <p className="text-xs text-mutedText-light dark:text-mutedText-dark font-light mt-1">
            Stay up to date with interactions on your creative write-ups.
          </p>
        </div>

        {/* Notifications Feed list */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const formattedDate = new Date(notification.createdAt).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
              );

              return (
                <div
                  key={notification._id}
                  className={`flex items-start space-x-4 p-5 rounded-2xl border ${
                    !notification.seen
                      ? "border-accent/30 bg-accent/5"
                      : "border-borderCol-light/60 dark:border-borderCol-dark/60 bg-canvas-cardLight dark:bg-canvas-cardDark/10"
                  } transition-all`}
                >
                  {/* Icon Indicator */}
                  <div className="mt-1">
                    {notification.type === "like" && (
                      <div className="bg-red-500/10 p-2 rounded-full text-red-500">
                        <Heart className="w-4 h-4 fill-red-500" />
                      </div>
                    )}
                    {(notification.type === "comment" || notification.type === "reply") && (
                      <div className="bg-blue-500/10 p-2 rounded-full text-blue-500">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                    )}
                    {notification.type === "follow" && (
                      <div className="bg-accent/20 p-2 rounded-full text-accent">
                        <UserPlus className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Body text */}
                  <div className="flex-grow min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs">
                        <Link
                          href={`/profile/${notification.user.username}`}
                          className="font-bold text-ink-light dark:text-ink-dark hover:text-accent transition-colors"
                        >
                          {notification.user.name}
                        </Link>{" "}
                        <span className="text-mutedText-light dark:text-mutedText-dark font-light">
                          @{notification.user.username}
                        </span>
                      </div>
                      <span className="text-[10px] text-mutedText-light dark:text-mutedText-dark font-light">
                        {formattedDate}
                      </span>
                    </div>

                    <p className="text-sm text-stone-750 dark:text-stone-250 font-light leading-snug">
                      {notification.type === "like" && (
                        <span>
                          liked your article{" "}
                          <Link href={`/blog/${notification.blog?.slug}`} className="font-semibold text-accent hover:underline">
                            {notification.blog?.title}
                          </Link>
                        </span>
                      )}
                      {notification.type === "comment" && (
                        <span>
                          commented on your article{" "}
                          <Link href={`/blog/${notification.blog?.slug}`} className="font-semibold text-accent hover:underline">
                            {notification.blog?.title}
                          </Link>
                        </span>
                      )}
                      {notification.type === "reply" && (
                        <span>
                          replied to your comment in{" "}
                          <Link href={`/blog/${notification.blog?.slug}`} className="font-semibold text-accent hover:underline">
                            {notification.blog?.title}
                          </Link>
                        </span>
                      )}
                      {notification.type === "follow" && (
                        <span>started following your profile</span>
                      )}
                    </p>

                    {/* Preview comment text snippet */}
                    {notification.comment && (
                      <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-borderCol-light/45 text-xs italic text-stone-600 dark:text-stone-400 font-light max-w-xl">
                        &ldquo;{notification.comment.comment}&rdquo;
                      </div>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-borderCol-light dark:border-borderCol-dark rounded-3xl p-8 bg-stone-50/10 max-w-xl mx-auto space-y-4">
            <Bell className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto" />
            <h3 className="font-serif text-base font-bold text-ink-light dark:text-ink-dark">
              All Quiet Here
            </h3>
            <p className="text-xs text-mutedText-light dark:text-mutedText-dark font-light max-w-xs mx-auto">
              You do not have any notifications yet. When writers like or comment on your work, they will appear here.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
