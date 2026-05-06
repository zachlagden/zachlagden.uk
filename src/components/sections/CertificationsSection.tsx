"use client";

import React from "react";
import { Award } from "lucide-react";
import Section from "../ui/Section";
import CertificationItem from "../ui/CertificationItem";
import { Certification } from "@/types/content";
import { formatDate } from "@/utils/contentLoader";

interface CertificationsSectionProps {
  content: Certification[];
  sectionIndex?: number;
}

const CertificationsSection = React.forwardRef<
  HTMLElement,
  CertificationsSectionProps
>(({ content, sectionIndex }, ref) => {
  return (
    <Section
      id="certifications"
      title="Certifications"
      icon={<Award className="w-6 h-6" aria-hidden="true" />}
      ref={ref}
      sectionIndex={sectionIndex}
    >
      <div className="space-y-8">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          role="list"
          aria-label="Professional certifications"
        >
          {content.map((cert, i) => {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const delay = row * 0.15 + col * 0.1;
            return (
              <CertificationItem
                key={cert.id}
                title={cert.name}
                issuer={cert.issuer}
                date={formatDate(cert.issueDate)}
                url={cert.credentialUrl || undefined}
                delay={delay}
              />
            );
          })}
        </div>
      </div>
    </Section>
  );
});

CertificationsSection.displayName = "CertificationsSection";

export default CertificationsSection;
