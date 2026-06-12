"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/providers/ThemeProvider";
import { useNotificationStore } from "@/store/useNotificationStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, 
  Moon, 
  Bell, 
  Search, 
  Edit3, 
  ChevronDown, 
  User, 
  Bookmark, 
  LayoutDashboard, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession() as any;
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  // Avatar src state to allow next/image fallback handling
  const [avatarSrc, setAvatarSrc] = useState<string>(session?.user?.image || "/default-avatar.png");
  useEffect(() => {
    setAvatarSrc(session?.user?.image || "/default-avatar.png");
  }, [session?.user?.image]);
  
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread notifications count on mount
  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/notifications?count=true")
        .then((res) => res.json())
        .then((data) => {
          if (data.unreadCount !== undefined) {
            setUnreadCount(data.unreadCount);
          }
        })
        .catch((err) => console.error("Error loading notification count:", err));
    }
  }, [session, setUnreadCount]);

  // Handle outside clicks and Escape key to close profile dropdown; focus management
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // When dropdown opens, move focus to first actionable item for accessibility
  useEffect(() => {
    if (dropdownOpen && dropdownRef.current) {
      const first = dropdownRef.current.querySelector('a,button');
      (first as HTMLElement | null)?.focus();
    }
  }, [dropdownOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-borderCol-light dark:border-borderCol-dark bg-canvas-light/80 dark:bg-canvas-dark/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <span className="font-serif text-2xl font-bold tracking-tight text-ink-light dark:text-ink-dark">
            InkVibe<span className="text-accent">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {/* Search Trigger */}
          <div className="relative flex items-center">
            <AnimatePresence>
              {searchOpen && (
                <motion.form 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={handleSearchSubmit}
                  className="mr-2"
                >
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm px-3 py-1.5 rounded-full border border-borderCol-light dark:border-borderCol-dark bg-transparent text-ink-light dark:text-ink-dark focus:outline-none focus:border-accent"
                  />
                </motion.form>
              )}
            </AnimatePresence>
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-stone-600 dark:text-stone-400 hover:text-accent dark:hover:text-accent transition-colors p-2 rounded-full"
              aria-label="Search articles"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="text-stone-600 dark:text-stone-400 hover:text-accent dark:hover:text-accent transition-colors p-2 rounded-full"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Write Link */}
          <Link 
            href="/write"
            className="flex items-center text-stone-600 dark:text-stone-400 hover:text-accent dark:hover:text-accent transition-colors text-sm font-medium space-x-1"
          >
            <Edit3 className="w-4 h-4" />
            <span>Write</span>
          </Link>

          {session ? (
            <>
              {/* Notification Indicator */}
              <Link
                href="/notifications"
                className="relative text-stone-600 dark:text-stone-400 hover:text-accent dark:hover:text-accent transition-colors p-2 rounded-full"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-accent text-[10px] text-white font-bold h-4 w-4 rounded-full flex items-center justify-center border border-canvas-light dark:border-canvas-dark" aria-label={`${unreadCount} unread notifications`}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-0"
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  aria-controls="profile-dropdown"
                >
                  {/* Profile avatar uses next/image for optimization; fallback to initials SVG if remote image fails */}
                  <Image
                    src={avatarSrc}
                    alt={session?.user?.name || "User"}
                    width={32}
                    height={32}
                    unoptimized
                    onError={() => setAvatarSrc(`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session?.user?.name || "User")}`)}
                    className="w-8 h-8 rounded-full border border-accent/30 object-cover"
                  />

                  <ChevronDown className="w-4 h-4 text-stone-500" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      id="profile-dropdown"
                      role="menu"
                      aria-label="Profile menu"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-56 rounded-xl border border-borderCol-light dark:border-borderCol-dark bg-canvas-cardLight dark:bg-canvas-cardDark shadow-lg py-2 text-sm z-50"
                    >
                      <div className="px-4 py-2 border-b border-borderCol-light dark:border-borderCol-dark">
                        <p className="font-semibold text-ink-light dark:text-ink-dark truncate">{session.user.name}</p>
                        <p className="text-xs text-mutedText-light dark:text-mutedText-dark truncate">@{session.user.username}</p>
                      </div>
                      
                      <Link
                        href={`/profile/${session.user.username}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300"
                      >
                        <User className="w-4 h-4 mr-2" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        href="/bookmarks"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300"
                      >
                        <Bookmark className="w-4 h-4 mr-2" />
                        <span>Bookmarks</span>
                      </Link>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full flex items-center px-4 py-2 text-left hover:bg-stone-50 dark:hover:bg-stone-900 text-red-500"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link 
                href="/login"
                className="text-stone-600 dark:text-stone-400 hover:text-accent transition-colors text-sm font-medium"
              >
                Log In
              </Link>
              <Link 
                href="/signup"
                className="bg-accent hover:bg-accent-hover text-stone-950 px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center space-x-4 md:hidden">
          <button
            onClick={toggleTheme}
            className="text-stone-600 dark:text-stone-400 hover:text-accent transition-colors p-2"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-stone-600 dark:text-stone-400 hover:text-accent transition-colors p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-borderCol-light dark:border-borderCol-dark bg-canvas-light dark:bg-canvas-dark px-4 py-4 space-y-3 shadow-lg"
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm px-4 py-2 rounded-full border border-borderCol-light dark:border-borderCol-dark bg-transparent text-ink-light dark:text-ink-dark focus:outline-none focus:border-accent"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-stone-400">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <Link
              href="/write"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-stone-600 dark:text-stone-400 font-medium text-sm"
            >
              Write a Post
            </Link>

            {session ? (
              <>
                <Link
                  href="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-stone-600 dark:text-stone-400 font-medium text-sm"
                >
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-accent text-white font-bold h-5 w-5 rounded-full flex items-center justify-center text-xs">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  href={`/profile/${session.user.username}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-stone-600 dark:text-stone-400 font-medium text-sm"
                >
                  My Profile
                </Link>

                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-stone-600 dark:text-stone-400 font-medium text-sm"
                >
                  Author Dashboard
                </Link>

                <Link
                  href="/bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-stone-600 dark:text-stone-400 font-medium text-sm"
                >
                  Bookmarks Collection
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full text-left py-2 text-red-500 font-medium text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-full border border-borderCol-light dark:border-borderCol-dark text-stone-700 dark:text-stone-300 text-sm font-medium"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-full bg-accent text-stone-950 text-sm font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
