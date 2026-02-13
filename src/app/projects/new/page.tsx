import { requireAdmin } from "@/lib/dal";
import { ProjectForm } from "@/components/projects/ProjectForm";

export const metadata = {
  title: "Add New Project | Zach Lagden",
  robots: "noindex, nofollow",
};

export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-white">
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Add New Project</h1>
          <p className="text-muted-foreground mt-2">
            Add a project to your portfolio showcase
          </p>
        </div>

        <ProjectForm />
      </div>
    </main>
  );
}
