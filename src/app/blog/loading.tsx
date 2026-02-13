export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <div className="border-b border-neutral-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-10 w-32 bg-neutral-200 rounded mb-4 animate-pulse" />
          <div className="h-6 w-full max-w-2xl bg-neutral-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* Posts Grid Skeleton */}
          <div>
            {/* Search Skeleton */}
            <div className="mb-8">
              <div className="h-12 bg-neutral-200 rounded-lg animate-pulse" />
            </div>

            {/* Post Cards Skeleton */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="border border-neutral-200 rounded-lg overflow-hidden"
                >
                  {/* Image skeleton */}
                  <div className="aspect-[16/9] bg-neutral-200 animate-pulse" />
                  {/* Content skeleton */}
                  <div className="p-6 space-y-3">
                    <div className="h-5 w-20 bg-neutral-200 rounded-full animate-pulse" />
                    <div className="h-6 w-full bg-neutral-200 rounded animate-pulse" />
                    <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-neutral-200 rounded animate-pulse" />
                    <div className="flex gap-3 pt-2">
                      <div className="h-3 w-24 bg-neutral-200 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-neutral-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <aside className="lg:sticky lg:top-8 h-fit">
            <div className="border border-neutral-200 rounded-lg p-6">
              <div className="h-6 w-20 bg-neutral-200 rounded mb-4 animate-pulse" />
              <div className="space-y-4">
                <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-24 bg-neutral-200 rounded-full animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
