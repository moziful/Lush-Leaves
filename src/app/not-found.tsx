"use client";

import Link from "next/link";
import Image from "next/image";
import { FiHome, FiCompass } from "react-icons/fi";
import { motion } from "framer-motion";

import Button from "@/components/Button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-cream px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg text-center space-y-8 select-none">
        <div className="relative mx-auto h-64 w-64 md:h-80 md:w-80 rounded-3xl overflow-hidden shadow-xl border border-sage/20 bg-white">
          <Image
            src="https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=600"
            alt="Beautiful monstera leaf close-up"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest/50 to-transparent" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-sage/20 rounded-2xl px-5 py-2 shadow-lg"
          >
            <span className="text-4xl font-extrabold text-forest tracking-tight">404</span>
          </motion.div>
        </div>
        <div className="space-y-3.5 max-w-md mx-auto">
          <h1 className="text-3xl font-black text-forest-dark tracking-tight leading-tight">
            Off the Garden Path
          </h1>
          <p className="text-sm text-forest/70 leading-relaxed font-medium">
            Oops! It seems the page you are looking for has withered away or has not grown yet. Let&apos;s get you back to familiar ground.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" className="flex w-full items-center justify-center gap-2">
              <FiHome className="text-base" />
              Back to Home
            </Button>
          </Link>
          <Link href="/explore" className="w-full sm:w-auto">
            <Button variant="outline" className="flex w-full items-center justify-center gap-2">
              <FiCompass className="text-base" />
              Explore All Plants
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
