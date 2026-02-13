import Link from "next/link";

// Force dynamic rendering - this page doesn't need static generation
export const dynamic = "force-dynamic";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold text-neutral-800 mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-neutral-700 mb-2">
        Access Forbidden
      </h2>
      <p className="text-neutral-600 mb-8 text-center max-w-md">
        You don&apos;t have permission to access this page. This area is
        restricted to administrators.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}

export const metadata = {
  title: "403 - Forbidden",
};
