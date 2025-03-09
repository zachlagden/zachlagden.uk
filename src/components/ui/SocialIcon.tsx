"use client";

import React from "react";
import { motion } from "framer-motion";

interface SocialIconProps {
  href: string;
  icon: React.ReactNode;
  size?: "sm" | "md";
  label: string; // For accessibility
}

const SocialIcon: React.FC<SocialIconProps> = ({
  href,
  icon,
  size = "md",
  label,
}) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`${size === "sm" ? "p-3" : "p-3"} rounded-full bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2`}
    whileHover={{ scale: 1.1, backgroundColor: "#f5f5f5" }}
    whileTap={{ scale: 0.9 }}
    aria-label={label}
  >
    {icon}
  </motion.a>
);

export default SocialIcon;
