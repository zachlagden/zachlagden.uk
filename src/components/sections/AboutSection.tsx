"use client";

import React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import Section from "../ui/Section";
import AboutCard from "../ui/AboutCard";

interface AboutSectionProps {
  prefersReducedMotion: boolean;
}

const AboutSection = React.forwardRef<HTMLElement, AboutSectionProps>(
  ({ prefersReducedMotion }, ref) => {
    return (
      <Section
        id="about"
        title="About Me"
        icon={<User className="w-6 h-6" aria-hidden="true" />}
        ref={ref}
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
                I&apos;m a young entrepreneur, technical architect, and
                full-stack developer based in Ascot, UK. With a passion for
                building elegant technical solutions, I value respect, speed,
                simplicity, and quality. As the Co-Founder & CTO of DigiGrow LTD
                and creator of Lagden Development, I combine technical expertise
                with business acumen to deliver exceptional results for clients.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <AboutCard
                  title="Professional Values"
                  content="I believe in personal ownership rather than just working for others. My approach emphasizes getting things done with respect, speed, simplicity, and quality while maintaining high standards."
                />
                <AboutCard
                  title="Current Focus"
                  content="Mastering Next.js, improving my Python, JavaScript and TypeScript skills, while taking a research-heavy approach to technical architecture and running my businesses."
                />
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
