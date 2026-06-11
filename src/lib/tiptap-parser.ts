export interface HeadingItem {
  text: string;
  level: number;
  id: string;
}

/**
 * Server-side helper that parses TipTap JSON content structure
 * into safe HTML strings and compiles a Table of Contents (TOC) tree.
 */
export function parseTipTapToHtmlAndToc(contentJsonString: string): { html: string; toc: HeadingItem[] } {
  const toc: HeadingItem[] = [];
  
  try {
    const data = JSON.parse(contentJsonString);
    const nodes = data.content || [];
    
    const parseText = (textNode: any): string => {
      if (!textNode) return "";
      let html = textNode.text || "";
      
      // Escape HTML tags to prevent XSS
      html = html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Apply styling marks (Bold, Italic, Code, Link)
      if (textNode.marks) {
        textNode.marks.forEach((mark: any) => {
          if (mark.type === "bold") {
            html = `<strong>${html}</strong>`;
          } else if (mark.type === "italic") {
            html = `<em>${html}</em>`;
          } else if (mark.type === "code") {
            html = `<code>${html}</code>`;
          } else if (mark.type === "link") {
            const href = mark.attrs?.href || "#";
            html = `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline font-medium">${html}</a>`;
          }
        });
      }
      return html;
    };
    
    const parseNode = (node: any): string => {
      const childrenHtml = node.content ? node.content.map(parseText).join("") : "";
      
      switch (node.type) {
        case "paragraph":
          return `<p>${childrenHtml}</p>`;
          
        case "heading":
          const level = node.attrs?.level || 2;
          const text = node.content ? node.content.map((c: any) => c.text || "").join("") : "";
          
          // Generate a clean hyphenated ID for TOC anchors
          const headingId = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
            
          toc.push({ text, level, id: headingId });
          return `<h${level} id="${headingId}">${childrenHtml}</h${level}>`;
          
        case "blockquote":
          const quoteContent = node.content ? node.content.map(parseNode).join("") : "";
          return `<blockquote>${quoteContent}</blockquote>`;
          
        case "bulletList":
          const ulContent = node.content ? node.content.map(parseNode).join("") : "";
          return `<ul>${ulContent}</ul>`;
          
        case "orderedList":
          const olContent = node.content ? node.content.map(parseNode).join("") : "";
          return `<ol>${olContent}</ol>`;
          
        case "listItem":
          const liContent = node.content ? node.content.map(parseNode).join("") : "";
          return `<li>${liContent}</li>`;
          
        case "codeBlock":
          const codeText = node.content ? node.content.map((c: any) => c.text || "").join("") : "";
          return `<pre><code>${codeText}</code></pre>`;
          
        case "image":
          const src = node.attrs?.src || "";
          const alt = node.attrs?.alt || "Image";
          return `<img src="${src}" alt="${alt}" />`;
          
        default:
          return childrenHtml ? `<p>${childrenHtml}</p>` : "";
      }
    };
    
    const html = nodes.map(parseNode).join("");
    return { html, toc };
    
  } catch (e) {
    console.error("TipTap JSON parser failed:", e);
    return { html: `<p>${contentJsonString}</p>`, toc: [] };
  }
}
