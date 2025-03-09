// src/app/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  Mail,
  Github,
  Linkedin,
  Instagram,
  Link,
  MapPin,
  ArrowUp,
  Award,
  Menu,
  X,
} from "lucide-react";
import Script from "next/script";

// Define interfaces for component props
interface SectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

interface NavItemProps {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  label: string; // Added for accessibility
}

interface SocialIconProps {
  href: string;
  icon: React.ReactNode;
  size?: "sm" | "md";
  label: string; // Added for accessibility
}

interface TimelineItemProps {
  id?: string; // Optional since it's not used in the component logic
  title: string;
  company: string;
  companyLink?: string; // Optional link to company website
  date: string;
  location?: string; // Make optional to fix the errors
  children: React.ReactNode;
}

interface AboutCardProps {
  title: string;
  content: string;
}

interface SkillCategoryProps {
  title: string;
  skills: string[];
  colorClass: string;
}

interface CertificationItemProps {
  title: string;
  issuer: string;
  date: string;
  url: string;
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("about");
  const { scrollY } = useScroll();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Device and preference detection
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 768 : false;
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // References to sections for intersection observer
  const aboutRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);
  const educationRef = useRef<HTMLElement>(null);
  const skillsRef = useRef<HTMLElement>(null);
  const certificationsRef = useRef<HTMLElement>(null);

  // Skip link ref
  const mainContentRef = useRef<HTMLElement>(null);

  // Parallax effects
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  const headerScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const headerTranslateY = useTransform(scrollY, [0, 300], [0, -20]);

  // Handle scroll and intersection observation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 },
    );

    if (aboutRef.current) observer.observe(aboutRef.current);
    if (experienceRef.current) observer.observe(experienceRef.current);
    if (educationRef.current) observer.observe(educationRef.current);
    if (skillsRef.current) observer.observe(skillsRef.current);
    if (certificationsRef.current) observer.observe(certificationsRef.current);

    window.addEventListener("scroll", handleScroll);

    // Handle resize for device detection updates
    const handleResize = () => {
      // Update isMobile if needed in real-time
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Interface for section ID
  interface SectionId {
    id: "about" | "experience" | "education" | "skills" | "certifications";
  }

  const scrollToSection = (id: SectionId["id"]): void => {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = 100;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  // Schema.org structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Zach Lagden",
    url: "https://cv.zachlagden.uk",
    jobTitle: "Full Stack Developer & Entrepreneur",
    sameAs: [
      "https://github.com/zachlagden",
      "https://www.linkedin.com/in/zachlagden/",
      "https://instagram.com/z.lagden",
      "https://digigrow.uk",
      "https://lagden.dev",
    ],
    email: "zachlagden@lagden.dev",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ascot",
      addressCountry: "UK",
    },
    worksFor: {
      "@type": "Organization",
      name: "DigiGrow LTD",
    },
    alumniOf: [
      {
        "@type": "EducationalOrganization",
        name: "Farnborough College of Technology",
      },
      {
        "@type": "EducationalOrganization",
        name: "Charters School",
      },
    ],
    knowsAbout: [
      "Python",
      "JavaScript",
      "React.js",
      "Next.js",
      "TypeScript",
      "C#",
      "HTML5/CSS3",
      "MongoDB",
      "SQL",
      "Business Strategy",
      "Start-up Leadership",
    ],
  };

  return (
    <>
      {/* Structured data for SEO */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Skip to content link for accessibility */}
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black"
        onClick={(e) => {
          e.preventDefault();
          mainContentRef.current?.focus();
          scrollToSection("about");
        }}
      >
        Skip to main content
      </a>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-50 lg:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30 }}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <span className="text-xl font-bold">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
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
                    scrollToSection(section.id as SectionId["id"]);
                    setMobileMenuOpen(false);
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

      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 right-4 z-40 p-3 bg-white rounded-full shadow-md lg:hidden focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open menu"
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="min-h-screen bg-neutral-50 font-[system-ui] text-neutral-900">
        {/* Fixed navigation - Updated with background and shadow */}
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

        {/* Fixed social links - Updated with background and shadow */}
        <div
          className="fixed bottom-8 left-8 z-50 hidden lg:block"
          role="navigation"
          aria-label="Social Links"
        >
          <motion.div
            className="flex flex-col space-y-6 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.9,
              duration: prefersReducedMotion ? 0.1 : 0.5,
            }}
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
          </motion.div>
        </div>

        {/* Header */}
        <motion.header
          className="h-screen flex flex-col justify-center items-center relative"
          style={{
            opacity: headerOpacity,
            scale: headerScale,
            y: headerTranslateY,
          }}
          transition={{}}
          initial={{ opacity: 1, scale: 1, y: 0 }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-neutral-900/5 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: prefersReducedMotion ? 0.1 : 1 }}
              aria-hidden="true"
            />
          </div>

          <motion.div
            className="relative z-20 text-center px-4"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: prefersReducedMotion ? 0.1 : 0.8,
            }}
          >
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter mb-3"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.4,
                duration: prefersReducedMotion ? 0.1 : 0.8,
              }}
            >
              Zach Lagden
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl text-neutral-600 mb-8 font-light tracking-wide"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.6,
                duration: prefersReducedMotion ? 0.1 : 0.8,
              }}
            >
              Technical Architect & Entrepreneur
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.8,
                duration: prefersReducedMotion ? 0.1 : 0.8,
              }}
            >
              <a
                href="mailto:zachlagden@lagden.dev"
                className="flex items-center gap-2 hover:text-neutral-800 text-neutral-500 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded-lg px-2 py-1"
                aria-label="Email Zach at zachlagden@lagden.dev"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm tracking-wide">
                  zachlagden@lagden.dev
                </span>
              </a>
              <span
                className="hidden sm:block text-neutral-300"
                aria-hidden="true"
              >
                •
              </span>
              <a
                href="https://maps.app.goo.gl/4t9WquercPnWs2uM9"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-neutral-800 text-neutral-500 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded-lg px-2 py-1"
                aria-label="Location: Ascot, UK (opens Google Maps)"
              >
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm tracking-wide">Ascot, UK</span>
              </a>
            </motion.div>

            <motion.div
              className="lg:hidden flex justify-center gap-6 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 1,
                duration: prefersReducedMotion ? 0.1 : 0.8,
              }}
              role="navigation"
              aria-label="Social Links"
            >
              <SocialIcon
                size="sm"
                label="GitHub Profile"
                href="https://github.com/zachlagden"
                icon={<Github className="w-4 h-4" aria-hidden="true" />}
              />
              <SocialIcon
                size="sm"
                label="LinkedIn Profile"
                href="https://www.linkedin.com/in/zachlagden/"
                icon={<Linkedin className="w-4 h-4" aria-hidden="true" />}
              />
              <SocialIcon
                size="sm"
                label="Instagram Profile"
                href="https://instagram.com/z.lagden"
                icon={<Instagram className="w-4 h-4" aria-hidden="true" />}
              />
              <SocialIcon
                size="sm"
                label="Email Contact"
                href="mailto:zachlagden@lagden.dev"
                icon={<Mail className="w-4 h-4" aria-hidden="true" />}
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute bottom-12 left-0 right-0 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 1.2,
              duration: prefersReducedMotion ? 0.1 : 0.8,
            }}
            aria-hidden="true"
          >
            <motion.div
              className="w-1 h-16 relative"
              animate={{
                scaleY: isMobile ? [0.5, 1, 0.5] : [0.3, 1, 0.3],
                opacity: isMobile ? [0.3, 0.7, 0.3] : [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: isMobile ? 1.5 : 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-neutral-300 to-transparent" />
            </motion.div>
          </motion.div>
        </motion.header>

        {/* Main Content - Updated with proper padding */}
        <main
          className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-20 relative pb-32"
          ref={mainContentRef}
          tabIndex={-1}
          id="main-content"
        >
          {/* About */}
          <Section
            id="about"
            title="About Me"
            icon={<User className="w-6 h-6" aria-hidden="true" />}
            ref={aboutRef}
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
                    building elegant technical solutions, I value respect,
                    speed, simplicity, and quality. As the Co-Founder & CTO of
                    DigiGrow LTD and creator of Lagden Development, I combine
                    technical expertise with business acumen to deliver
                    exceptional results for clients.
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

          {/* Experience */}
          <Section
            id="experience"
            title="Experience"
            icon={<Briefcase className="w-6 h-6" aria-hidden="true" />}
            ref={experienceRef}
          >
            <div
              className="space-y-16"
              role="list"
              aria-label="Work experience history"
            >
              <TimelineItem
                id="digigrow"
                title="Co-Founder & CTO"
                company="DigiGrow LTD"
                companyLink="https://digigrow.uk/"
                date="Jun 2024 - Present"
                location="United Kingdom · Hybrid"
              >
                <p className="mb-4">
                  Leading digital transformation and web development projects.
                  Working with individuals and small businesses on their digital
                  needs. Notable clients include The Thatched Tavern, The
                  Chertsey Show, and Blueview Group.
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  aria-label="Skills and technologies"
                >
                  {[
                    "Business Strategy",
                    "Digital Transformation",
                    "Start-up Leadership",
                    "Web Development",
                  ].map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs py-1 px-3 bg-neutral-100 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </TimelineItem>

              <TimelineItem
                id="lagden-dev"
                title="Founder"
                company="Lagden Development"
                companyLink="https://lagden.dev"
                date="2023 - Present"
                location="United Kingdom · Remote"
              >
                <p className="mb-4">
                  Personal professional side project offering development
                  services. Portfolio available at lagden.dev/projects.
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  aria-label="Skills and technologies"
                >
                  {[
                    "Full-Stack Development",
                    "Project Management",
                    "Technical Architecture",
                  ].map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs py-1 px-3 bg-neutral-100 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </TimelineItem>

              <TimelineItem
                id="freelance"
                title="Freelance Full-Stack Web Developer"
                company="Self-employed"
                date="Jan 2020 - Present"
                location="United Kingdom · Remote"
              >
                <p className="mb-4">
                  Developing custom web solutions and managing client projects
                  from inception to deployment.
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  aria-label="Skills and technologies"
                >
                  {[
                    "Full-Stack Development",
                    "Client Relations",
                    "Project Management",
                  ].map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs py-1 px-3 bg-neutral-100 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </TimelineItem>

              <TimelineItem
                id="step8up"
                title="Skills Bootcamp Trainer"
                company="Step8up Academy"
                companyLink="https://academy.step8up.co.uk/"
                date="Apr 2024 - Oct 2024"
                location="United Kingdom · Hybrid"
              >
                <p className="mb-4">
                  Teaching programming and development skills with a focus on
                  being genuine and respectful with students.
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  aria-label="Skills and technologies"
                >
                  {["Teaching", "Python", "Curriculum Development"].map(
                    (tag, i) => (
                      <span
                        key={i}
                        className="text-xs py-1 px-3 bg-neutral-100 rounded-full"
                      >
                        {tag}
                      </span>
                    ),
                  )}
                </div>
              </TimelineItem>

              <TimelineItem
                id="jamcoding"
                title="Head Code Coach"
                company="Jam Coding"
                companyLink="https://jamcoding.com/"
                date="Sep 2023 - Oct 2024"
                location="United Kingdom · On site"
              >
                <p className="mb-4">
                  Leading programming education initiatives and teaching young
                  people to code.
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  aria-label="Skills and technologies"
                >
                  {["Teaching", "Leadership", "Programming Education"].map(
                    (tag, i) => (
                      <span
                        key={i}
                        className="text-xs py-1 px-3 bg-neutral-100 rounded-full"
                      >
                        {tag}
                      </span>
                    ),
                  )}
                </div>
              </TimelineItem>
            </div>
          </Section>

          {/* Education */}
          <Section
            id="education"
            title="Education"
            icon={<GraduationCap className="w-6 h-6" aria-hidden="true" />}
            ref={educationRef}
          >
            <div
              className="space-y-16"
              role="list"
              aria-label="Education history"
            >
              <TimelineItem
                id="farnborough"
                title="Level 3 T-Level in Digital Design, Production and Development"
                company="Farnborough College of Technology"
                companyLink="https://farn-ct.ac.uk/"
                date="Sep 2023 - Jul 2025"
                location=""
              >
                <p className="mb-4">
                  Specializing in software development and digital design
                  principles. Serving as a Student Leader and Course
                  Representative.
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  aria-label="Skills and technologies"
                >
                  {[
                    "Python",
                    "C#",
                    "Software Development",
                    "Digital Design",
                    "Project Management",
                  ].map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs py-1 px-3 bg-neutral-100 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </TimelineItem>

              <TimelineItem
                id="charters"
                title="Secondary Education"
                company="Charters School"
                companyLink="https://www.chartersschool.org.uk/"
                date="Jun 2018 - Apr 2023"
                location=""
              >
                <p className="mb-4">
                  Comprehensive secondary education with focus on STEM subjects
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Core Subjects</h4>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>Mathematics</li>
                      <li>English</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Technology</h4>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>Computer Science</li>
                      <li>Business</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Sciences</h4>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>Physics</li>
                      <li>Chemistry</li>
                      <li>Biology</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Additional</h4>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>Princes Trust</li>
                    </ul>
                  </div>
                </div>
              </TimelineItem>
            </div>
          </Section>

          {/* Skills */}
          <Section
            id="skills"
            title="Skills"
            icon={<Code className="w-6 h-6" aria-hidden="true" />}
            ref={skillsRef}
          >
            <div
              className="space-y-12"
              aria-label="Professional skills and competencies"
            >
              <SkillCategory
                title="Programming Languages"
                skills={["Python", "JavaScript", "TypeScript"]}
                colorClass="bg-blue-50 text-blue-900"
              />

              <SkillCategory
                title="Web Technologies"
                skills={["HTML5/CSS3", "React.js", "Next.js", "Flask"]}
                colorClass="bg-emerald-50 text-emerald-900"
              />

              <SkillCategory
                title="Databases & Infrastructure"
                skills={[
                  "MongoDB",
                  "SQL",
                  "Ubuntu",
                  "VPS",
                  "Cloudflare",
                  "NGINX",
                ]}
                colorClass="bg-amber-50 text-amber-900"
              />

              <SkillCategory
                title="Development & DevOps"
                skills={[
                  "Git",
                  "API Design",
                  "REST APIs",
                  "Linux",
                  "Server Management",
                ]}
                colorClass="bg-purple-50 text-purple-900"
              />

              <SkillCategory
                title="Business & Leadership"
                skills={[
                  "Business Strategy",
                  "Start-up Leadership",
                  "Project Management",
                  "Agile Methodologies",
                  "Client Relations",
                  "Digital Transformation",
                  "Growth Optimization",
                ]}
                colorClass="bg-neutral-100 text-neutral-900"
              />

              <SkillCategory
                title="Teaching & Leadership"
                skills={[
                  "Teaching",
                  "Curriculum Development",
                  "Mentorship",
                  "Leadership",
                ]}
                colorClass="bg-rose-50 text-rose-900"
              />
            </div>
          </Section>

          {/* Certifications */}
          <Section
            id="certifications"
            title="Certifications"
            icon={<Award className="w-6 h-6" aria-hidden="true" />}
            ref={certificationsRef}
          >
            <div className="space-y-8">
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                role="list"
                aria-label="Professional certifications"
              >
                <CertificationItem
                  title="HTML Essentials"
                  issuer="Cisco"
                  date="Mar 2025"
                  url="https://www.credly.com/badges/5d87f9d8-4c8c-4788-ad66-bfd7f8c65f44/linked_in_profile"
                />
                <CertificationItem
                  title="JavaScript Essentials 1"
                  issuer="Cisco"
                  date="Mar 2025"
                  url="https://www.credly.com/badges/19eb797a-328b-4078-8ae6-0dd434343194/linked_in_profile"
                />
                <CertificationItem
                  title="JavaScript Essentials 2"
                  issuer="Cisco"
                  date="Mar 2025"
                  url="https://www.credly.com/badges/2fc51937-bdce-4eda-ae35-a9ddd317de0d/linked_in_profile"
                />
                <CertificationItem
                  title="Python Essentials 1"
                  issuer="Cisco"
                  date="Mar 2024"
                  url="https://www.credly.com/badges/5cbb052a-46f4-425e-aea7-c07d6e8eca01/linked_in_profile"
                />
                <CertificationItem
                  title="IT Essentials"
                  issuer="Cisco"
                  date="Feb 2024"
                  url="https://www.credly.com/badges/4abff770-6592-4200-8770-1938ff54b2fc/linked_in_profile"
                />
                <CertificationItem
                  title="Python Essentials 2"
                  issuer="Cisco"
                  date="Sep 2023"
                  url="https://www.credly.com/badges/1b818c5b-5756-42d7-8fda-48665a045c94/linked_in_profile"
                />
              </div>
            </div>
          </Section>

          {/* Personal Interests (Optional, you can uncomment if you want to include) */}
          {/* 
          <Section
            id="interests"
            title="Personal Interests"
            icon={<Music className="w-6 h-6" aria-hidden="true" />}
            ref={interestsRef}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AboutCard
                title="Music"
                content="Metal and nu-metal/rock (Deftones, Slipknot). Diverse taste including house/techno for parties and various genres for gym sessions."
              />
              <AboutCard
                title="Gaming & Hobbies"
                content="Helldivers on PC (Steam), Uno (card game). Interested in electric guitar but currently finding time to practice. Also focused on fitness and weight loss goals."
              />
            </div>
          </Section>
          */}
        </main>

        {/* Footer - Fixed alignment while preventing overlap */}
        <footer className="py-16 mt-16 border-t border-neutral-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-0 relative">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-2 text-center md:text-left">
                <p className="text-sm font-medium">Zach Lagden</p>
                <p className="text-xs text-neutral-500">
                  Technical Architect & Entrepreneur
                </p>
                <p className="text-xs text-neutral-400">
                  © {new Date().getFullYear()} All rights reserved.
                </p>
              </div>

              <div className="space-y-4 flex flex-col items-center md:items-end">
                <div
                  className="flex space-x-6"
                  role="navigation"
                  aria-label="Footer social links"
                >
                  <a
                    href="https://github.com/zachlagden"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded p-1"
                    aria-label="GitHub Profile"
                  >
                    <Github className="w-5 h-5" aria-hidden="true" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/zachlagden/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded p-1"
                    aria-label="LinkedIn Profile"
                  >
                    <Linkedin className="w-5 h-5" aria-hidden="true" />
                  </a>
                  <a
                    href="https://instagram.com/z.lagden"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded p-1"
                    aria-label="Instagram Profile"
                  >
                    <Instagram className="w-5 h-5" aria-hidden="true" />
                  </a>
                  <a
                    href="mailto:zachlagden@lagden.dev"
                    className="text-neutral-400 hover:text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded p-1"
                    aria-label="Email Contact"
                  >
                    <Mail className="w-5 h-5" aria-hidden="true" />
                  </a>
                </div>

                <div className="flex flex-wrap justify-center md:justify-end space-x-4 text-xs text-neutral-500">
                  <a
                    href="https://digigrow.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-neutral-900 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded px-2 py-1 mb-2 md:mb-0"
                    aria-label="DigiGrow Website"
                  >
                    <Link className="w-3 h-3" aria-hidden="true" />
                    digigrow.uk
                  </a>
                  <a
                    href="https://lagden.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-neutral-900 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded px-2 py-1 mb-2 md:mb-0"
                    aria-label="Lagden Development Website"
                  >
                    <Link className="w-3 h-3" aria-hidden="true" />
                    lagden.dev
                  </a>
                  <a
                    href="https://zachlagden.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-neutral-900 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded px-2 py-1"
                    aria-label="Personal Website"
                  >
                    <Link className="w-3 h-3" aria-hidden="true" />
                    zachlagden.uk
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Scroll to top button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 p-3 bg-black text-white rounded-full shadow-lg z-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// Component for the fixed side navigation
const NavItem = ({ icon, isActive, onClick, label }: NavItemProps) => (
  <motion.button
    onClick={onClick}
    className={`p-3 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${isActive ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-700"}`}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    aria-label={label}
    aria-current={isActive ? "page" : undefined}
  >
    {isActive && (
      <motion.div
        layoutId="activeSection"
        className="absolute inset-0 bg-neutral-100 rounded-full"
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        aria-hidden="true"
      />
    )}
    <span className="relative">{icon}</span>
  </motion.button>
);

// Component for social icons
const SocialIcon = ({ href, icon, size = "md", label }: SocialIconProps) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`${size === "sm" ? "p-3" : "p-3"} rounded-full bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2`}
    whileHover={{ scale: 1.1, backgroundColor: "#f5f5f5" }}
    whileTap={{ scale: 0.9 }}
    aria-label={label}
  >
    {icon}
  </motion.a>
);

// Section component
const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ id, title, icon, children }, ref) => (
    <section id={id} ref={ref} className="py-16 md:py-24 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3">
          <div className="text-neutral-800">{icon}</div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        </div>
        <div className="mt-2 h-px w-16 bg-neutral-800" aria-hidden="true" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </section>
  ),
);

Section.displayName = "Section";

// Timeline item component - Updated for better tablet layout
const TimelineItem = ({
  title,
  company,
  companyLink,
  date,
  location,
  children,
}: TimelineItemProps) => (
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
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <p className="text-neutral-500 text-sm">
            <time dateTime={date.split(" - ")[0]}>{date}</time>
          </p>
          {location && <p className="text-neutral-400 text-xs">{location}</p>}
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

// About card component
const AboutCard = ({ title, content }: AboutCardProps) => (
  <motion.div
    className="p-6 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
    whileHover={{ y: -2 }}
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-medium mb-3">{title}</h3>
    <p className="text-neutral-600 text-sm leading-relaxed">{content}</p>
  </motion.div>
);

// Skill category component
const SkillCategory = ({ title, skills, colorClass }: SkillCategoryProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-medium mb-6">{title}</h3>
    <div
      className="flex flex-wrap gap-3"
      role="list"
      aria-label={`${title} skills`}
    >
      {skills.map((skill: string, index: number) => (
        <motion.span
          key={index}
          className={`rounded-full px-4 py-1.5 text-sm ${colorClass}`}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ y: -2, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)" }}
          role="listitem"
        >
          {skill}
        </motion.span>
      ))}
    </div>
  </motion.div>
);

// Certification item component
const CertificationItem = ({
  title,
  issuer,
  date,
  url,
}: CertificationItemProps) => (
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
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
    >
      <Award className="w-4 h-4 mr-1" /> View Credential
    </a>
  </motion.div>
);
