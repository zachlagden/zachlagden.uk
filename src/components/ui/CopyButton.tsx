"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
  size?: "sm" | "md";
}

const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  className = "",
  size = "md",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <motion.button
      onClick={handleCopy}
      className={`ml-1 text-neutral-400 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0.8 }}
      animate={{
        opacity: copied ? 1 : 0.8,
        y: copied ? -2 : 0,
        transition: { duration: 0.2 },
      }}
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <Check className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      ) : (
        <Copy className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      )}
    </motion.button>
  );
};

export default CopyButton;
