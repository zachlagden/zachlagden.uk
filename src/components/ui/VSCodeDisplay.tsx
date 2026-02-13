"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ParsedActivityData } from "@/types/presence";

interface VSCodeDisplayProps {
  data: ParsedActivityData;
  prefersReducedMotion?: boolean;
}

const VSCodeDisplay: React.FC<VSCodeDisplayProps> = ({
  data,
  prefersReducedMotion = false,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!data.startTime) return;

    // Calculate initial elapsed time
    const now = new Date().getTime();
    const start = data.startTime.getTime();
    setElapsedTime(Math.floor((now - start) / 1000));

    // Update elapsed time every second
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const elapsed = Math.floor((currentTime - start) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [data.startTime]);

  // Update elapsed time when data changes
  useEffect(() => {
    if (data.startTime) {
      const now = new Date().getTime();
      const start = data.startTime.getTime();
      setElapsedTime(Math.floor((now - start) / 1000));
    }
  }, [data.startTime]);

  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Extract programming language from large_image URL
  const getLanguage = (): string | null => {
    if (!data.largeImage) return null;

    // Extract language from URL like: .../icons/ts.png -> "TypeScript"
    const match = data.largeImage.match(/\/icons\/([^.]+)\.png/);
    if (!match) return null;

    const langCode = match[1];
    const languageMap: { [key: string]: string } = {
      ts: "TypeScript",
      js: "JavaScript",
      py: "Python",
      java: "Java",
      cpp: "C++",
      c: "C",
      cs: "C#",
      php: "PHP",
      rb: "Ruby",
      go: "Go",
      rs: "Rust",
      kt: "Kotlin",
      swift: "Swift",
      dart: "Dart",
      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      json: "JSON",
      md: "Markdown",
      yml: "YAML",
      yaml: "YAML",
      xml: "XML",
      sql: "SQL",
      sh: "Shell",
      bash: "Bash",
      dockerfile: "Docker",
      vscode: "VS Code", // fallback icon
    };

    return languageMap[langCode] || langCode.toUpperCase();
  };

  // Extract activity info from state and details
  const getActivityInfo = (): {
    action: string;
    target: string;
    language?: string;
  } | null => {
    const language = getLanguage() || undefined;

    // Handle "Working on filename:line:col" case
    if (data.state && data.state.includes("Working on ")) {
      const match = data.state.match(/Working on (.+?):/);
      if (match) {
        return { action: "Coding", target: match[1], language };
      }
    }

    // Handle "Viewing filename" case
    if (data.state && data.state.includes("Viewing ")) {
      const filename = data.state.replace("Viewing ", "");
      return { action: "Viewing", target: filename, language };
    }

    // Handle "Not in a file!" case - don't show VS Code activity
    if (data.details === "Not in a file!" || !data.state) {
      return null;
    }

    // Fallback
    return { action: "Using", target: "VS Code", language };
  };

  const activityInfo = getActivityInfo();

  // Don't render if no meaningful activity (e.g., "Not in a file!")
  if (!activityInfo) {
    return null;
  }

  return (
    <motion.div
      className="text-sm text-neutral-500 font-light"
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -5 }}
      transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-blue-600">⌨</span>
        <span>
          {activityInfo.action} {activityInfo.target}
          <span className="text-neutral-400"> in </span>
          <a
            href="https://vscode.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="Open VS Code for the Web"
          >
            VS Code
          </a>
        </span>
        {data.startTime && (
          <span className="text-neutral-400 tabular-nums text-xs">
            {formatElapsedTime(elapsedTime)}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default VSCodeDisplay;
