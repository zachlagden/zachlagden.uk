"use client";

import React from "react";
import Script from "next/script";
import HeroSection from "@/components/layout/Header";
import FeaturedWorkSection from "@/components/sections/FeaturedWorkSection";
import SkillsPreviewSection from "@/components/sections/SkillsPreviewSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import LatestPostsSection from "@/components/sections/LatestPostsSection";
import ContactStripSection from "@/components/sections/ContactStripSection";
import type { SerializedPost } from "@/models/Post";

interface HomeClientProps {
  latestPosts: SerializedPost[];
}

// Structured data is hardcoded and contains no user input — safe to serialize directly
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Zach Lagden",
  url: "https://zachlagden.uk",
  jobTitle: "Full-Stack Developer & Digital Entrepreneur",
  sameAs: [
    "https://github.com/zachlagden",
    "https://www.linkedin.com/in/zachlagden/",
    "https://instagram.com/z.lagden",
    "https://digigrow.uk",
    "https://lagden.dev",
  ],
  email: "zach@zachlagden.uk",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Southampton",
    addressCountry: "UK",
  },
  worksFor: {
    "@type": "Organization",
    name: "DigiGrow LTD",
  },
};

export default function HomeClient({ latestPosts }: HomeClientProps) {
  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(STRUCTURED_DATA),
        }}
      />

      <HeroSection />
      <FeaturedWorkSection />
      <SkillsPreviewSection />
      <TestimonialsSection />
      <LatestPostsSection posts={latestPosts} />
      <ContactStripSection />
    </>
  );
}
