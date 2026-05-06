"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, PenSquare, ArrowLeft } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/blog", label: "All Posts", icon: FileText },
    { href: "/admin/blog/new", label: "New Post", icon: PenSquare },
  ];

  return (
    <aside className="w-56 border-r border-neutral-200 min-h-screen bg-white p-4 shrink-0">
      <div className="mb-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to site
        </Link>
        <h2 className="text-lg font-heading font-bold mt-3">Admin</h2>
      </div>
      <nav className="space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                isActive
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
