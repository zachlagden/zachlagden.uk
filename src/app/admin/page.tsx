import Link from "next/link";
import {
  Home,
  User,
  FileText,
  FolderOpen,
  Settings,
  ArrowRight,
} from "lucide-react";

const sections = [
  {
    href: "/admin/homepage",
    label: "Homepage",
    description: "Edit hero text, featured work, skills, testimonials",
    icon: Home,
  },
  {
    href: "/admin/about",
    label: "About",
    description: "Manage experience, education, certifications, skills",
    icon: User,
  },
  {
    href: "/admin/blog",
    label: "Blog",
    description: "Manage posts, drafts, and publishing",
    icon: FileText,
  },
  {
    href: "/admin/projects",
    label: "Projects",
    description: "Manage portfolio projects and visibility",
    icon: FolderOpen,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    description: "Site metadata, section visibility, configuration",
    icon: Settings,
  },
];

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          Dashboard
        </h1>
        <p className="mt-2 text-zinc-400">
          Manage your site content and settings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group flex items-start gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-cyan-500/20"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 transition-colors group-hover:bg-cyan-500/10 group-hover:text-cyan-500">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-heading font-medium text-zinc-100 transition-colors group-hover:text-cyan-500">
                  {section.label}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {section.description}
                </p>
              </div>
              <ArrowRight
                className="mt-1 h-4 w-4 shrink-0 text-zinc-700 transition-colors group-hover:text-cyan-500"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
