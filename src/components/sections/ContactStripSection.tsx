import React from "react";
import { Github, Linkedin, Instagram } from "lucide-react";

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/zachlagden",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/zachlagden/",
    icon: Linkedin,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/z.lagden",
    icon: Instagram,
  },
];

export default function ContactStripSection() {
  return (
    <section
      id="contact"
      className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 text-center"
    >
      <h2 className="font-heading text-3xl font-semibold text-text-primary">
        Get in touch
      </h2>

      <p className="mt-4 text-zinc-400">
        Have a project in mind or just want to chat?
      </p>

      <a
        href="mailto:zach@zachlagden.uk"
        className="mt-6 inline-block text-lg text-accent-primary transition-colors hover:underline hover:underline-offset-4"
      >
        zach@zachlagden.uk
      </a>

      <div className="mt-8 flex items-center justify-center gap-6">
        {SOCIAL_LINKS.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 transition-colors hover:text-cyan-500"
            aria-label={social.label}
          >
            <social.icon className="h-5 w-5" aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}
