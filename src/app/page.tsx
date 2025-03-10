"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import { Github, Linkedin, Instagram, Mail } from "lucide-react";
import { motion } from "framer-motion";

// Components
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Navigation from "@/components/layout/Navigation";
import MobileMenu from "@/components/layout/MobileMenu";
import SocialIcon from "@/components/ui/SocialIcon";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import KeyboardIndicator from "@/components/ui/KeyboardIndicator";
import AboutSection from "@/components/sections/AboutSection";
import GlobalBackground from "@/components/ui/GlobalBackground";
import NoiseTexture from "@/components/ui/NoiseTexture";
import ScrollProgress from "@/components/ui/ScrollProgress";

// Dynamically import CustomCursor with SSR disabled
const CustomCursor = dynamic(() => import("@/components/ui/CustomCursor"), {
  ssr: false,
});

// Dynamically import non-critical sections for performance
const ExperienceSection = dynamic(
  () => import("@/components/sections/ExperienceSection"),
  {
    loading: () => (
      <div className="py-16 md:py-24 scroll-mt-24 animate-pulse bg-neutral-100 h-96 rounded-lg"></div>
    ),
    ssr: true,
  },
);

const EducationSection = dynamic(
  () => import("@/components/sections/EducationSection"),
  {
    loading: () => (
      <div className="py-16 md:py-24 scroll-mt-24 animate-pulse bg-neutral-100 h-96 rounded-lg"></div>
    ),
    ssr: true,
  },
);

const SkillsSection = dynamic(
  () => import("@/components/sections/SkillsSection"),
  {
    loading: () => (
      <div className="py-16 md:py-24 scroll-mt-24 animate-pulse bg-neutral-100 h-96 rounded-lg"></div>
    ),
    ssr: true,
  },
);

const CertificationsSection = dynamic(
  () => import("@/components/sections/CertificationsSection"),
  {
    loading: () => (
      <div className="py-16 md:py-24 scroll-mt-24 animate-pulse bg-neutral-100 h-96 rounded-lg"></div>
    ),
    ssr: true,
  },
);

// Contact form loaded dynamically as it's new and not critical for initial load
const ContactSection = dynamic(
  () => import("@/components/sections/ContactSection"),
  {
    loading: () => (
      <div className="py-16 md:py-24 scroll-mt-24 animate-pulse bg-neutral-100 h-96 rounded-lg"></div>
    ),
    ssr: true,
  },
);

// Hooks and Utils
import useSectionObserver from "@/hooks/useSectionObserver";
import useKeyboardNavigation from "@/hooks/useKeyboardNavigation";
import { scrollToSection } from "@/utils/scrollUtils";

export default function Home() {
  // State
  const [activeSection, setActiveSection] = useState("about");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Device and preference detection - initialize with reasonable defaults for SSR
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Refs for sections
  const aboutRef = useRef<HTMLElement>(null) as React.RefObject<HTMLElement>;
  const experienceRef = useRef<HTMLElement>(
    null,
  ) as React.RefObject<HTMLElement>;
  const educationRef = useRef<HTMLElement>(
    null,
  ) as React.RefObject<HTMLElement>;
  const skillsRef = useRef<HTMLElement>(null) as React.RefObject<HTMLElement>;
  const certificationsRef = useRef<HTMLElement>(
    null,
  ) as React.RefObject<HTMLElement>;
  const contactRef = useRef<HTMLElement>(null) as React.RefObject<HTMLElement>;
  const mainContentRef = useRef<HTMLElement>(
    null,
  ) as React.RefObject<HTMLElement>;

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize device detection and preferences - client-side only
  useEffect(() => {
    if (!isClient) return;

    const checkMediaQueries = () => {
      setIsMobile(window.innerWidth < 768);
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    };

    // Initial check
    checkMediaQueries();

    // Set up listeners for changes
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const handleReducedMotionChange = () => {
      setPrefersReducedMotion(reducedMotionQuery.matches);
    };

    window.addEventListener("resize", handleResize);
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange,
      );
    };
  }, [isClient]);

  // Observer for sections
  useSectionObserver({
    sectionRefs: {
      about: aboutRef,
      experience: experienceRef,
      education: educationRef,
      skills: skillsRef,
      certifications: certificationsRef,
      contact: contactRef,
    },
    setActiveSection,
  });

  // Handle scroll for scroll-to-top button
  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  // Setup keyboard navigation
  const sectionIds = [
    "about",
    "experience",
    "education",
    "skills",
    "certifications",
    "contact",
  ];
  useKeyboardNavigation({
    sectionIds,
    activeSection,
  });

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
      <MobileMenu
        isOpen={mobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />

      <div className="min-h-screen bg-neutral-50 font-[system-ui] text-neutral-900">
        {/* Global background pattern */}
        <GlobalBackground opacity={0.2} />

        <NoiseTexture opacity={0.03} blend="overlay" />

        {/* Navigation */}
        <Navigation
          activeSection={activeSection}
          scrollToSection={scrollToSection}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Fixed social links */}
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
        <Header
          prefersReducedMotion={prefersReducedMotion}
          isMobile={isMobile}
        />

        {/* Main Content */}
        <main
          className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-20 relative pb-32"
          ref={mainContentRef}
          tabIndex={-1}
          id="main-content"
        >
          {/* Sections */}
          <AboutSection
            ref={aboutRef}
            prefersReducedMotion={prefersReducedMotion}
          />

          {/* Dynamically loaded sections */}
          <Suspense
            fallback={
              <div className="py-16 md:py-24 animate-pulse bg-neutral-100/50 h-96 rounded-lg"></div>
            }
          >
            <ExperienceSection ref={experienceRef} />
          </Suspense>

          <Suspense
            fallback={
              <div className="py-16 md:py-24 animate-pulse bg-neutral-100/50 h-96 rounded-lg"></div>
            }
          >
            <EducationSection ref={educationRef} />
          </Suspense>

          <Suspense
            fallback={
              <div className="py-16 md:py-24 animate-pulse bg-neutral-100/50 h-96 rounded-lg"></div>
            }
          >
            <SkillsSection ref={skillsRef} />
          </Suspense>

          <Suspense
            fallback={
              <div className="py-16 md:py-24 animate-pulse bg-neutral-100/50 h-96 rounded-lg"></div>
            }
          >
            <CertificationsSection ref={certificationsRef} />
          </Suspense>

          <Suspense
            fallback={
              <div className="py-16 md:py-24 animate-pulse bg-neutral-100/50 h-96 rounded-lg"></div>
            }
          >
            <ContactSection ref={contactRef} />
          </Suspense>
        </main>

        {/* Footer */}
        <Footer />

        {/* Scroll to top button */}
        <ScrollToTopButton visible={showScrollButton} />

        {/* Keyboard navigation indicator */}
        <KeyboardIndicator
          prefersReducedMotion={prefersReducedMotion}
          isMobile={isMobile}
        />
      </div>

      {/* Custom cursor - only rendered client-side */}
      {isClient && !prefersReducedMotion && !isMobile && <CustomCursor />}

      <ScrollProgress height={3} color="rgba(0, 0, 0, 0.3)" />
    </>
  );
}
