"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Mail, MapPin } from "lucide-react";
import SocialIcon from "../ui/SocialIcon";
import CopyButton from "../ui/CopyButton";
import { Github, Linkedin, Instagram } from "lucide-react";
import AnimatedText from "../ui/AnimatedText";
import { ContentData } from "@/types/content";

interface HeaderProps {
  prefersReducedMotion: boolean;
  isMobile: boolean;
  content: ContentData;
}

const Header: React.FC<HeaderProps> = ({
  prefersReducedMotion,
  isMobile,
  content,
}) => {
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  const headerScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const headerTranslateY = useTransform(scrollY, [0, 300], [0, -20]);

  return (
    <motion.header
      className="h-screen flex flex-col justify-center items-center relative"
      style={{
        opacity: headerOpacity,
        scale: headerScale,
        y: headerTranslateY,
      }}
      transition={{}}
      initial={{ opacity: 1, scale: 1, y: 0 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-neutral-900/5 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 1 }}
          aria-hidden="true"
        />
      </div>

      <motion.div
        className="relative z-20 text-center px-4"
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.2,
          duration: prefersReducedMotion ? 0.1 : 0.8,
        }}
      >
        {/* Animated text heading */}
        <AnimatedText
          text={content.personal.name}
          el="h1"
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter mb-3"
          delay={0.4}
          duration={0.8}
          sequential={true}
        />

        {/* Animated text paragraph */}
        <AnimatedText
          text={content.personal.title}
          el="p"
          className="text-xl sm:text-2xl text-neutral-600 mb-8 font-light tracking-wide"
          delay={0.8}
          duration={0.6}
          sequential={true}
        />

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.8,
            duration: prefersReducedMotion ? 0.1 : 0.8,
          }}
        >
          <div className="flex items-center hover:text-neutral-800 text-neutral-500 transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2 rounded-lg px-2 py-1">
            <a
              href={`mailto:${content.personal.email}`}
              className="flex items-center gap-2"
              aria-label={`Email ${content.personal.name.split(" ")[0]} at ${content.personal.email}`}
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm tracking-wide">
                {content.personal.email}
              </span>
            </a>
            <CopyButton textToCopy={content.personal.email} size="sm" />
          </div>
          <span className="hidden sm:block text-neutral-300" aria-hidden="true">
            •
          </span>
          <a
            href={content.personal.locationMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-neutral-800 text-neutral-500 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded-lg px-2 py-1"
            aria-label={`Location: ${content.personal.location} (opens Google Maps)`}
          >
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm tracking-wide">
              {content.personal.location}
            </span>
          </a>
        </motion.div>

        <motion.div
          className="lg:hidden flex justify-center gap-6 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 1,
            duration: prefersReducedMotion ? 0.1 : 0.8,
          }}
          role="navigation"
          aria-label="Social Links"
        >
          <SocialIcon
            size="sm"
            label="GitHub Profile"
            href={content.personal.social.github}
            icon={<Github className="w-4 h-4" aria-hidden="true" />}
          />
          <SocialIcon
            size="sm"
            label="LinkedIn Profile"
            href={content.personal.social.linkedin}
            icon={<Linkedin className="w-4 h-4" aria-hidden="true" />}
          />
          <SocialIcon
            size="sm"
            label="Instagram Profile"
            href={content.personal.social.instagram}
            icon={<Instagram className="w-4 h-4" aria-hidden="true" />}
          />
          <SocialIcon
            size="sm"
            label="Email Contact"
            href={`mailto:${content.personal.social.email}`}
            icon={<Mail className="w-4 h-4" aria-hidden="true" />}
          />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-12 left-0 right-0 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 1.2,
          duration: prefersReducedMotion ? 0.1 : 0.8,
        }}
        aria-hidden="true"
      >
        <motion.div
          className="w-1 h-16 relative"
          animate={{
            scaleY: isMobile ? [0.5, 1, 0.5] : [0.3, 1, 0.3],
            opacity: isMobile ? [0.3, 0.7, 0.3] : [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: isMobile ? 1.5 : 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-300 to-transparent" />
        </motion.div>
      </motion.div>
    </motion.header>
  );
};

export default Header;
