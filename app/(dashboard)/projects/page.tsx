"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectList } from "@/components/projects/project-list";
import { ProjectSearch } from "@/components/projects/project-search";
import { useProjects } from "@/hooks/use-projects";

export default function ProjectsPage() {
  const { projects, isLoading, removeProject } = useProjects();
  const [search, setSearch] = useState("");

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const query = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.initialIdea?.toLowerCase().includes(query)
    );
  }, [projects, search]);

  async function handleDelete(localId: string) {
    if (confirm("Are you sure you want to delete this project?")) {
      await removeProject(localId);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage your idea development projects
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="mb-6 max-w-sm">
        <ProjectSearch value={search} onChange={setSearch} />
      </div>

      <ProjectList
        projects={filteredProjects}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
}
