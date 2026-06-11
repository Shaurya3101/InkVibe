import React from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-borderCol-light dark:border-borderCol-dark bg-canvas-light dark:bg-canvas-dark py-12 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          
          {/* Logo & Description */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <span className="font-serif text-xl font-bold tracking-tight text-ink-light dark:text-ink-dark">
              InkVibe<span className="text-accent">.</span>
            </span>
            <p className="text-xs text-mutedText-light dark:text-mutedText-dark max-w-xs text-center md:text-left">
              An elegant space for modern storytelling, insights, and high-fidelity literary expression.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-stone-600 dark:text-stone-400">
            <Link href="/" className="hover:text-accent transition-colors">
              Discover
            </Link>
            <Link href="/write" className="hover:text-accent transition-colors">
              Write
            </Link>
            <Link href="/search" className="hover:text-accent transition-colors">
              Search
            </Link>
            <Link href="/dashboard" className="hover:text-accent transition-colors">
              Dashboard
            </Link>
          </div>

        </div>

        <div className="mt-8 pt-8 border-t border-borderCol-light/50 dark:border-borderCol-dark/50 flex flex-col md:flex-row items-center justify-between text-xs text-mutedText-light dark:text-mutedText-dark">
          <p>© {currentYear} InkVibe. Crafted with precision.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-accent transition-colors">Terms</a>
            <a href="#" className="hover:text-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-accent transition-colors">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
