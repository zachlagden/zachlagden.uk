"use client";

import React from "react";
import { motion } from "framer-motion";

interface AboutCardProps {
  title: string;
  content: string;
}

const AboutCard: React.FC<AboutCardProps> = ({ title, content }) => (
  <motion.div
    className="p-6 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
    whileHover={{ y: -2 }}
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-medium mb-3">{title}</h3>
    <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">{content}</p>
  </motion.div>
);

export default AboutCard;
