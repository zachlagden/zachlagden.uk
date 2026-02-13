"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Instagram, Mail } from "lucide-react";
import { ChevronDown } from "lucide-react";

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/zachlagden",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/zachlagden/",
    icon: Linkedin,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/z.lagden",
    icon: Instagram,
  },
  {
    label: "Email",
    href: "mailto:zach@zachlagden.uk",
    icon: Mail,
  },
];

export default function HeroSection() {
  return (
    <section className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center relative px-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Name with gradient */}
        <h1
          className="font-heading text-7xl font-bold tracking-tighter md:text-8xl"
          style={{
            backgroundImage: "linear-gradient(135deg, #06b6d4, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Zach Lagden
        </h1>

        {/* Tagline */}
        <p className="mt-4 text-xl text-zinc-400">
          Full-Stack Developer &amp; Digital Entrepreneur
        </p>

        {/* Social links */}
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target={social.href.startsWith("mailto:") ? undefined : "_blank"}
              rel={
                social.href.startsWith("mailto:")
                  ? undefined
                  : "noopener noreferrer"
              }
              className="flex items-center gap-2 text-zinc-500 transition-colors hover:text-cyan-500"
              aria-label={social.label}
            >
              <social.icon className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm">{social.label}</span>
            </a>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-0 right-0 flex justify-center"
        aria-hidden="true"
      >
        <div className="animate-bounce-subtle">
          <ChevronDown className="h-6 w-6 text-zinc-600" />
        </div>
      </div>
    </section>
  );
}
