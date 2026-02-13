import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog/posts";

// Note: Removed 'edge' runtime due to reading-time package incompatibility
// OG images will use Node.js runtime
export const alt = "Blog post cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    // Fallback for missing posts
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#0a0a0a",
            color: "#e5e5e5",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: "bold" }}>Post Not Found</div>
        </div>
      ),
      { ...size },
    );
  }

  // Get category for display
  const category = post.categories[0] ?? "Blog";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          padding: "60px 80px",
        }}
      >
        {/* Category badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              backgroundColor: "#262626",
              color: "#a3a3a3",
              padding: "8px 16px",
              borderRadius: "9999px",
              fontSize: "20px",
              fontWeight: "500",
            }}
          >
            {category}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: post.title.length > 60 ? 48 : 64,
              fontWeight: "bold",
              color: "#e5e5e5",
              lineHeight: 1.2,
              marginBottom: "24px",
              maxWidth: "900px",
            }}
          >
            {post.title}
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#737373",
              lineHeight: 1.5,
              maxWidth: "800px",
            }}
          >
            {post.excerpt.slice(0, 150)}
            {post.excerpt.length > 150 ? "..." : ""}
          </div>
        </div>

        {/* Footer: author and meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                color: "#e5e5e5",
                fontWeight: "500",
              }}
            >
              {post.author}
            </div>
            <div
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "9999px",
                backgroundColor: "#525252",
              }}
            />
            <div
              style={{
                fontSize: "20px",
                color: "#737373",
              }}
            >
              {post.readingTime} min read
            </div>
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "#737373",
              fontWeight: "500",
            }}
          >
            zachlagden.uk
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
