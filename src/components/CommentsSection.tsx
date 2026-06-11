"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Trash2, Reply, Send, MessageSquare } from "lucide-react";

interface CommentUser {
  _id: string;
  name: string;
  username: string;
  avatar: string;
}

interface CommentData {
  _id: string;
  comment: string;
  isReply: boolean;
  commented_by: CommentUser;
  blog_author: string;
  children: CommentData[];
  createdAt: string;
}

interface CommentsSectionProps {
  blogSlug: string;
  blogAuthorId: string;
  onCommentCountChange?: (count: number) => void;
}

export default function CommentsSection({ blogSlug, blogAuthorId, onCommentCountChange }: CommentsSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load comments list
  const loadComments = async () => {
    try {
      const res = await fetch(`/api/blogs/${blogSlug}/comments`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComments(data.comments || []);
      
      // Calculate total count
      let count = data.comments.length;
      data.comments.forEach((c: CommentData) => {
        count += c.children?.length || 0;
      });
      if (onCommentCountChange) onCommentCountChange(count);
    } catch (err) {
      console.error("Error loading comments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [blogSlug]);

  // Submit top-level comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please log in to leave a comment");
      return;
    }
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/blogs/${blogSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: newComment }),
      });

      if (!res.ok) throw new Error();
      
      setNewComment("");
      toast.success("Comment posted successfully");
      await loadComments();
    } catch (err) {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit reply comment
  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please log in to reply");
      return;
    }
    if (!replyText.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/blogs/${blogSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: replyText, parentCommentId: parentId }),
      });

      if (!res.ok) throw new Error();
      
      setReplyText("");
      setReplyToId(null);
      toast.success("Reply posted successfully");
      await loadComments();
    } catch (err) {
      toast.error("Failed to submit reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();
      
      toast.success("Comment removed");
      await loadComments();
    } catch (err) {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="font-serif text-lg font-bold text-ink-light dark:text-ink-dark flex items-center">
        <MessageSquare className="w-5 h-5 mr-2 text-accent" />
        Discussion
      </h3>

      {/* New comment input box */}
      {session ? (
        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <div className="relative rounded-2xl border border-borderCol-light dark:border-borderCol-dark bg-white dark:bg-canvas-cardDark/20 p-2 focus-within:border-accent transition-colors">
            <textarea
              placeholder="What are your thoughts on this story?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="w-full text-sm p-2 bg-transparent text-ink-light dark:text-ink-dark focus:outline-none resize-none placeholder-stone-400"
            />
            <div className="flex justify-end p-1">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="bg-accent hover:bg-accent-hover text-stone-950 px-4 py-2 rounded-full text-xs font-semibold tracking-wide flex items-center transition-colors disabled:opacity-50"
              >
                <span>Comment</span>
                <Send className="w-3 h-3 ml-1.5" />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-2xl border border-dashed border-borderCol-light dark:border-borderCol-dark bg-stone-50/10 text-center">
          <p className="text-sm text-mutedText-light dark:text-mutedText-dark font-light mb-3">
            Join the conversation to share your insights.
          </p>
          <Link
            href="/login"
            className="inline-block bg-accent hover:bg-accent-hover text-stone-950 px-6 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors"
          >
            Log In to Comment
          </Link>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="animate-pulse flex space-x-4">
              <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-900"></div>
              <div className="flex-grow space-y-2">
                <div className="h-3 bg-stone-100 dark:bg-stone-900 rounded w-1/4"></div>
                <div className="h-3.5 bg-stone-100 dark:bg-stone-900 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => {
            const showDelete = session?.user && (session.user.id === comment.commented_by._id || session.user.id === blogAuthorId);
            
            return (
              <div key={comment._id} className="space-y-4">
                
                {/* Top Level Comment Card */}
                <div className="flex items-start space-x-3 group">
                  <img
                    src={comment.commented_by.avatar || "/default-avatar.png"}
                    alt={comment.commented_by.name}
                    className="w-8 h-8 rounded-full border border-accent/20 object-cover mt-0.5"
                  />
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs">
                        <span className="font-semibold text-ink-light dark:text-ink-dark">
                          {comment.commented_by.name}
                        </span>
                        <span className="text-mutedText-light dark:text-mutedText-dark font-light">
                          @{comment.commented_by.username}
                        </span>
                      </div>
                      <span className="text-[10px] text-mutedText-light dark:text-mutedText-dark font-light">
                        {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-stone-850 dark:text-stone-250 mt-1 font-light leading-relaxed whitespace-pre-wrap">
                      {comment.comment}
                    </p>

                    {/* Actions panel */}
                    <div className="flex items-center space-x-4 mt-2.5 text-xs text-mutedText-light dark:text-mutedText-dark">
                      {session && (
                        <button
                          onClick={() => setReplyToId(replyToId === comment._id ? null : comment._id)}
                          className="flex items-center hover:text-accent font-semibold transition-colors"
                        >
                          <Reply className="w-3.5 h-3.5 mr-1" />
                          Reply
                        </button>
                      )}
                      {showDelete && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="flex items-center hover:text-red-500 font-semibold transition-colors opacity-0 group-hover:opacity-100 duration-200"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                {replyToId === comment._id && (
                  <form onSubmit={(e) => handleReplySubmit(e, comment._id)} className="ml-11 space-y-2">
                    <div className="relative rounded-xl border border-borderCol-light dark:border-borderCol-dark bg-stone-50/50 dark:bg-stone-900/10 p-2 focus-within:border-accent">
                      <textarea
                        placeholder={`Reply to @${comment.commented_by.username}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={2}
                        className="w-full text-xs p-1.5 bg-transparent text-ink-light dark:text-ink-dark focus:outline-none resize-none placeholder-stone-400"
                      />
                      <div className="flex justify-end space-x-2 p-1">
                        <button
                          type="button"
                          onClick={() => { setReplyToId(null); setReplyText(""); }}
                          className="text-stone-500 hover:text-stone-700 px-3 py-1 rounded-full text-[10px] font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || !replyText.trim()}
                          className="bg-accent hover:bg-accent-hover text-stone-950 px-3.5 py-1 rounded-full text-[10px] font-semibold flex items-center transition-colors"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Nested Replies Lists */}
                {comment.children && comment.children.length > 0 && (
                  <div className="ml-11 border-l-2 border-borderCol-light/80 dark:border-borderCol-dark/60 pl-4 space-y-4">
                    {comment.children.map((reply) => {
                      const showReplyDelete = session?.user && (session.user.id === reply.commented_by._id || session.user.id === blogAuthorId);
                      
                      return (
                        <div key={reply._id} className="flex items-start space-x-3 group">
                          <img
                            src={reply.commented_by.avatar || "/default-avatar.png"}
                            alt={reply.commented_by.name}
                            className="w-7 h-7 rounded-full border border-accent/20 object-cover mt-0.5"
                          />
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1.5 text-xs">
                                <span className="font-semibold text-ink-light dark:text-ink-dark">
                                  {reply.commented_by.name}
                                </span>
                                <span className="text-mutedText-light dark:text-mutedText-dark font-light">
                                  @{reply.commented_by.username}
                                </span>
                              </div>
                              <span className="text-[10px] text-mutedText-light dark:text-mutedText-dark font-light">
                                {new Date(reply.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                            
                            <p className="text-sm text-stone-850 dark:text-stone-250 mt-1 font-light leading-relaxed whitespace-pre-wrap">
                              {reply.comment}
                            </p>

                            {/* Reply Actions */}
                            {showReplyDelete && (
                              <div className="flex items-center mt-2.5">
                                <button
                                  onClick={() => handleDeleteComment(reply._id)}
                                  className="flex items-center hover:text-red-500 font-semibold text-xs text-mutedText-light dark:text-mutedText-dark opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-mutedText-light dark:text-mutedText-dark italic py-4">
          No comments yet. Be the first to start the discussion!
        </p>
      )}
    </div>
  );
}
