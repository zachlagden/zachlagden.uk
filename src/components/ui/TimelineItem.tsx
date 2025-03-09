"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "lucide-react";

interface TimelineItemProps {
  id?: string; // Optional since it's not used in the component logic
  title: string;
  company: string;
  companyLink?: string; // Optional link to company website
  date: string;
  location?: string; // Optional location
  children: React.ReactNode;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  company,
  companyLink,
  date,
  location,
  children,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="relative"
    role="listitem"
  >
    <div className="flex flex-col lg:flex-row lg:items-start gap-4 mb-4">
      <div className="lg:w-1/3 sm:w-full">
        <h3 className="text-lg font-medium">{title}</h3>
        {companyLink ? (
          <a
            href={companyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm hover:text-blue-800 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            {company}
            <Link className="w-3 h-3" aria-hidden="true" />
          </a>
        ) : (
          <p className="text-blue-600 text-sm">{company}</p>
        )}
        <div className="mt-1 space-y-1">
          <p className="text-neutral-500 text-sm">
            <time dateTime={date.split(" - ")[0]}>{date}</time>
          </p>
          {location && <p className="text-neutral-400 text-xs block">{location}</p>}
        </div>
      </div>

      <div className="lg:w-2/3 sm:w-full">
        <div className="prose prose-sm max-w-none text-neutral-600">
          {children}
        </div>
      </div>
    </div>
  </motion.div>
);

export default TimelineItem;