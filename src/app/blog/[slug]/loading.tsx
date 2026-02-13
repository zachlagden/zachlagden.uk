export default function PostLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[1fr_250px]">
        {/* Main Content Skeleton */}
        <div className="max-w-prose">
          {/* Back link skeleton */}
          <div className="mb-6 h-6 w-24 animate-pulse rounded bg-zinc-800" />

          {/* Categories skeleton */}
          <div className="mb-4 flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-800" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-zinc-800" />
          </div>

          {/* Title skeleton */}
          <div className="mb-4 space-y-3">
            <div className="h-12 animate-pulse rounded bg-zinc-800" />
            <div className="h-12 w-3/4 animate-pulse rounded bg-zinc-800" />
          </div>

          {/* Excerpt skeleton */}
          <div className="mb-6 space-y-2">
            <div className="h-6 animate-pulse rounded bg-zinc-800" />
            <div className="h-6 w-5/6 animate-pulse rounded bg-zinc-800" />
          </div>

          {/* Meta info skeleton */}
          <div className="mb-8 flex gap-4">
            <div className="h-5 w-32 animate-pulse rounded bg-zinc-800" />
            <div className="h-5 w-24 animate-pulse rounded bg-zinc-800" />
            <div className="h-5 w-20 animate-pulse rounded bg-zinc-800" />
          </div>

          {/* Featured image skeleton */}
          <div className="mb-8 aspect-video w-full animate-pulse rounded-lg bg-zinc-800" />

          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-4 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 animate-pulse rounded bg-zinc-800" />
            <div className="h-32 animate-pulse rounded-lg bg-zinc-800" />
            <div className="h-4 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-800" />
          </div>
        </div>

        {/* TOC Skeleton */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <div className="mb-4 h-6 w-32 animate-pulse rounded bg-zinc-800" />
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-800" />
              <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
