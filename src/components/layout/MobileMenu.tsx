"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Menu,
  Github,
  Linkedin,
  Instagram,
  Mail,
} from "lucide-react";
import SocialIcon from "../ui/SocialIcon";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeSection: string;
  scrollToSection: (id: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  setIsOpen,
  activeSection,
  scrollToSection,
}) => {
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 right-4 z-40 p-3 bg-white rounded-full shadow-md lg:hidden focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-50 lg:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30 }}
            id="mobile-menu"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <span className="text-xl font-bold">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="p-2 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-6 space-y-6">
              {[
                {
                  id: "about",
                  label: "About Me",
                  icon: <User className="w-5 h-5" />,
                },
                {
                  id: "experience",
                  label: "Experience",
                  icon: <Briefcase className="w-5 h-5" />,
                },
                {
                  id: "education",
                  label: "Education",
                  icon: <GraduationCap className="w-5 h-5" />,
                },
                {
                  id: "skills",
                  label: "Skills",
                  icon: <Code className="w-5 h-5" />,
                },
                {
                  id: "certifications",
                  label: "Certifications",
                  icon: <Award className="w-5 h-5" />,
                },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    scrollToSection(section.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full p-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded-lg ${
                    activeSection === section.id
                      ? "text-neutral-900 bg-neutral-100"
                      : "text-neutral-500"
                  }`}
                >
                  {section.icon}
                  <span className="text-lg">{section.label}</span>
                </button>
              ))}
            </nav>

            {/* Mobile social links in menu */}
            <div className="absolute bottom-6 left-0 right-0">
              <div
                className="flex justify-center gap-4 p-4"
                role="navigation"
                aria-label="Social Links"
              >
                <SocialIcon
                  label="GitHub Profile"
                  href="https://github.com/zachlagden"
                  icon={<Github className="w-5 h-5" aria-hidden="true" />}
                />
                <SocialIcon
                  label="LinkedIn Profile"
                  href="https://www.linkedin.com/in/zachlagden/"
                  icon={<Linkedin className="w-5 h-5" aria-hidden="true" />}
                />
                <SocialIcon
                  label="Instagram Profile"
                  href="https://instagram.com/z.lagden"
                  icon={<Instagram className="w-5 h-5" aria-hidden="true" />}
                />
                <SocialIcon
                  label="Email Contact"
                  href="mailto:zachlagden@lagden.dev"
                  icon={<Mail className="w-5 h-5" aria-hidden="true" />}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileMenu;
