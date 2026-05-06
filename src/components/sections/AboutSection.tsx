"use client";

import React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import Section from "../ui/Section";
import AboutCard from "../ui/AboutCard";
import { About } from "@/types/content";

interface AboutSectionProps {
  prefersReducedMotion: boolean;
  content: About;
  sectionIndex?: number;
}

const AboutSection = React.forwardRef<HTMLElement, AboutSectionProps>(
  ({ prefersReducedMotion, content, sectionIndex }, ref) => {
    return (
      <Section
        id="about"
        title="About Me"
        icon={<User className="w-6 h-6" aria-hidden="true" />}
        ref={ref}
        sectionIndex={sectionIndex}
      >
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-8">
            <motion.div
              className="text-neutral-800 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0.1 : 0.8 }}
            >
              <p className="text-lg font-light mb-6 leading-relaxed">
                {content.mainDescription}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="md:col-span-2">
                  <AboutCard
                    title={content.professionalValues.title}
                    content={content.professionalValues.content}
                    index={0}
                  />
                </div>
                <div className="md:col-span-1">
                  <AboutCard
                    title={content.currentFocus.title}
                    content={content.currentFocus.content}
                    index={1}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>
    );
  },
);

AboutSection.displayName = "AboutSection";

export default AboutSection;
