# Implementation Plan - InkVibe Blogging Platform

InkVibe is a premium, production-ready, beautiful blogging platform built using a modern Next.js 14+ App Router, MongoDB, Mongoose, NextAuth v5, Socket.io, Zustand, and TipTap.

---

## User Review Required

Please review the following updated decisions before we proceed:

> [!IMPORTANT]
> **Bespoke, Authentic UX & Copywriting**
> To avoid looking like a template or AI-generated project:
> - **No Dashboard Hyphens**: Avoid lists formatted with raw hyphens or empty dashes (`-`) in the UI; use elegant icons, dots, card layouts, or rich borders instead.
> - **Human-written Copy**: Write elegant, warm, and natural copywriting for placeholders, empty states, and dashboard labels (e.g., "Begin your next masterpiece" instead of "Create new-post", and "No articles published yet" instead of "No-blogs found").
> - **Aesthetics**: Premium serif titles, soft background fills, subtle shadows, and smooth micro-interactions.

> [!IMPORTANT]
> **Workspace Cleanup**
> - We will completely remove the legacy folders (`blogging website - frontend` and `server`) to start with a clean Next.js + Tailwind + TypeScript workspace.

---

## Proposed Folder Structure
We will create a unified, type-safe codebase under the following structure:

```
InkVibe/ (Workspace Root)
├── socket/                        # Standalone Socket.io notification server
│   ├── index.js
│   └── package.json
├── src/
│   ├── app/                       # Next.js App Router pages & API routes
│   │   ├── layout.tsx             # Root layout with providers & Toast
│   │   ├── page.tsx               # Homepage (Hero, Featured, Category filter, Sidebar)
│   │   ├── login/page.tsx         # NextAuth Credentials/Google login
│   │   ├── signup/page.tsx        # Email/password signup page
│   │   ├── forgot-password/page.tsx # Request password reset email
│   │   ├── reset-password/[token]/page.tsx # Reset password action page
│   │   ├── dashboard/             # Logged-in user dashboard
│   │   │   ├── page.tsx           # Blog stats & analytics graphs
│   │   │   └── blogs/page.tsx     # Draft & Published blogs manager
│   │   ├── profile/
│   │   │   ├── [username]/page.tsx # Public writer profile (Followers/Following, posts list)
│   │   │   └── edit/page.tsx      # Profile details & avatar editor
│   │   ├── write/page.tsx         # TipTap blog editor (New + Edit post, cover upload)
│   │   ├── blog/[slug]/page.tsx   # Premium article page (TOC, content, nested comments, suggestions)
│   │   ├── bookmarks/page.tsx     # Bookmarked posts collection page
│   │   ├── search/page.tsx        # Live search for blogs & authors
│   │   └── api/                   # Route handlers
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── auth/signup/route.ts
│   │       ├── auth/forgot-password/route.ts
│   │       ├── auth/reset-password/route.ts
│   │       ├── blogs/route.ts
│   │       ├── blogs/[slug]/route.ts
│   │       ├── blogs/[slug]/like/route.ts
│   │       ├── blogs/[slug]/bookmark/route.ts
│   │       ├── blogs/[slug]/comments/route.ts
│   │       ├── comments/[commentId]/route.ts
│   │       ├── users/[username]/route.ts
│   │       ├── users/[username]/follow/route.ts
│   │       ├── users/profile/route.ts
│   │       ├── upload/route.ts     # Handles signed Cloudinary uploads
│   │       └── notifications/route.ts # Fetch/read notifications
│   ├── components/                # Reusable UI components
│   │   ├── Navbar.tsx             # Site header (Logo, dynamic notifications count, user avatar)
│   │   ├── Footer.tsx             # Footer
│   │   ├── Sidebar.tsx            # Search, categories, trending blogs widget
│   │   ├── Editor.tsx             # TipTap Editor component (Images, code, auto-save)
│   │   ├── CommentsSection.tsx    # Nested comments rendering with reply form
│   │   ├── NotificationDropdown.tsx # Real-time notification tray
│   │   ├── TableOfContents.tsx    # Dynamic TOC linking headings
│   │   ├── ReadingProgressBar.tsx # Reading scroll indicator
│   │   ├── BlogCard.tsx           # Premium grid blog preview card
│   │   ├── DashboardStats.tsx     # Analytics dashboards
│   │   └── ui/                    # Base UI buttons, modals, input elements
│   ├── lib/                       # Helpers & database configurations
│   │   ├── db.ts                  # Cached Mongoose connection helper
│   │   ├── utils.ts               # Reading time calculator, slugifier, tailwind merge
│   │   ├── cloudinary.ts          # Server-side Cloudinary helper
│   │   └── models/                # Mongoose Models
│   │       ├── User.ts
│   │       ├── Blog.ts
│   │       ├── Comment.ts
│   │       ├── Notification.ts
│   │       └── Category.ts
│   ├── providers/                 # Client wrapper providers
│   │   ├── QueryProvider.tsx      # TanStack Query client wrapper
│   │   ├── ThemeProvider.tsx      # Light/dark mode context provider
│   │   └── SocketProvider.tsx     # Socket.io connection manager
│   └── store/                     # Zustand state management
│       ├── useNotificationStore.ts # Global notifications queue
│       └── useThemeStore.ts       # Global theme preferences
├── public/                        # Static assets (logo, place-holder images)
├── tailwind.config.ts             # Custom luxury design color theme tokens
├── package.json
└── tsconfig.json
```

