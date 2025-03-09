"use client";

import React from "react";
import { Award } from "lucide-react";
import Section from "../ui/Section";
import CertificationItem from "../ui/CertificationItem";

const CertificationsSection = React.forwardRef<HTMLElement>((props, ref) => {
  return (
    <Section
      id="certifications"
      title="Certifications"
      icon={<Award className="w-6 h-6" aria-hidden="true" />}
      ref={ref}
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
  );
});

CertificationsSection.displayName = "CertificationsSection";

export default CertificationsSection;
