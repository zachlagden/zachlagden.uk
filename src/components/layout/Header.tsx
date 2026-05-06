"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Mail, MapPin } from "lucide-react";
import SocialIcon from "../ui/SocialIcon";
import CopyButton from "../ui/CopyButton";
import { Github, Linkedin, Instagram } from "lucide-react";
import PresenceStatus from "../ui/PresenceStatus";
import { ContentData } from "@/types/content";

type IntroPhase = "loading" | "letters" | "fall" | "reveal" | "done";

// Target width as a fraction of viewport (0.92 = 92% of viewport width)
const INTRO_WIDTH_RATIO = 0.92;

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
    prefersReducedMotion ? "done" : "loading",
  );

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  const headerScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const headerTranslateY = useTransform(scrollY, [0, 300], [0, -20]);

  const nameChars = content.personal.name.split("");
  const h1Ref = useRef<HTMLHeadingElement>(null);

  // Dynamically computed intro font size that fills ~92% of viewport width.
  // Measured once after fonts load by rendering at a probe size and scaling.
  const [introFontSize, setIntroFontSize] = useState<string | undefined>(
    undefined,
  );

  // Scale ratio used when transitioning from large font-size to normal.
  // Calculated once at the start of "fall" so the size swap is seamless.
  const [fallStartScale, setFallStartScale] = useState(1);

  // Remove loader and unlock body on reduced motion or intro complete
  useEffect(() => {
    if (prefersReducedMotion) {
      // Immediately hide loader and unlock
      const loader = document.getElementById("initial-loader");
      if (loader) loader.style.display = "none";
      document.body.classList.remove("intro-locked");
      onIntroComplete();
      return;
    }

    if (introPhase === "done") {
      document.body.classList.remove("intro-locked");
    }
  }, [introPhase, prefersReducedMotion, onIntroComplete]);

  // Measure the ideal intro font size so the name fills the viewport width.
  // Renders h1 at a known probe size, measures width, then scales to fit.
  const measureIntroFontSize = useCallback(() => {
    const el = h1Ref.current;
    if (!el) return;

    const PROBE_SIZE = 100; // px — arbitrary base for measurement
    const prev = el.style.fontSize;
    el.style.fontSize = `${PROBE_SIZE}px`;
    const textWidth = el.scrollWidth;
    el.style.fontSize = prev;

    if (textWidth > 0) {
      const available = window.innerWidth * INTRO_WIDTH_RATIO;
      const ideal = Math.floor((available / textWidth) * PROBE_SIZE);
      // Floor to avoid sub-pixel rounding that could still overflow
      setIntroFontSize(`${ideal}px`);
    }
  }, []);

  // Detect if page loaded with scroll offset (e.g. browser restored scroll position)
  const subscribeNoop = useCallback(() => () => {}, []);
  const getIsScrolled = useCallback(() => window.scrollY > 0, []);
  const getIsScrolledServer = useCallback(() => false, []);
  const wasScrolledOnLoad = useSyncExternalStore(
    subscribeNoop,
    getIsScrolled,
    getIsScrolledServer,
  );

  // Font readiness gate — wait for fonts then measure, fade out loader, start letters.
  // If the page loads with a scroll offset (e.g. user reloaded while scrolled down),
  // skip the entire intro sequence to avoid a broken animation.
  useEffect(() => {
    if (introPhase !== "loading") return;

    // Skip intro when page is already scrolled (e.g. browser restored scroll position)
    if (wasScrolledOnLoad) {
      const loader = document.getElementById("initial-loader");
      if (loader) loader.style.display = "none";
      document.body.classList.remove("intro-locked");
      // Use requestAnimationFrame to defer the state update out of the synchronous effect body
      requestAnimationFrame(() => {
        setIntroPhase("done");
        onIntroComplete();
      });
      return;
    }

    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled) return;

      // Measure after fonts are loaded so glyph widths are accurate
      measureIntroFontSize();

      const loader = document.getElementById("initial-loader");
      if (loader) {
        loader.classList.add("loader-fade-out");
        // Wait for the CSS fade-out transition (300ms)
        setTimeout(() => {
          if (!cancelled) {
            loader.style.display = "none";
            setIntroPhase("letters");
          }
        }, 300);
      } else {
        setIntroPhase("letters");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [introPhase, wasScrolledOnLoad, measureIntroFontSize, onIntroComplete]);

  // Letter animation timing constants
  const CHAR_INITIAL_DELAY = 0.3; // seconds before first char starts
  const CHAR_STAGGER = 0.05; // seconds between each char
  const CHAR_DURATION = 0.4; // seconds for each char's animation
  // Total time until the last character finishes animating
  const lettersFullDuration =
    CHAR_INITIAL_DELAY + (nameChars.length - 1) * CHAR_STAGGER + CHAR_DURATION;
  // Pause after all letters are visible before starting fall
  const POST_LETTERS_PAUSE = 0.3; // seconds

  const handleFallComplete = useCallback(() => {
    setIntroPhase("reveal");
  }, []);

  const handleRevealComplete = useCallback(() => {
    setIntroPhase("done");
    onIntroComplete();
  }, [onIntroComplete]);

  // letters → fall: wait for all chars to finish, then pause, then measure + fall
  useEffect(() => {
    if (introPhase !== "letters") return;

    const totalWait = (lettersFullDuration + POST_LETTERS_PAUSE) * 1000;
    const timer = setTimeout(() => {
      // Measure the large size before swapping to normal
      if (h1Ref.current) {
        const largeHeight = h1Ref.current.getBoundingClientRect().height;
        const prevFontSize = h1Ref.current.style.fontSize;
        h1Ref.current.style.fontSize = "";
        const normalHeight = h1Ref.current.getBoundingClientRect().height;
        h1Ref.current.style.fontSize = prevFontSize;

        if (normalHeight > 0) {
          setFallStartScale(largeHeight / normalHeight);
        }
      }
      setIntroPhase("fall");
    }, totalWait);

    return () => clearTimeout(timer);
  }, [introPhase, lettersFullDuration]);

  // Trigger reveal-complete after last element animates
  useEffect(() => {
    if (introPhase !== "reveal") return;
    const timer = setTimeout(handleRevealComplete, 1300);
    return () => clearTimeout(timer);
  }, [introPhase, handleRevealComplete]);

  const introDone = introPhase === "done";

  // During "loading" and "letters" phases: use large font-size for crisp rendering.
  // During "fall" and after: use normal font-size (Tailwind classes handle it).
  const useIntroFontSize = introPhase === "loading" || introPhase === "letters";
  const isPreLetters = introPhase === "loading";

  // Slide-up reveal helper
  const revealVariant = (delayAfterLand: number) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
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
            className={`text-5xl sm:text-6xl md:text-7xl font-heading font-extrabold tracking-tighter mb-3 inline-flex justify-center ${useIntroFontSize ? "flex-nowrap" : "flex-wrap"}`}
            style={{
              transformOrigin: "center center",
              // Large font-size during "letters" for crisp text, removed after
              ...(useIntroFontSize && introFontSize
                ? { fontSize: introFontSize }
                : {}),
            }}
            initial={
              prefersReducedMotion
                ? { scale: 1, rotateX: 0 }
                : { scale: 1, rotateX: 0 }
            }
            animate={
              prefersReducedMotion
                ? { scale: 1, rotateX: 0, y: 0 }
                : introPhase === "loading" || introPhase === "letters"
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
                animate={
                  isPreLetters ? { opacity: 0, y: 40 } : { opacity: 1, y: 0 }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : isPreLetters
                      ? { duration: 0 }
                      : {
                          duration: CHAR_DURATION,
                          ease: "easeOut",
                          delay: CHAR_INITIAL_DELAY + i * CHAR_STAGGER,
                        }
                }
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
            brandColor="#24292e"
          />
          <SocialIcon
            size="sm"
            label="LinkedIn Profile"
            href={content.personal.social.linkedin}
            icon={<Linkedin className="w-4 h-4" aria-hidden="true" />}
            brandColor="#0077b5"
          />
          <SocialIcon
            size="sm"
            label="Instagram Profile"
            href={content.personal.social.instagram}
            icon={<Instagram className="w-4 h-4" aria-hidden="true" />}
            brandColor="#e4405f"
          />
          <SocialIcon
            size="sm"
            label="Email Contact"
            href={`mailto:${content.personal.social.email}`}
            icon={<Mail className="w-4 h-4" aria-hidden="true" />}
            brandColor="#111111"
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
