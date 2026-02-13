export default function AboutLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="py-24 sm:py-32">
        <div className="h-14 w-40 animate-pulse rounded-lg bg-zinc-800" />
        <div className="mt-6 max-w-2xl space-y-3">
          <div className="h-5 w-full animate-pulse rounded bg-zinc-800" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-zinc-800" />
          <div className="h-5 w-3/5 animate-pulse rounded bg-zinc-800" />
        </div>
      </div>

      {/* Experience section skeleton */}
      <div className="pb-16">
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="mb-2 h-5 w-48 animate-pulse rounded bg-zinc-800" />
              <div className="mb-1 h-4 w-32 animate-pulse rounded bg-zinc-800" />
              <div className="mb-3 h-3 w-24 animate-pulse rounded bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills section skeleton */}
      <div className="pb-24">
        <div className="mb-8 h-8 w-32 animate-pulse rounded bg-zinc-800" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="mb-4 h-5 w-32 animate-pulse rounded bg-zinc-800" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((j) => (
                  <div
                    key={j}
                    className="h-6 w-16 animate-pulse rounded-full bg-zinc-800"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
