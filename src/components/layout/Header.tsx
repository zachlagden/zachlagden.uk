"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Mail, MapPin } from "lucide-react";
import SocialIcon from "../ui/SocialIcon";
import CopyButton from "../ui/CopyButton";
import { Github, Linkedin, Instagram } from "lucide-react";
import PresenceStatus from "../ui/PresenceStatus";
import { ContentData } from "@/types/content";

type IntroPhase = "letters" | "fall" | "reveal" | "done";

// Large font-size for the intro (renders crisp, no scale blur)
const INTRO_FONT_SIZE = "clamp(3rem, 13vw, 11rem)";

interface HeaderProps {
  prefersReducedMotion: boolean;
  isMobile: boolean;
  content: ContentData;
  onIntroComplete: () => void;
}

const Header: React.FC<HeaderProps> = ({
  prefersReducedMotion,
  isMobile,
  content,
  onIntroComplete,
}) => {
  const [introPhase, setIntroPhase] = useState<IntroPhase>(
    prefersReducedMotion ? "done" : "letters",
  );

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  const headerScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const headerTranslateY = useTransform(scrollY, [0, 300], [0, -20]);

  const nameChars = content.personal.name.split("");
  const h1Ref = useRef<HTMLHeadingElement>(null);

  // Scale ratio used when transitioning from large font-size to normal.
  // Calculated once at the start of "fall" so the size swap is seamless.
  const [fallStartScale, setFallStartScale] = useState(1);

  // Lock body scroll during intro
  useEffect(() => {
    if (prefersReducedMotion) {
      onIntroComplete();
      return;
    }

    if (introPhase !== "done") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [introPhase, prefersReducedMotion, onIntroComplete]);

  // Phase transitions
  const handleLettersComplete = useCallback(() => {
    const timer = setTimeout(() => {
      // Measure the large size before swapping to normal
      if (h1Ref.current) {
        const largeHeight = h1Ref.current.getBoundingClientRect().height;
        // Temporarily apply normal sizing to measure target
        const prevFontSize = h1Ref.current.style.fontSize;
        h1Ref.current.style.fontSize = "";
        const normalHeight = h1Ref.current.getBoundingClientRect().height;
        h1Ref.current.style.fontSize = prevFontSize;

        if (normalHeight > 0) {
          setFallStartScale(largeHeight / normalHeight);
        }
      }
      setIntroPhase("fall");
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFallComplete = useCallback(() => {
    setIntroPhase("reveal");
  }, []);

  const handleRevealComplete = useCallback(() => {
    setIntroPhase("done");
    onIntroComplete();
  }, [onIntroComplete]);

  // Trigger reveal-complete after last element animates
  useEffect(() => {
    if (introPhase !== "reveal") return;
    const timer = setTimeout(handleRevealComplete, 1300);
    return () => clearTimeout(timer);
  }, [introPhase, handleRevealComplete]);

  // Track when all letters have animated in
  const [lettersAnimated, setLettersAnimated] = useState(0);
  useEffect(() => {
    if (
      introPhase === "letters" &&
      lettersAnimated >= nameChars.length &&
      nameChars.length > 0
    ) {
      handleLettersComplete();
    }
  }, [lettersAnimated, nameChars.length, introPhase, handleLettersComplete]);

  const introDone = introPhase === "done";

  // During "letters" phase: use large font-size for crisp rendering.
  // During "fall" and after: use normal font-size (Tailwind classes handle it).
  const useIntroFontSize = introPhase === "letters";

  // Slide-up reveal helper
  const revealVariant = (delayAfterLand: number) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: delayAfterLand,
      },
    },
  });

  return (
    <motion.header
      className="h-screen flex flex-col justify-center items-center relative"
      style={{
        opacity: introDone ? headerOpacity : 1,
        scale: introDone ? headerScale : 1,
        y: introDone ? headerTranslateY : 0,
      }}
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

      <div className="relative z-20 text-center px-4">
        {/* Name — animated character-by-character, then 3D fall */}
        <motion.div
          style={{ perspective: 1000 }}
          className="flex justify-center"
        >
          <motion.h1
            ref={h1Ref}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter mb-3 inline-flex flex-wrap justify-center"
            style={{
              transformOrigin: "center center",
              // Large font-size during "letters" for crisp text, removed after
              ...(useIntroFontSize ? { fontSize: INTRO_FONT_SIZE } : {}),
            }}
            initial={
              prefersReducedMotion
                ? { scale: 1, rotateX: 0 }
                : { scale: 1, rotateX: 0 }
            }
            animate={
              prefersReducedMotion
                ? { scale: 1, rotateX: 0, y: 0 }
                : introPhase === "letters"
                  ? { scale: 1, rotateX: 0, y: 0 }
                  : introPhase === "fall"
                    ? {
                        scale: [fallStartScale, 1],
                        rotateX: [0, 18, 5, 0],
                        y: [0, 10, -3, 0],
                      }
                    : { scale: 1, rotateX: 0, y: 0 }
            }
            transition={
              introPhase === "fall"
                ? {
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                  }
                : { duration: 0 }
            }
            onAnimationComplete={() => {
              if (introPhase === "fall") {
                handleFallComplete();
              }
            }}
          >
            {nameChars.map((char, i) => (
              <motion.span
                key={i}
                className="inline-block"
                style={char === " " ? { width: "0.3em" } : undefined}
                initial={
                  prefersReducedMotion
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 40 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        duration: 0.4,
                        ease: "easeOut",
                        delay: 0.3 + i * 0.05,
                      }
                }
                onAnimationComplete={() => {
                  if (!prefersReducedMotion) {
                    setLettersAnimated((prev) => prev + 1);
                  }
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h1>
        </motion.div>

        {/* Title */}
        <motion.p
          className="text-xl sm:text-2xl text-neutral-600 mb-2 font-light tracking-wide"
          variants={revealVariant(0.15)}
          initial={prefersReducedMotion ? "visible" : "hidden"}
          animate={
            prefersReducedMotion || introPhase === "reveal" || introDone
              ? "visible"
              : "hidden"
          }
        >
          {content.personal.title}
        </motion.p>

        {/* Contact info row */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4"
          variants={revealVariant(0.3)}
          initial={prefersReducedMotion ? "visible" : "hidden"}
          animate={
            prefersReducedMotion || introPhase === "reveal" || introDone
              ? "visible"
              : "hidden"
          }
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
            &bull;
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

        {/* Presence Status */}
        <motion.div
          variants={revealVariant(0.45)}
          initial={prefersReducedMotion ? "visible" : "hidden"}
          animate={
            prefersReducedMotion || introPhase === "reveal" || introDone
              ? "visible"
              : "hidden"
          }
        >
          <PresenceStatus prefersReducedMotion={prefersReducedMotion} />
        </motion.div>

        {/* Mobile social links */}
        <motion.div
          className="lg:hidden flex justify-center gap-6 mt-8"
          variants={revealVariant(0.6)}
          initial={prefersReducedMotion ? "visible" : "hidden"}
          animate={
            prefersReducedMotion || introPhase === "reveal" || introDone
              ? "visible"
              : "hidden"
          }
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
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-0 right-0 flex justify-center"
        variants={revealVariant(0.75)}
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate={
          prefersReducedMotion || introPhase === "reveal" || introDone
            ? "visible"
            : "hidden"
        }
        aria-hidden="true"
      >
        <motion.div
          className="w-1 h-16 relative"
          animate={
            introDone
              ? {
                  scaleY: isMobile ? [0.5, 1, 0.5] : [0.3, 1, 0.3],
                  opacity: isMobile ? [0.3, 0.7, 0.3] : [0.2, 0.6, 0.2],
                }
              : {}
          }
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
