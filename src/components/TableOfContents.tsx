"use client";

import React, { useEffect, useState } from "react";
import { HeadingItem } from "@/lib/tiptap-parser";

interface TableOfContentsProps {
  toc: HeadingItem[];
}

export default function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (toc.length === 0) return;

    // Use IntersectionObserver to track which heading is currently in the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { 
        rootMargin: "-100px 0px -60% 0px", // Focus offset, considering the sticky header
        threshold: 0.1 
      }
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  if (!toc || toc.length === 0) return null;

  return (
    <nav className="space-y-4">
      <div className="flex items-center space-x-2">
        <span className="h-[1px] w-4 bg-accent"></span>
        <h4 className="font-sans text-[10px] font-bold tracking-widest text-accent uppercase">
          Outline
        </h4>
      </div>
      
      <ul className="space-y-2.5 text-xs font-light text-stone-600 dark:text-stone-400">
        {toc.map((item, idx) => {
          // Calculate indents based on heading depth
          const indentClass = item.level > 2 ? "pl-3 border-l border-borderCol-light dark:border-borderCol-dark ml-1" : "";
          
          return (
            <li
              key={idx}
              className={`${indentClass} transition-all duration-200`}
            >
              <a
                href={`#${item.id}`}
                className={`hover:text-accent transition-colors block leading-snug py-0.5 ${
                  activeId === item.id
                    ? "text-accent font-semibold"
                    : ""
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
