"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, Briefcase, GraduationCap, Code, Award } from "lucide-react";
import NavItem from "../ui/NavItem";

interface NavigationProps {
  activeSection: string;
  scrollToSection: (id: string) => void;
  prefersReducedMotion: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  scrollToSection,
  prefersReducedMotion,
}) => {
  return (
    <nav
      aria-label="Main Navigation"
      className="fixed top-8 left-8 z-40 hidden lg:block"
    >
      <motion.div
        className="flex flex-col space-y-6 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 0.8,
          duration: prefersReducedMotion ? 0.1 : 0.5,
        }}
      >
        <NavItem
          label="About Me"
          icon={<User className="w-5 h-5" aria-hidden="true" />}
          isActive={activeSection === "about"}
          onClick={() => scrollToSection("about")}
        />
        <NavItem
          label="Experience"
          icon={<Briefcase className="w-5 h-5" aria-hidden="true" />}
          isActive={activeSection === "experience"}
          onClick={() => scrollToSection("experience")}
        />
        <NavItem
          label="Education"
          icon={<GraduationCap className="w-5 h-5" aria-hidden="true" />}
          isActive={activeSection === "education"}
          onClick={() => scrollToSection("education")}
        />
        <NavItem
          label="Skills"
          icon={<Code className="w-5 h-5" aria-hidden="true" />}
          isActive={activeSection === "skills"}
          onClick={() => scrollToSection("skills")}
        />
        <NavItem
          label="Certifications"
          icon={<Award className="w-5 h-5" aria-hidden="true" />}
          isActive={activeSection === "certifications"}
          onClick={() => scrollToSection("certifications")}
        />
      </motion.div>
    </nav>
  );
};

export default Navigation;
