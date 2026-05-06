"use client";

import { useState } from "react";
import { Share2, Check, Linkedin } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-500 mr-1">Share</span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors"
        aria-label="Share on X (Twitter)"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </a>
      <button
        onClick={handleCopy}
        className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors"
        aria-label="Copy link"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
