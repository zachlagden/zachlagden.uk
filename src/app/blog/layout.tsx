import { loadContentServer } from "@/utils/serverContentLoader";
import BlogNav from "@/components/blog/BlogNav";
import Footer from "@/components/layout/Footer";
import ClearIntro from "@/components/ui/ClearIntro";

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await loadContentServer();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <ClearIntro />
      <BlogNav />
      <main className="flex-1">{children}</main>
      <Footer content={content} />
    </div>
  );
}
