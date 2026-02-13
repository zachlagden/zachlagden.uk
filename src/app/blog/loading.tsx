export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="py-24 sm:py-32">
        <div className="h-14 w-32 animate-pulse rounded bg-zinc-800" />
        <div className="mt-6 h-6 w-full max-w-2xl animate-pulse rounded bg-zinc-800" />
      </div>

      {/* Search Skeleton */}
      <div className="mb-8">
        <div className="h-12 animate-pulse rounded-lg bg-zinc-900" />
      </div>

      {/* Filter Pills Skeleton */}
      <div className="mb-10 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-8 w-20 animate-pulse rounded-full bg-zinc-800"
          />
        ))}
      </div>

      {/* Post Cards Grid Skeleton */}
      <div className="grid gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900"
          >
            {/* Image skeleton */}
            <div className="aspect-[16/9] animate-pulse bg-zinc-800" />
            {/* Content skeleton */}
            <div className="space-y-3 p-6">
              <div className="flex gap-3">
                <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-800" />
                <div className="h-5 w-16 animate-pulse rounded bg-zinc-800" />
              </div>
              <div className="h-6 w-full animate-pulse rounded bg-zinc-800" />
              <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-800" />
              <div className="h-3 w-24 animate-pulse rounded bg-zinc-800 pt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
