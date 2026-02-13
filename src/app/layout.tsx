import "./globals.css";
import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { AdminFAB } from "@/components/auth/AdminFAB";
import { loadContentServer } from "@/utils/serverContentLoader";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";

// Optimize font loading
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
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
  themeColor: "#0a0a0a",
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
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
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
      <body
        className={`${inter.className} bg-[#0a0a0a] text-zinc-100 min-h-screen`}
      >
        <SessionProvider>
          <NuqsAdapter>
            <Navigation />
            {children}
            <Footer />
          </NuqsAdapter>
          <AuthStatus />
          <AdminFAB />
        </SessionProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
