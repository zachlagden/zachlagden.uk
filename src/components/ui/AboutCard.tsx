"use client";

import React from "react";
import { motion } from "framer-motion";

interface AboutCardProps {
  title: string;
  content: string;
  index?: number;
}

const AboutCard: React.FC<AboutCardProps> = ({ title, content, index = 0 }) => {
  const rotation = index % 2 === 0 ? -1 : 1;

  return (
    <motion.div
      className="p-6 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors relative overflow-hidden group"
      whileHover={{
        y: -2,
        background:
          "linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(147, 51, 234, 0.03) 100%)",
      }}
      initial={{ opacity: 0, scale: 0.95, rotate: rotation }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-heading font-medium mb-3">{title}</h3>
      <p className="text-neutral-600 text-sm leading-relaxed">{content}</p>
    </motion.div>
  );
};

export default AboutCard;
