"use client";

import React, { useEffect, useRef, ElementType, JSX } from "react";
import { useInView } from "framer-motion";
import Script from "next/script";

// Define proper SplitType types
interface SplitTypeChar extends HTMLSpanElement {
  style: CSSStyleDeclaration;
}

interface SplitTypeInstance {
  chars: SplitTypeChar[] | null;
  words: HTMLElement[] | null;
  lines: HTMLElement[] | null;
  revert: () => void;
}

// Create a type for the SplitType constructor
interface SplitTypeConstructor {
  new (
    target: HTMLElement,
    options?: {
      types?: string;
      tagName?: string;
      [key: string]: unknown;
    },
  ): SplitTypeInstance;
}

// Generic props type that extends the HTML element props
type AnimatedTextProps<E extends ElementType = "div"> = {
  text: string;
  el?: E;
  className?: string;
  once?: boolean;
  sequential?: boolean;
  duration?: number;
  delay?: number;
} & Omit<React.ComponentPropsWithoutRef<E>, "ref">;

function AnimatedText<E extends ElementType = "div">({
  text,
  el,
  className = "",
  once = true,
  sequential = true,
  duration = 0.5,
  delay = 0,
  ...props
}: AnimatedTextProps<E>): JSX.Element {
  // Use HTMLElement as the base type for our ref since all HTML elements inherit from it
  const textRef = useRef<HTMLElement>(null);
  const isInView = useInView(textRef, { once });
  const [isClientSide, setIsClientSide] = React.useState(false);
  const [isSplitTypeLoaded, setIsSplitTypeLoaded] = React.useState(false);

  // Determine the wrapper component (default to div)
  const Wrapper = el || "div";
  
  // Check if we're on the client side
  useEffect(() => {
    setIsClientSide(true);
  }, []);

  // Handle SplitType loading
  useEffect(() => {
    if (isClientSide && typeof window !== 'undefined') {
      if (window.SplitType) {
        setIsSplitTypeLoaded(true);
      } else {
        // Listen for SplitType to load from script
        const handleSplitTypeLoad = () => setIsSplitTypeLoaded(true);
        window.addEventListener('splittype-loaded', handleSplitTypeLoad);
        return () => window.removeEventListener('splittype-loaded', handleSplitTypeLoad);
      }
    }
  }, [isClientSide]);

  useEffect(() => {
    if (!isClientSide || !isSplitTypeLoaded || !textRef.current) return;
    
    let splitText: SplitTypeInstance | null = null;

    try {
      // Split the text into characters
      // @ts-expect-error - SplitType is loaded via script but TypeScript can't verify it
      splitText = new window.SplitType(textRef.current, {
        types: "words,chars",
        tagName: "span",
      });

      // Hide all characters initially
      if (splitText?.chars) {
        splitText.chars.forEach((char) => {
          char.style.opacity = "0";
          char.style.display = "inline-block";
          char.style.transform = "translateY(1.5em)";
          char.style.transition = `opacity ${duration}s ease, transform ${duration}s ease`;
        });
      }
    } catch (error) {
      console.error("Error initializing SplitType:", error);
    }

    if (isInView && splitText?.chars) {
      try {
        // Animate characters when in view
        splitText.chars.forEach((char, i) => {
          const additionalDelay = sequential ? i * 0.03 : 0;
          setTimeout(
            () => {
              char.style.opacity = "1";
              char.style.transform = "translateY(0)";
            },
            (delay + additionalDelay) * 1000,
          );
        });
      } catch (error) {
        console.error("Error animating characters:", error);
      }
    }

    return () => {
      // When component unmounts, we should revert the text
      if (splitText) {
        try {
          splitText.revert();
        } catch (error) {
          console.error("Error reverting SplitType:", error);
        }
      }
    };
  }, [isInView, text, once, sequential, duration, delay, isClientSide, isSplitTypeLoaded]);

  // Use type assertion to make TypeScript understand our intention
  return (
    <>
      {isClientSide && !window.SplitType && (
        <Script
          id="splittype-script"
          src="https://unpkg.com/split-type@0.3.3/umd/index.min.js"
          onLoad={() => {
            window.dispatchEvent(new Event('splittype-loaded'));
          }}
          strategy="lazyOnload"
        />
      )}
      {React.createElement(
        Wrapper,
        {
          ...props,
          ref: textRef,
          className,
        },
        text,
      )}
    </>
  );
}

// Add to Window interface
declare global {
  interface Window {
    SplitType?: SplitTypeConstructor;
  }
}

export default AnimatedText;