import { ContentData } from "@/types/content";

let contentCache: ContentData | null = null;

export async function loadContent(): Promise<ContentData> {
  if (contentCache) {
    return contentCache;
  }

  try {
    const response = await fetch("/content.json");
    if (!response.ok) {
      throw new Error(`Failed to load content: ${response.statusText}`);
    }

    const data = await response.json();
    contentCache = data;
    return data;
  } catch (error) {
    console.error("Error loading content:", error);
    throw error;
  }
}

export async function getContent(): Promise<ContentData> {
  return loadContent();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
  };
  return date.toLocaleDateString("en-US", options);
}

export function formatDateRange(
  startDate: string,
  endDate?: string | null,
): string {
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : "Present";
  return `${start} - ${end}`;
}
