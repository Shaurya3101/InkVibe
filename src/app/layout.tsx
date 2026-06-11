import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import QueryProvider from "@/providers/QueryProvider";
import { SocketProvider } from "@/providers/SocketProvider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InkVibe | A Space for Modern Writers & Thinkers",
  description: "Read, write, and engage. InkVibe is a luxury blogging platform designed for deep stories and beautiful reading experiences.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "InkVibe | A Space for Modern Writers & Thinkers",
    description: "Read, write, and engage on InkVibe.",
    siteName: "InkVibe",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex flex-col min-h-screen">
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider>
              <SocketProvider>
                <Navbar />
                <main className="flex-grow flex flex-col w-full">
                  {children}
                </main>
                <Footer />
                <Toaster position="bottom-right" reverseOrder={false} />
              </SocketProvider>
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
