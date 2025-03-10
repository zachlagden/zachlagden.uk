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

  // Show indicator only on initial page load and not on mobile
  useEffect(() => {
    if (!initialDisplayCompleted.current && !hasInteracted && !isMobile) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        initialDisplayCompleted.current = true;
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasInteracted, isMobile]);

  // Handle question mark key press
  useEffect(() => {
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

        if (isHelpVisible) {
          // Show briefly after closing help
          setIsVisible(true);
          const hideTimer = setTimeout(() => {
            setIsVisible(false);
          }, 3000);
          return () => clearTimeout(hideTimer);
        } else {
          setIsVisible(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isHelpVisible]);

  const toggleHelp = () => {
    setIsHelpVisible(!isHelpVisible);
    setHasInteracted(true);

    if (isHelpVisible) {
      // When closing help, show indicator briefly
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 3000);
    } else {
      // When opening help, hide the indicator
      setIsVisible(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && !isHelpVisible && (
          <motion.button
            onClick={toggleHelp}
            className="fixed bottom-8 right-24 z-40 flex items-center gap-2 bg-black/80 text-white px-3 py-2 rounded-full shadow-lg text-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
            aria-label="Keyboard navigation available. Click for help."
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Press ? for keyboard shortcuts</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHelpVisible && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleHelp}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Keyboard Navigation</h3>
                </div>
                <button
                  onClick={toggleHelp}
                  className="text-neutral-400 hover:text-neutral-900"
                  aria-label="Close keyboard help"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Section Navigation
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs">
                        ↑
                      </kbd>
                      <span>Previous section</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs">
                        ↓
                      </kbd>
                      <span>Next section</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs">
                        1
                      </kbd>
                      <span>About section</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs">
                        2
                      </kbd>
                      <span>Experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs">
                        3
                      </kbd>
                      <span>Education</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs">
                        4
                      </kbd>
                      <span>Skills</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs">
                        5
                      </kbd>
                      <span>Certifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs">
                        6
                      </kbd>
                      <span>Contact</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Help</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs">
                      ?
                    </kbd>
                    <span>Toggle this help dialog</span>
                  </div>
                </div>
              </div>

              <button
                onClick={toggleHelp}
                className="w-full mt-6 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
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