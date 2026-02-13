"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

interface CertificationItemProps {
  title: string;
  issuer: string;
  date: string;
  url?: string;
}

const CertificationItem: React.FC<CertificationItemProps> = ({
  title,
  issuer,
  date,
  url,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="p-6 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
    whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}
    role="listitem"
  >
    <h3 className="text-lg font-medium mb-1">{title}</h3>
    <p className="text-neutral-500 text-sm">
      {issuer} · {date}
    </p>
    {url && (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
      >
        <Award className="w-4 h-4 mr-1" /> View Credential
      </a>
    )}
  </motion.div>
);

export default CertificationItem;
