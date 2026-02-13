import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Technical articles, tutorials, and insights on web development, React, TypeScript, and more.",
  openGraph: {
    title: "Blog - Zach Lagden",
    description:
      "Technical articles, tutorials, and insights on web development.",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
