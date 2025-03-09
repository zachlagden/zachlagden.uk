"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 font-[system-ui] text-neutral-900 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100">
            <span className="text-4xl font-bold text-neutral-800">404</span>
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl font-bold tracking-tighter mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Page Not Found
        </motion.h1>

        <motion.p
          className="text-neutral-600 mb-8 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            href="/"
            className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-lg hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-neutral-600 py-2 px-4 rounded-lg hover:text-neutral-900 hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>
      </div>

      <motion.div
        className="mt-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <p className="text-xs text-neutral-400">
          © {new Date().getFullYear()} Zach Lagden
        </p>
      </motion.div>
    </div>
  );
}
