import { NewProjectForm } from "@/components/projects/new-project-form";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">New Project</h1>
        <p className="text-sm text-muted-foreground">
          Start developing a new idea
        </p>
      </div>

      <NewProjectForm />
    </div>
  );
}
