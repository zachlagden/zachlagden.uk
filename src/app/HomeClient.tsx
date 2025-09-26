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

// Types
import { ContentData } from "@/types/content";

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

interface HomeClientProps {
  content: ContentData;
}

export default function HomeClient({ content }: HomeClientProps) {
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
  const sectionIds = content.navigation.map((nav) => nav.id);
  useKeyboardNavigation({
    sectionIds,
    activeSection,
  });

  // Schema.org structured data - using content from JSON
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: content.personal.name,
    url: content.metadata.siteUrl,
    jobTitle: content.personal.title,
    sameAs: [
      content.personal.social.github,
      content.personal.social.linkedin,
      content.personal.social.instagram,
      content.personal.websites.digigrow,
      content.personal.websites.lagdenDev,
    ],
    email: content.personal.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: content.personal.location.split(", ")[0],
      addressCountry: content.personal.location.split(", ")[1],
    },
    worksFor: {
      "@type": "Organization",
      name: "DigiGrow LTD",
    },
    alumniOf: content.education.map((edu) => ({
      "@type": "EducationalOrganization",
      name: edu.institution,
    })),
    knowsAbout: [
      ...new Set(
        content.skills.categories.flatMap((cat) =>
          cat.skills.map((skill) => skill),
        ),
      ),
    ].slice(0, 15), // Limit to top skills
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
        navigation={content.navigation}
        content={content}
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
          navigation={content.navigation}
        />

        {/* Fixed social links */}
        <div
          className="fixed top-1/2 -translate-y-1/2 right-8 z-50 hidden lg:block"
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
              href={content.personal.social.github}
              icon={<Github className="w-5 h-5" aria-hidden="true" />}
            />
            <SocialIcon
              label="LinkedIn Profile"
              href={content.personal.social.linkedin}
              icon={<Linkedin className="w-5 h-5" aria-hidden="true" />}
            />
            <SocialIcon
              label="Instagram Profile"
              href={content.personal.social.instagram}
              icon={<Instagram className="w-5 h-5" aria-hidden="true" />}
            />
            <SocialIcon
              label="Email Contact"
              href={`mailto:${content.personal.social.email}`}
              icon={<Mail className="w-5 h-5" aria-hidden="true" />}
            />
          </motion.div>
        </div>

        {/* Header */}
        <Header
          prefersReducedMotion={prefersReducedMotion}
          isMobile={isMobile}
          content={content}
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
            content={content.about}
          />

          {/* Dynamically loaded sections */}
          <Suspense
            fallback={
              <div className="py-16 md:py-24 animate-pulse bg-neutral-100/50 h-96 rounded-lg"></div>
            }
          >
            <ExperienceSection
              ref={experienceRef}
              content={content.experience}
            />
          </Suspense>

          <Suspense
            fallback={
              <div className="py-16 md:py-24 animate-pulse bg-neutral-100/50 h-96 rounded-lg"></div>
            }
          >
            <EducationSection ref={educationRef} content={content.education} />
          </Suspense>

          <Suspense
            fallback={
              <div className="py-16 md:py-24 animate-pulse bg-neutral-100/50 h-96 rounded-lg"></div>
            }
          >
            <SkillsSection ref={skillsRef} content={content.skills} />
          </Suspense>

          <Suspense
            fallback={
              <div className="py-16 md:py-24 animate-pulse bg-neutral-100/50 h-96 rounded-lg"></div>
            }
          >
            <CertificationsSection
              ref={certificationsRef}
              content={content.certifications}
            />
          </Suspense>

          <Suspense
            fallback={
              <div className="py-16 md:py-24 animate-pulse bg-neutral-100/50 h-96 rounded-lg"></div>
            }
          >
            <ContactSection ref={contactRef} content={content.contact} />
          </Suspense>
        </main>

        {/* Footer */}
        <Footer content={content} />

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
