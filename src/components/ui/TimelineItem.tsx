"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "lucide-react";
import { slideUpAnimation, hoverAnimation } from "@/utils/animationUtils";

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
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={slideUpAnimation}
      className="relative"
      role="listitem"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="flex flex-col lg:flex-row lg:items-start gap-4 mb-4 p-4 rounded-lg transition-colors"
        animate={{
          backgroundColor: isHovered
            ? "rgba(0, 0, 0, 0.02)"
            : "rgba(0, 0, 0, 0)",
          transition: { duration: 0.2 },
        }}
      >
        <div className="lg:w-1/3 sm:w-full">
          <motion.h3
            className="text-lg font-medium"
            animate={{
              x: isHovered ? 3 : 0,
              transition: { duration: 0.2 },
            }}
          >
            {title}
          </motion.h3>
          {companyLink ? (
            <motion.a
              href={companyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:text-blue-800 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              whileHover="hover"
              variants={hoverAnimation}
            >
              {company}
              <Link className="w-3 h-3" aria-hidden="true" />
            </motion.a>
          ) : (
            <p className="text-blue-600 text-sm">{company}</p>
          )}
          <div className="mt-1 space-y-1">
            <p className="text-neutral-500 text-sm">
              <time dateTime={date.split(" - ")[0]}>{date}</time>
            </p>
            {location && (
              <p className="text-neutral-400 text-xs block">{location}</p>
            )}
          </div>
        </div>

        <motion.div
          className="lg:w-2/3 sm:w-full"
          animate={{
            opacity: isHovered ? 1 : 0.95,
            transition: { duration: 0.3 },
          }}
        >
          <div className="prose prose-sm max-w-none text-neutral-600">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default TimelineItem;
