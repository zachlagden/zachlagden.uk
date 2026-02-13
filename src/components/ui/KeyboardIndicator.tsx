"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard } from "lucide-react";

interface KeyboardIndicatorProps {
  prefersReducedMotion: boolean;
  isMobile?: boolean;
}

const KeyboardIndicator: React.FC<KeyboardIndicatorProps> = ({
  prefersReducedMotion,
  isMobile = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const initialDisplayCompleted = useRef(false);
  const [isClient, setIsClient] = useState(false);

  // Check for client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show indicator only on initial page load and not on mobile
  useEffect(() => {
    if (!isClient || prefersReducedMotion) return;

    if (!initialDisplayCompleted.current && !hasInteracted && !isMobile) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        initialDisplayCompleted.current = true;
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasInteracted, isMobile, prefersReducedMotion, isClient]);

  // Handle question mark key press
  useEffect(() => {
    if (!isClient) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.key === "?" &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey &&
        !(document.activeElement instanceof HTMLInputElement) &&
        !(document.activeElement instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setIsHelpVisible(!isHelpVisible);
        setHasInteracted(true);

        setIsVisible(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isHelpVisible, isClient]);

  const toggleHelp = () => {
    setIsHelpVisible(!isHelpVisible);
    setHasInteracted(true);

    // Hide the indicator when opening or closing help
    setIsVisible(false);
  };

  // Don't render during SSR
  if (!isClient) return null;

  // Don't render if user prefers reduced motion or on mobile
  if (prefersReducedMotion || isMobile) return null;

  return (
    <>
      <AnimatePresence>
        {isVisible && !isHelpVisible && (
          <motion.button
            onClick={toggleHelp}
            className="fixed bottom-8 left-1/2 z-40 flex -translate-x-1/2 transform items-center gap-2 rounded-full bg-zinc-800/90 px-3 py-2 text-xs text-zinc-300 shadow-lg backdrop-blur-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
            aria-label="Keyboard navigation available. Click for help."
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>Press ? for keyboard shortcuts</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHelpVisible && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleHelp}
          >
            <motion.div
              className="mx-4 max-w-md rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2 text-zinc-100">
                  <Keyboard className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Keyboard Navigation</h3>
                </div>
                <button
                  onClick={toggleHelp}
                  className="text-zinc-500 hover:text-zinc-200"
                  aria-label="Close keyboard help"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-zinc-300">
                    Section Navigation
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                      <kbd className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                        &uarr;
                      </kbd>
                      <span>Previous section</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                        &darr;
                      </kbd>
                      <span>Next section</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                        1
                      </kbd>
                      <span>About section</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                        2
                      </kbd>
                      <span>Experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                        3
                      </kbd>
                      <span>Education</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                        4
                      </kbd>
                      <span>Skills</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                        5
                      </kbd>
                      <span>Certifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                        6
                      </kbd>
                      <span>Contact</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium text-zinc-300">
                    Help
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <kbd className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                      ?
                    </kbd>
                    <span>Toggle this help dialog</span>
                  </div>
                </div>
              </div>

              <button
                onClick={toggleHelp}
                className="mt-6 w-full rounded-lg bg-zinc-100 py-2 text-zinc-900 transition-colors hover:bg-zinc-200"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KeyboardIndicator;
