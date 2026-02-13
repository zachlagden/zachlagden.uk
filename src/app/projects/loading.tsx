export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header skeleton */}
      <div className="border-b border-neutral-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-10 w-48 bg-neutral-200 rounded animate-pulse mb-4" />
          <div className="h-6 w-96 max-w-full bg-neutral-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter skeleton */}
        <div className="mb-8">
          <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse mb-3" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 w-20 bg-neutral-200 rounded-full animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Project cards skeleton */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="border border-neutral-200 rounded-lg overflow-hidden"
            >
              {/* Image skeleton */}
              <div className="aspect-[16/9] bg-neutral-200 animate-pulse" />
              {/* Content skeleton */}
              <div className="p-6 space-y-4">
                <div className="h-6 w-3/4 bg-neutral-200 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-neutral-200 rounded animate-pulse" />
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="h-5 w-16 bg-neutral-200 rounded-full animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
