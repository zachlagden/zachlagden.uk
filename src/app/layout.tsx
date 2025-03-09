import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cv.zachlagden.uk"),
  title: {
    default: "Zach Lagden | Technical Architect & Entrepreneur",
    template: "%s | Zach Lagden",
  },
  description:
    "Technical Architect & Entrepreneur based in Ascot, UK. Specializing in React.js, Next.js, TypeScript, Python and full-stack web development.",
  keywords: [
    "Zach Lagden",
    "Web Developer",
    "Full Stack Developer",
    "React Developer",
    "Next.js Developer",
    "TypeScript",
    "Python Developer",
    "DigiGrow",
    "Lagden Development",
    "UK Developer",
    "Ascot Web Developer",
    "Technical Architect",
  ],
  authors: [{ name: "Zach Lagden" }],
  creator: "Zach Lagden",
  publisher: "Zach Lagden",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://cv.zachlagden.uk",
    title: "Zach Lagden | Technical Architect & Entrepreneur",
    description:
      "Technical Architect & Entrepreneur based in Ascot, UK. Specializing in React.js, Next.js, TypeScript and Python.",
    siteName: "Zach Lagden Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zach Lagden - Technical Architect & Entrepreneur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zach Lagden | Technical Architect & Entrepreneur",
    description:
      "Technical Architect & Entrepreneur based in Ascot, UK. Specializing in React.js, Next.js, TypeScript and Python.",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${inter.className} bg-neutral-50 min-h-screen`}>
        {children}
      </body>
      <GoogleAnalytics gaId="G-JGDJX5L7B9" />
    </html>
  );
}
