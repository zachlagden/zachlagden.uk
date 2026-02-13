import "./globals.css";
import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { AdminFAB } from "@/components/auth/AdminFAB";
import { getSiteSetting } from "@/lib/content/site";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { ReducedMotionProvider } from "@/components/providers/ReducedMotionProvider";

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
  // Fetch site settings from MongoDB in parallel
  const [
    titleSetting,
    descSetting,
    siteUrlSetting,
    ogImageSetting,
    twitterImageSetting,
    keywordsSetting,
  ] = await Promise.all([
    getSiteSetting("title"),
    getSiteSetting("description"),
    getSiteSetting("siteUrl"),
    getSiteSetting("ogImage"),
    getSiteSetting("twitterImage"),
    getSiteSetting("keywords"),
  ]);

  const title =
    (titleSetting?.value as string) || "Zach Lagden | Full-Stack Developer";
  const description =
    (descSetting?.value as string) ||
    "Full-stack developer and digital entrepreneur.";
  const siteUrl = (siteUrlSetting?.value as string) || "https://zachlagden.uk";
  const ogImage = (ogImageSetting?.value as string) || "/og-image.png";
  const twitterImage =
    (twitterImageSetting?.value as string) || "/twitter-image.png";
  const keywords = (keywordsSetting?.value as string[]) || [];
  const name = "Zach Lagden";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${name}`,
    },
    description,
    keywords,
    authors: [{ name }],
    creator: name,
    publisher: name,
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
      url: siteUrl,
      title,
      description,
      siteName: `${name} Portfolio`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [twitterImage],
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
          <ReducedMotionProvider>
            <NuqsAdapter>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-cyan-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-zinc-950"
              >
                Skip to main content
              </a>
              <Navigation />
              <div id="main-content">{children}</div>
              <Footer />
            </NuqsAdapter>
            <AuthStatus />
            <AdminFAB />
          </ReducedMotionProvider>
        </SessionProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
