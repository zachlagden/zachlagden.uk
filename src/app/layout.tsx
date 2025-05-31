import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { loadContentServer } from "@/utils/serverContentLoader";

// Optimize font loading
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContentServer();

  return {
    metadataBase: new URL(content.metadata.siteUrl),
    title: {
      default: content.metadata.title,
      template: `%s | ${content.personal.name}`,
    },
    description: content.metadata.description,
    keywords: content.metadata.keywords,
    authors: [{ name: content.personal.name }],
    creator: content.personal.name,
    publisher: content.personal.name,
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
      url: content.metadata.siteUrl,
      title: content.metadata.title,
      description: content.metadata.description,
      siteName: `${content.personal.name} Portfolio`,
      images: [
        {
          url: content.metadata.ogImage,
          width: 1200,
          height: 630,
          alt: content.metadata.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: content.metadata.title,
      description: content.metadata.description,
      images: [content.metadata.twitterImage],
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
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={inter.variable}>
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        {/* Add preload for fonts and critical assets */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Preload CV for faster download */}
        <link rel="prefetch" href="/Zach_Lagden_CV.pdf" as="document" />
      </head>
      <body className={`${inter.className} bg-neutral-50 min-h-screen`}>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
      <GoogleAnalytics
        gaId={(await loadContentServer()).metadata.googleAnalyticsId}
      />
    </html>
  );
}
