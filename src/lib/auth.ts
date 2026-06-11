import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) {
          throw new Error("User does not exist or was registered via Google");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Incorrect password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar || "",
          username: user.username,
        } as any;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect();
        
        let existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          let baseUsername = user.email ? user.email.split("@")[0] : "user";
          baseUsername = baseUsername.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          
          let username = baseUsername;
          let userExists = await User.findOne({ username });
          let counter = 1;
          
          while (userExists) {
            username = `${baseUsername}${counter}`;
            userExists = await User.findOne({ username });
            counter++;
          }
          
          existingUser = await User.create({
            name: user.name || "Anonymous",
            email: user.email || "",
            avatar: user.image || "",
            username,
            social_links: { github: "", twitter: "", website: "", instagram: "" },
          });
        }
        
        user.id = existingUser._id.toString();
        (user as any).username = existingUser.username;
        user.image = existingUser.avatar;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        token.name = session.name;
        token.picture = session.image;
        token.username = session.username;
        return token;
      }

      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.picture = user.image;
      } else if (!token.username) {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.username = dbUser.username;
          token.picture = dbUser.avatar;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
});
