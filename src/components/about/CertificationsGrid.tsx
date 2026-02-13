"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { SerializedCertification } from "@/models/SiteContent";

interface CertificationsGridProps {
  certifications: SerializedCertification[];
}

export default function CertificationsGrid({
  certifications,
}: CertificationsGridProps) {
  return (
    <section className="py-24 sm:py-32">
      <motion.h2
        className="font-heading text-3xl font-semibold text-text-primary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Certifications
      </motion.h2>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((cert, index) => (
          <motion.div
            key={cert._id}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-cyan-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: "easeOut",
            }}
          >
            <h3 className="font-heading text-base font-medium text-zinc-100">
              {cert.name}
            </h3>

            <p className="mt-1 text-sm text-zinc-400">{cert.issuer}</p>

            <span className="mt-3 block font-mono text-sm text-zinc-500">
              {cert.date}
            </span>

            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-cyan-500 transition-colors hover:text-cyan-400"
              >
                View credential
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
