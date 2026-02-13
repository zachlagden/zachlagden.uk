import React from "react";
import Link from "next/link";
import { Github, Linkedin, Instagram, Mail } from "lucide-react";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Blog", href: "/blog" },
  { label: "Projects", href: "/projects" },
];

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
  {
    label: "Email",
    href: "mailto:zach@zachlagden.uk",
    icon: Mail,
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#111111] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* Left: Copyright */}
          <div className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Zach Lagden
          </div>

          {/* Center: Quick links */}
          <nav aria-label="Footer navigation" className="flex gap-6">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-zinc-500 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Social icons */}
          <div
            className="flex gap-4"
            role="navigation"
            aria-label="Social links"
          >
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target={
                  social.href.startsWith("mailto:") ? undefined : "_blank"
                }
                rel={
                  social.href.startsWith("mailto:")
                    ? undefined
                    : "noopener noreferrer"
                }
                className="text-zinc-500 transition-colors hover:text-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#111111] rounded-sm p-1"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
