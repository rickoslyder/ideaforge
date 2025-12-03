import type { ProjectDetail } from "@/types/project";
import type { Phase } from "@/lib/db/types";

export interface ExportOptions {
  includeRequest: boolean;
  includeSpec: boolean;
  includePlan: boolean;
  includeMetadata: boolean;
}

const DEFAULT_OPTIONS: ExportOptions = {
  includeRequest: true,
  includeSpec: true,
  includePlan: true,
  includeMetadata: true,
};

export function exportToMarkdown(
  project: ProjectDetail,
  options: Partial<ExportOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const sections: string[] = [];

  // Title
  sections.push(`# ${project.name}\n`);

  // Metadata
  if (opts.includeMetadata) {
    sections.push(`> **Created:** ${project.createdAt.toLocaleDateString()}`);
    sections.push(`> **Last Updated:** ${project.updatedAt.toLocaleDateString()}`);
    sections.push(`> **Current Phase:** ${project.currentPhase}`);
    sections.push("");
  }

  // Table of contents
  const toc: string[] = ["## Table of Contents\n"];
  if (opts.includeRequest && project.requestContent) {
    toc.push("- [Request](#request)");
  }
  if (opts.includeSpec && project.specContent) {
    toc.push("- [Specification](#specification)");
  }
  if (opts.includePlan && project.planContent) {
    toc.push("- [Implementation Plan](#implementation-plan)");
  }
  if (toc.length > 1) {
    sections.push(toc.join("\n"));
    sections.push("");
  }

  // Request section
  if (opts.includeRequest && project.requestContent) {
    sections.push("---\n");
    sections.push("## Request\n");
    sections.push(project.requestContent);
    sections.push("");
  }

  // Specification section
  if (opts.includeSpec && project.specContent) {
    sections.push("---\n");
    sections.push("## Specification\n");
    sections.push(project.specContent);
    sections.push("");
  }

  // Plan section
  if (opts.includePlan && project.planContent) {
    sections.push("---\n");
    sections.push("## Implementation Plan\n");
    sections.push(project.planContent);
    sections.push("");
  }

  // Footer
  sections.push("---\n");
  sections.push(`*Exported from IdeaForge on ${new Date().toLocaleString()}*`);

  return sections.join("\n");
}

export function exportPhaseToMarkdown(
  project: ProjectDetail,
  phase: Phase
): string {
  const phaseTitles: Record<Phase, string> = {
    request: "Request",
    spec: "Specification",
    plan: "Implementation Plan",
  };

  const phaseContent: Record<Phase, string | undefined> = {
    request: project.requestContent,
    spec: project.specContent,
    plan: project.planContent,
  };

  const content = phaseContent[phase];
  if (!content) {
    return `# ${project.name} - ${phaseTitles[phase]}\n\n*No content available*`;
  }

  const sections: string[] = [];
  sections.push(`# ${project.name} - ${phaseTitles[phase]}\n`);
  sections.push(content);
  sections.push("\n---\n");
  sections.push(`*Exported from IdeaForge on ${new Date().toLocaleString()}*`);

  return sections.join("\n");
}
