export default function PostLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_250px] gap-12">
          {/* Main Content Skeleton */}
          <div className="max-w-3xl">
            {/* Back link skeleton */}
            <div className="h-6 w-24 bg-neutral-200 rounded animate-pulse mb-6" />

            {/* Categories skeleton */}
            <div className="flex gap-2 mb-4">
              <div className="h-6 w-20 bg-neutral-200 rounded-full animate-pulse" />
              <div className="h-6 w-24 bg-neutral-200 rounded-full animate-pulse" />
            </div>

            {/* Title skeleton */}
            <div className="space-y-3 mb-4">
              <div className="h-12 bg-neutral-200 rounded animate-pulse" />
              <div className="h-12 w-3/4 bg-neutral-200 rounded animate-pulse" />
            </div>

            {/* Excerpt skeleton */}
            <div className="space-y-2 mb-6">
              <div className="h-6 bg-neutral-200 rounded animate-pulse" />
              <div className="h-6 w-5/6 bg-neutral-200 rounded animate-pulse" />
            </div>

            {/* Meta info skeleton */}
            <div className="flex gap-4 mb-8">
              <div className="h-5 w-32 bg-neutral-200 rounded animate-pulse" />
              <div className="h-5 w-24 bg-neutral-200 rounded animate-pulse" />
              <div className="h-5 w-20 bg-neutral-200 rounded animate-pulse" />
            </div>

            {/* Featured image skeleton */}
            <div className="aspect-video w-full bg-neutral-200 rounded-lg animate-pulse mb-8" />

            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="h-4 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse" />
              <div className="h-32 bg-neutral-200 rounded-lg animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-neutral-200 rounded animate-pulse" />
            </div>
          </div>

          {/* TOC Skeleton */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <div className="h-6 w-32 bg-neutral-200 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-neutral-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-neutral-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
