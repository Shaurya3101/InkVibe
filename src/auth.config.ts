import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const isAuthRoute = ["/login", "/signup", "/forgot-password", "/reset-password"].some((route) =>
        nextUrl.pathname.startsWith(route)
      );
      
      const isProtectedRoute = ["/write", "/dashboard", "/profile/edit", "/bookmarks"].some((route) =>
        nextUrl.pathname.startsWith(route)
      );

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (isProtectedRoute) {
        if (!isLoggedIn) {
          let callbackUrl = nextUrl.pathname;
          if (nextUrl.search) {
            callbackUrl += nextUrl.search;
          }
          const encodedCallbackUrl = encodeURIComponent(callbackUrl);
          return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
        }
        return true;
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
