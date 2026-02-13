import { requireAdmin } from "@/lib/dal";
import { ProjectForm } from "@/components/projects/ProjectForm";

export const metadata = {
  title: "Add New Project | Zach Lagden",
  robots: "noindex, nofollow",
};

export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          Add New Project
        </h1>
        <p className="mt-2 text-zinc-400">
          Add a project to your portfolio showcase
        </p>
      </div>

      <ProjectForm />
    </main>
  );
}
