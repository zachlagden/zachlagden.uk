export default function ProjectsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="py-24 sm:py-32">
        <div className="h-12 w-56 animate-pulse rounded-lg bg-zinc-800 sm:h-14" />
        <div className="mt-6 max-w-2xl space-y-3">
          <div className="h-5 w-full animate-pulse rounded bg-zinc-800" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-zinc-800" />
        </div>
      </div>

      {/* Filter pills skeleton */}
      <div className="mb-10 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-8 w-20 animate-pulse rounded-full bg-zinc-800"
          />
        ))}
      </div>

      {/* Project cards skeleton — 2-column grid */}
      <div className="grid gap-8 pb-24 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900"
          >
            {/* Image skeleton */}
            <div className="aspect-[16/9] animate-pulse bg-zinc-800" />
            {/* Content skeleton */}
            <div className="space-y-4 p-6">
              <div className="h-6 w-3/4 animate-pulse rounded bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-800" />
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="h-5 w-16 animate-pulse rounded-full bg-zinc-800"
                  />
                ))}
              </div>
              {/* GitHub stats skeleton */}
              <div className="flex gap-4">
                <div className="h-4 w-12 animate-pulse rounded bg-zinc-800" />
                <div className="h-4 w-12 animate-pulse rounded bg-zinc-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
