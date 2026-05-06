"use client";

import { useLayoutEffect } from "react";

/**
 * Locks the body with `intro-locked` synchronously before paint on mount,
 * and removes the class on unmount (e.g. client-side nav away from home).
 *
 * The home route is the ONLY consumer of this component. Header.tsx's intro
 * state machine remains the canonical remover when the intro finishes; this
 * component handles the "applied before first paint" and "cleaned up on
 * route change" edges.
 */
export default function HomeIntroBootstrap(): null {
  useLayoutEffect(() => {
    document.body.classList.add("intro-locked");
    return () => {
      document.body.classList.remove("intro-locked");
    };
  }, []);

  return null;
}
