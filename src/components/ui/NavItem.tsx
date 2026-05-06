"use client";

import React from "react";
import { motion } from "framer-motion";

interface NavItemProps {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  label: string; // For accessibility
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  isActive,
  onClick,
  label,
}) => (
  <motion.button
    onClick={onClick}
    className={`p-3 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
      isActive ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-700"
    }`}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    aria-label={label}
    aria-current={isActive ? "page" : undefined}
  >
    {isActive && (
      <motion.div
        layoutId="activeSection"
        className="absolute inset-0 bg-neutral-200 rounded-full"
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        aria-hidden="true"
      />
    )}
    <span className="relative">{icon}</span>
  </motion.button>
);

export default NavItem;
