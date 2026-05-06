"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "lucide-react";
import { hoverAnimation } from "@/utils/animationUtils";

interface TimelineItemProps {
  id?: string;
  title: string;
  company: string;
  companyLink?: string;
  date: string;
  location?: string;
  children: React.ReactNode;
  index?: number;
  alignment?: "left" | "right";
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  company,
  companyLink,
  date,
  location,
  children,
  index = 0,
  alignment,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const side = alignment || (index % 2 === 0 ? "left" : "right");
  const slideFrom = side === "left" ? -30 : 30;

  return (
    <motion.div
      initial={{ opacity: 0, x: slideFrom }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
      role="listitem"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Desktop alternating layout */}
      <div
        className={`hidden lg:flex items-start gap-8 ${side === "right" ? "flex-row-reverse text-right" : ""}`}
      >
        {/* Content side */}
        <motion.div
          className="w-[calc(50%-1.5rem)] relative"
          animate={{
            backgroundColor: isHovered
              ? "rgba(0, 0, 0, 0.02)"
              : "rgba(0, 0, 0, 0)",
            transition: { duration: 0.2 },
          }}
          style={{ borderRadius: "0.5rem", padding: "1.5rem" }}
        >
          {/* Accent bar on hover */}
          <motion.div
            className={`absolute top-0 ${side === "left" ? "left-0" : "right-0"} w-1 h-full rounded-full`}
            animate={{
              scaleY: isHovered ? 1 : 0,
              backgroundColor: isHovered
                ? "rgb(59, 130, 246)"
                : "rgb(212, 212, 212)",
            }}
            style={{ originY: 0 }}
            transition={{ duration: 0.3 }}
          />

          <motion.h3
            className="text-lg font-medium"
            animate={{
              x: isHovered ? (side === "left" ? 3 : -3) : 0,
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
              className={`text-blue-600 text-sm hover:text-blue-800 transition-colors inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded ${side === "right" ? "flex-row-reverse" : ""}`}
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
            {location && <p className="text-neutral-400 text-xs">{location}</p>}
          </div>

          <motion.div
            className={`mt-4 ${side === "right" ? "text-right" : "text-left"}`}
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

        {/* Center dot (the line is in the parent) */}
        <div className="relative flex-shrink-0 w-3 flex items-start justify-center pt-7">
          <div className="w-3 h-3 rounded-full bg-neutral-300 border-2 border-neutral-50 z-10" />
        </div>

        {/* Empty side */}
        <div className="w-[calc(50%-1.5rem)]" />
      </div>

      {/* Mobile layout — standard stacked */}
      <motion.div
        className="lg:hidden flex flex-col gap-4 p-4 rounded-lg transition-colors"
        animate={{
          backgroundColor: isHovered
            ? "rgba(0, 0, 0, 0.02)"
            : "rgba(0, 0, 0, 0)",
          transition: { duration: 0.2 },
        }}
      >
        <div>
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
            {location && <p className="text-neutral-400 text-xs">{location}</p>}
          </div>
        </div>
        <motion.div
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
