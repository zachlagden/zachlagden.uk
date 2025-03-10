import React from "react";
import { Github, Linkedin, Instagram, Mail, Link } from "lucide-react";
import CopyButton from "../ui/CopyButton";

const Footer: React.FC = () => {
  return (
    <footer className="py-16 mt-16 border-t border-neutral-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-0 relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
            <p className="text-sm font-medium">Zach Lagden</p>
            <p className="text-xs text-neutral-500">
              Technical Architect & Entrepreneur
            </p>
            <div className="text-xs text-neutral-400 flex items-center justify-center md:justify-start">
              © {new Date().getFullYear()} All rights reserved.
            </div>
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
              <div className="relative flex items-center">
                <a
                  href="mailto:zachlagden@lagden.dev"
                  className="text-neutral-400 hover:text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded p-1"
                  aria-label="Email Contact"
                >
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </a>
                <CopyButton
                  textToCopy="zachlagden@lagden.dev"
                  className="absolute -top-1 -right-1 p-0.5 bg-white rounded-full"
                  size="sm"
                />
              </div>
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

            <div className="flex justify-center md:justify-end mt-2">
              <a
                href="https://github.com/zachlagden/cv.zachlagden.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-900 text-xs text-neutral-500 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded px-3 py-1.5 bg-neutral-100 border border-neutral-200"
                aria-label="Source Code on GitHub"
              >
                <Github className="w-3 h-3" aria-hidden="true" />
                View Source
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center mt-10 space-y-2">
          <p className="text-xs text-neutral-400 flex items-center">
            Made with <span className="text-red-500 mx-1">❤️</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
