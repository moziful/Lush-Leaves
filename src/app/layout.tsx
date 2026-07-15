import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/context/ToastContext";
import GoogleAuthProvider from "@/components/GoogleAuthProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LushLeaves - Premium Indoor Plants",
  description: "Breathe fresh air and design premium botanical aesthetics for your space.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-slate-800 font-sans">
        <GoogleAuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </ToastProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}

