"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminFABProps {
  /** Override for edit URL (e.g., when on a specific post) */
  editUrl?: string;
  /** Callback for delete action */
  onDelete?: () => void;
}

export function AdminFAB({ editUrl, onDelete }: AdminFABProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Only show for admin users
  if (session?.user?.role !== "admin") {
    return null;
  }

  // Determine which actions to show based on current page
  const isBlogPage = pathname?.startsWith("/blog");
  const isBlogPost =
    pathname?.match(/^\/blog\/[^/]+$/) && pathname !== "/blog/new";
  const isProjectsPage = pathname === "/projects";

  const actions: {
    icon: typeof Plus;
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "danger";
  }[] = [];

  // New Post - show on blog pages
  if (isBlogPage) {
    actions.push({
      icon: Plus,
      label: "New Post",
      href: "/blog/new",
    });
  }

  // Edit - show on individual blog posts
  if (isBlogPost && editUrl) {
    actions.push({
      icon: Pencil,
      label: "Edit",
      href: editUrl,
    });
  }

  // Delete - show on individual blog posts
  if (isBlogPost && onDelete) {
    actions.push({
      icon: Trash2,
      label: "Delete",
      onClick: onDelete,
      variant: "danger",
    });
  }

  // Add Project - show on projects page
  if (isProjectsPage) {
    actions.push({
      icon: Plus,
      label: "Add Project",
      href: "/projects/new",
    });
  }

  // Don't render if no actions available
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-2">
      {/* Action buttons (shown when open) */}
      {isOpen && (
        <div className="flex flex-col-reverse gap-2 mb-2">
          {actions.map((action, index) =>
            action.href ? (
              <Link
                key={index}
                href={action.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full",
                  "bg-white/80",
                  "backdrop-blur-md",
                  "shadow-lg",
                  "transition-all duration-150",
                  "animate-in fade-in slide-in-from-bottom-2",
                  action.variant === "danger"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-neutral-800 hover:bg-white",
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <action.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ) : (
              <button
                key={index}
                onClick={() => {
                  action.onClick?.();
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full",
                  "bg-white/80",
                  "backdrop-blur-md",
                  "shadow-lg",
                  "transition-all duration-150",
                  "animate-in fade-in slide-in-from-bottom-2",
                  action.variant === "danger"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-neutral-800 hover:bg-white",
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <action.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ),
          )}
        </div>
      )}

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center h-14 w-14 rounded-full",
          "bg-amber-500 hover:bg-amber-600",
          "text-white shadow-lg",
          "transition-all duration-150",
          isOpen && "rotate-45",
        )}
        aria-label={isOpen ? "Close admin menu" : "Open admin menu"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
    </div>
  );
}