---

## Technical Details & Architecture

### 1. Database Connection & Models (Mongoose & MongoDB Atlas)
We will implement an efficient, indexed schema setup in TypeScript:
- **`User`**: Fields for `name`, `username`, `email`, `password` (hashed), `avatar`, `bio`, `social_links` (github, twitter, website), `followers` (array of User Refs), `following` (array of User Refs), `bookmarks` (array of Blog Refs). Indexes on `username` and `email` for rapid querying.
- **`Blog`**: Fields for `title`, `slug` (indexed & unique), `banner` (cover image), `des` (description), `content` (TipTap JSON string), `tags` (array), `author` (User Ref), `activity` (object with `total_likes`, `total_comments`, `total_reads`, `total_parent_comments`), `draft` (boolean), `publishedAt` (date).
- **`Comment`**: Hierarchical nested comment system. Every comment will have `blog_id`, `blog_author`, `comment` (body), `commented_by` (User Ref), `parent_comment` (null or Comment Ref for replies), `children` (array of Comment Refs), `isReply` (boolean).
- **`Notification`**: Fields for `type` (`like`, `comment`, `reply`, `follow`), `blog` (Blog Ref, optional), `notification_for` (User Ref - recipient), `user` (User Ref - triggerer), `comment` (Comment Ref, optional), `seen` (boolean).
- **`Category`**: For managing tag categories.

We will use a cached connection helper (`src/lib/db.ts`) to prevent serverless function cold starts from opening multiple database connections.

### 2. NextAuth.js v5 Flow
NextAuth v5 (Auth.js) will handle the auth flow:
- **Credentials Provider**: Custom login verifying hashed passwords using `bcryptjs`.
- **Google OAuth**: Integrated Google provider, which links or creates a User profile on successful sign-in.
- **JWT & Session Strategy**:
  - We use JWT tokens to store session state.
  - The JWT callback will fetch the database User profile (username, avatar, id) and inject it into the session.
  - Middleware will protect routes like `/write`, `/dashboard`, `/profile/edit`, `/bookmarks`.

### 3. State Management & API Querying
- **Zustand**: Used for lightweight, non-server-persisted state, such as real-time socket notification queues and UI state.
- **TanStack Query (React Query)**: Used for robust fetching, caching, and cache invalidation of comments, likes, bookmarks, search queries, and analytics statistics.

### 4. Rich Text Editor (TipTap)
A premium editing interface:
- **TipTap Core**: Custom node configurations for Headings, Bold, Italic, CodeBlocks (syntax highlighting), Lists, Blockquotes, and Custom Image Node.
- **Cloudinary Image Upload**: Drag-and-drop or select an image inside TipTap. The image will be uploaded directly to Cloudinary and inserted as an `<img src="..." />` element.
- **Auto-Save Drafts**: Debounced auto-save function. When typing, it sends an update request to `/api/blogs/[slug]` every 5 seconds to save details in MongoDB.

### 5. Design & Styling (Tailwind Custom Tokens)
We will define specific premium design tokens in `tailwind.config.ts`:
- **Light Mode Palette**: Clean, soft canvas (`#faf9f6` alabaster / cream), deep warm-gray typography, elegant slate borders, and subtle gold/bronze accents (`#b8860b` or `#c5a880`) for that luxurious literary feel.
- **Dark Mode Palette**: Deep charcoal canvas (`#121212`), high-contrast off-white typography, borders in muted metallic gray (`#262626`), matching gold/bronze accents.
- **Typography**: Inter (modern, highly readable UI text) + Playfair Display or Merriweather (serif typeface for title and blog body readability).

---

## Verification Plan

### Automated Tests & Linting
- **Compilation check**: Run `npm run build` locally to ensure zero TypeScript or compilation errors.
- **Linting**: Ensure zero ESLint errors in the React files.

### Manual Verification
1. **Auth flow**: Register user, log in via credentials, log out, log in via Google OAuth. Confirm password reset triggers properly.
2. **Blog CRUD**: Create draft, see auto-save trigger, update cover image, add content in TipTap, write code blocks, hit "Publish". Verify SEO metadata loads.
3. **Interactions**: Log in as User B, view User A's blog, click Like and Bookmark. Confirm comments and sub-replies work dynamically.
4. **Socket.io Sync**: Open User A's browser, open User B's browser in incognito. User B likes/comments on User A's post. Verify User A receives a real-time toast and notification count increment instantly.
5. **Responsiveness & Theme**: Verify layout on mobile and toggle dark/light modes.
