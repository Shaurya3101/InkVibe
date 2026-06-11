import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateReadingTime(contentJsonString: string): number {
  try {
    const data = JSON.parse(contentJsonString);
    let text = "";
    
    // Helper to recursively extract text from TipTap JSON nodes
    const extractText = (node: any) => {
      if (node.type === "text") {
        text += " " + node.text;
      }
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(extractText);
      }
    };
    
    if (data.content && Array.isArray(data.content)) {
      data.content.forEach(extractText);
    } else if (Array.isArray(data)) {
      data.forEach(extractText);
    } else if (data && typeof data === "object") {
      extractText(data);
    }
    
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const wordsPerMinute = 225; // Average adult reading speed
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  } catch (e) {
    // If it's pure string text instead of TipTap JSON
    const words = contentJsonString.trim().split(/\s+/).filter(w => w.length > 0).length;
    const wordsPerMinute = 225;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  }
}

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove special characters
    .replace(/[\s_-]+/g, "-") // replace spaces and underscores with a single dash
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
    
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}
