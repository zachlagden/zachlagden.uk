"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Mail,
} from "lucide-react";
import NavItem from "../ui/NavItem";
import { NavigationItem } from "@/types/content";

interface NavigationProps {
  activeSection: string;
  scrollToSection: (id: string) => void;
  prefersReducedMotion: boolean;
  navigation: NavigationItem[];
}

const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  scrollToSection,
  prefersReducedMotion,
  navigation,
}) => {
  // Map navigation IDs to icons
  const iconMap: { [key: string]: React.ReactNode } = {
    about: <User className="w-5 h-5" aria-hidden="true" />,
    experience: <Briefcase className="w-5 h-5" aria-hidden="true" />,
    education: <GraduationCap className="w-5 h-5" aria-hidden="true" />,
    skills: <Code className="w-5 h-5" aria-hidden="true" />,
    certifications: <Award className="w-5 h-5" aria-hidden="true" />,
    contact: <Mail className="w-5 h-5" aria-hidden="true" />,
  };
  return (
    <nav
      aria-label="Main Navigation"
      className="fixed top-1/2 -translate-y-1/2 left-8 z-40 hidden lg:block"
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
        {navigation.map((item) => (
          <NavItem
            key={item.id}
            label={item.label}
            icon={iconMap[item.id]}
            isActive={activeSection === item.id}
            onClick={() => scrollToSection(item.id)}
          />
        ))}
      </motion.div>
    </nav>
  );
};

export default Navigation;
