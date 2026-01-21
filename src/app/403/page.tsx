import Link from "next/link"

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
        403
      </h1>
      <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
        Access Forbidden
      </h2>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8 text-center max-w-md">
        You don&apos;t have permission to access this page. This area is restricted to administrators.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
      >
        Go Home
      </Link>
    </div>
  )
}

export const metadata = {
  title: "403 - Forbidden",
}
