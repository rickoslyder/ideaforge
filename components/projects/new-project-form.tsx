"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProjects } from "@/hooks/use-projects";

export function NewProjectForm() {
  const router = useRouter();
  const { createProject } = useProjects();
  const [name, setName] = useState("");
  const [initialIdea, setInitialIdea] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const project = await createProject({
        name: name.trim(),
        initialIdea: initialIdea.trim() || undefined,
      });

      router.push(`/projects/${project.localId}/request`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          placeholder="My awesome project"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="initialIdea">Initial Idea (optional)</Label>
        <Textarea
          id="initialIdea"
          placeholder="Describe your project idea..."
          value={initialIdea}
          onChange={(e) => setInitialIdea(e.target.value)}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          This will be used as the starting point for your project request.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
