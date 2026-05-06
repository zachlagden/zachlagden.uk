"use client";

import { useEffect } from "react";

export default function ClearIntro() {
  useEffect(() => {
    document.body.classList.remove("intro-locked");
    const loader = document.getElementById("initial-loader");
    if (loader) loader.style.display = "none";
  }, []);

  return null;
}
