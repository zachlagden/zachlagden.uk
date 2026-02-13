import { getAllProjects } from "@/lib/projects/projects";
import { ProjectsAdmin } from "@/components/admin/ProjectsAdmin";

export const metadata = {
  title: "Projects",
};

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();

  return <ProjectsAdmin projects={projects} />;
}
