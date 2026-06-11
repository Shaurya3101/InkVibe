"use client";

import React, { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { toast } from "react-hot-toast";
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Quote, 
  Image as ImageIcon, 
  Code, 
  Undo, 
  Redo, 
  UploadCloud, 
  X, 
  Save, 
  BookOpen
} from "lucide-react";

interface EditorProps {
  initialData?: {
    title: string;
    banner: string;
    des: string;
    content: string; // TipTap content JSON string
    tags: string[];
    draft: boolean;
  };
  onSave: (data: {
    title: string;
    banner: string;
    des: string;
    content: string;
    tags: string[];
    draft: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function Editor({ initialData, onSave, isSubmitting }: EditorProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [banner, setBanner] = useState(initialData?.banner || "");
  const [des, setDes] = useState(initialData?.des || "");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("Draft saved locally");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize TipTap
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({
        openOnClick: false,
      }),
    ],
    content: initialData?.content ? JSON.parse(initialData.content) : "",
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none tiptap-content min-h-[400px] py-4",
      },
    },
  });

  // Debounced Auto-Save Draft
  useEffect(() => {
    if (!editor) return;
    
    const interval = setInterval(() => {
      if (title.trim() || editor.getText().trim()) {
        const localDraft = {
          title,
          banner,
          des,
          content: JSON.stringify(editor.getJSON()),
          tags,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem("inkvibe_local_draft", JSON.stringify(localDraft));
        
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setAutoSaveStatus(`Last auto-saved at ${now}`);
      }
    }, 10000); // Auto-save draft parameters to localStorage every 10 seconds

    return () => clearInterval(interval);
  }, [editor, title, banner, des, tags]);

  // Restore draft if available and user wants to
  useEffect(() => {
    const saved = localStorage.getItem("inkvibe_local_draft");
    if (saved && !initialData) {
      toast((t) => (
        <div className="flex flex-col space-y-2 text-sm text-ink-light dark:text-ink-dark">
          <p className="font-medium">Found an unsaved local draft. Restore it?</p>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                try {
                  const parsed = JSON.parse(saved);
                  setTitle(parsed.title);
                  setBanner(parsed.banner);
                  setDes(parsed.des);
                  setTags(parsed.tags);
                  if (editor && parsed.content) {
                    editor.commands.setContent(JSON.parse(parsed.content));
                  }
                  toast.dismiss(t.id);
                  toast.success("Draft restored");
                } catch (e) {
                  toast.error("Failed to restore draft");
                }
              }}
              className="bg-accent text-stone-950 px-3 py-1 rounded-full text-xs font-semibold"
            >
              Yes
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("inkvibe_local_draft");
                toast.dismiss(t.id);
              }}
              className="border border-borderCol-light dark:border-borderCol-dark px-3 py-1 rounded-full text-xs font-semibold"
            >
              Discard
            </button>
          </div>
        </div>
      ), { duration: 8000, position: "top-center" });
    }
  }, [editor, initialData]);

  // Handle cover image upload
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingBanner(true);
      const url = await uploadToCloudinary(file, "banners");
      setBanner(url);
      toast.success("Cover image uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload cover image");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Handle image insertion inside editor
  const handleInlineImageInsert = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      const loadingId = toast.loading("Uploading inline image...");
      try {
        const url = await uploadToCloudinary(file, "inline-images");
        editor.chain().focus().setImage({ src: url }).run();
        toast.success("Image inserted", { id: loadingId });
      } catch (err) {
        toast.error("Failed to upload image", { id: loadingId });
      }
    };
    input.click();
  };

  // Tag Manager helpers
  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const cleaned = tagInput.trim().toLowerCase();
      if (!tags.includes(cleaned)) {
        if (tags.length >= 5) {
          toast.error("Maximum of 5 tags allowed");
          return;
        }
        setTags([...tags, cleaned]);
      }
      setTagInput("");
    }
  };

  const handleTagRemove = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (draft: boolean) => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!editor || editor.getText().trim() === "") {
      toast.error("Please enter some article content");
      return;
    }
    
    // Auto generate short description if empty
    let finalDes = des;
    if (!finalDes.trim()) {
      finalDes = editor.getText().substring(0, 150) + "...";
    }

    const payload = {
      title,
      banner,
      des: finalDes,
      content: JSON.stringify(editor.getJSON()),
      tags,
      draft,
    };

    await onSave(payload);
    // Clear local cache draft upon success
    localStorage.removeItem("inkvibe_local_draft");
  };

  if (!editor) return null;

  return (
    <div className="w-full space-y-6">
      
      {/* Save state status */}
      <div className="flex items-center justify-between text-xs text-mutedText-light dark:text-mutedText-dark font-medium border-b border-borderCol-light/50 dark:border-borderCol-dark/50 pb-2">
        <span>Auto-save: {autoSaveStatus}</span>
        <span className="flex items-center"><Save className="w-3.5 h-3.5 mr-1" /> Ready</span>
      </div>

      {/* Cover Banner Area */}
      <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden border border-dashed border-borderCol-light dark:border-borderCol-dark bg-stone-50 dark:bg-stone-900/20 group transition-all duration-300">
        {banner ? (
          <>
            <img src={banner} alt="Cover Banner" className="w-full h-full object-cover" />
            <button
              onClick={() => setBanner("")}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full backdrop-blur-sm transition-colors"
              title="Remove cover"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingBanner}
            className="w-full h-full flex flex-col items-center justify-center space-y-2 text-stone-500 hover:text-accent transition-colors"
          >
            <UploadCloud className="w-10 h-10 animate-pulse" />
            <span className="text-sm font-medium">
              {isUploadingBanner ? "Uploading cover..." : "Upload cover banner (Optional)"}
            </span>
            <span className="text-xs text-stone-400">Optimal size 1200x500 pixels</span>
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleBannerUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Post Title Field */}
      <textarea
        placeholder="Enter your title here..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        rows={1}
        className="w-full text-4xl font-serif font-bold tracking-tight bg-transparent text-ink-light dark:text-ink-dark border-none focus:outline-none resize-none placeholder-stone-300 dark:placeholder-stone-800"
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = "auto";
          target.style.height = `${target.scrollHeight}px`;
        }}
      />

      {/* Editor Description Field */}
      <input
        type="text"
        placeholder="Add a short summary description (Optional)"
        value={des}
        onChange={(e) => setDes(e.target.value)}
        className="w-full text-base font-sans bg-transparent text-mutedText-light dark:text-mutedText-dark border-b border-borderCol-light/50 dark:border-borderCol-dark/50 pb-2 focus:outline-none focus:border-accent"
      />

      {/* TipTap Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 border border-borderCol-light dark:border-borderCol-dark bg-stone-50/50 dark:bg-stone-950/20 rounded-xl">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg transition-colors ${editor.isActive("heading", { level: 1 }) ? "bg-accent/20 text-accent" : "hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-400"}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition-colors ${editor.isActive("heading", { level: 2 }) ? "bg-accent/20 text-accent" : "hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-400"}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="h-6 w-[1px] bg-borderCol-light dark:bg-borderCol-dark mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-colors ${editor.isActive("bold") ? "bg-accent/20 text-accent" : "hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-400"}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-colors ${editor.isActive("italic") ? "bg-accent/20 text-accent" : "hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-400"}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="h-6 w-[1px] bg-borderCol-light dark:bg-borderCol-dark mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-colors ${editor.isActive("bulletList") ? "bg-accent/20 text-accent" : "hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-400"}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition-colors ${editor.isActive("orderedList") ? "bg-accent/20 text-accent" : "hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-400"}`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg transition-colors ${editor.isActive("blockquote") ? "bg-accent/20 text-accent" : "hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-400"}`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded-lg transition-colors ${editor.isActive("codeBlock") ? "bg-accent/20 text-accent" : "hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-400"}`}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          onClick={handleInlineImageInsert}
          className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-400 transition-colors"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <div className="h-6 w-[1px] bg-borderCol-light dark:bg-borderCol-dark mx-1" />
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-400 transition-colors"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-400 transition-colors"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Body Wrapper */}
      <div className="border border-borderCol-light dark:border-borderCol-dark bg-white dark:bg-canvas-cardDark/40 px-6 py-2 rounded-2xl">
        <EditorContent editor={editor} />
      </div>

      {/* Category Tag Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Category Tags (Limit 5)
        </label>
        <div className="flex flex-wrap gap-2 p-2 border border-borderCol-light dark:border-borderCol-dark bg-stone-50/50 dark:bg-stone-950/10 rounded-xl">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="flex items-center bg-stone-100 dark:bg-stone-900 border border-borderCol-light dark:border-borderCol-dark text-stone-800 dark:text-stone-200 px-3 py-1 rounded-full text-xs font-medium"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleTagRemove(idx)}
                className="ml-1.5 text-stone-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={tags.length < 5 ? "Type a category name and hit Enter..." : "Tag limit reached"}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagAdd}
            disabled={tags.length >= 5}
            className="flex-grow bg-transparent text-sm focus:outline-none min-w-[200px] text-ink-light dark:text-ink-dark py-1"
          />
        </div>
      </div>

      {/* Publish Controls */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-borderCol-light/50 dark:border-borderCol-dark/50">
        <button
          onClick={() => handleSubmit(true)}
          disabled={isSubmitting}
          className="border border-borderCol-light dark:border-borderCol-dark text-stone-700 dark:text-stone-300 px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:bg-stone-50 dark:hover:bg-stone-950 disabled:opacity-50"
        >
          Save as Draft
        </button>
        <button
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting}
          className="bg-accent hover:bg-accent-hover text-stone-950 px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Publish Story
        </button>
      </div>
      
    </div>
  );
}
