import JSZip from "jszip";
import type { ProjectDetail } from "@/types/project";
import type { Phase } from "@/lib/db/types";
import { exportPhaseToMarkdown } from "./markdown";
import { exportPhaseToJson } from "./json";
import { sanitizeFilename } from "./clipboard";

export type ZipExportFormat = "markdown" | "json";

interface ZipFile {
  name: string;
  content: string;
}

function getPhaseFiles(
  project: ProjectDetail,
  format: ZipExportFormat
): ZipFile[] {
  const files: ZipFile[] = [];
  const phases: Phase[] = ["request", "spec", "plan"];
  const phaseNames: Record<Phase, string> = {
    request: "01_request",
    spec: "02_specification",
    plan: "03_implementation_plan",
  };
  const phaseContent: Record<Phase, string | undefined> = {
    request: project.requestContent,
    spec: project.specContent,
    plan: project.planContent,
  };

  const ext = format === "json" ? "json" : "md";

  for (const phase of phases) {
    if (phaseContent[phase]) {
      const content =
        format === "json"
          ? exportPhaseToJson(project, phase)
          : exportPhaseToMarkdown(project, phase);

      files.push({
        name: `${phaseNames[phase]}.${ext}`,
        content,
      });
    }
  }

  return files;
}

function getMetadataFile(project: ProjectDetail): ZipFile {
  const metadata = {
    name: project.name,
    localId: project.localId,
    remoteId: project.remoteId,
    currentPhase: project.currentPhase,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    exportedAt: new Date().toISOString(),
    exportedFrom: "IdeaForge",
  };

  return {
    name: "metadata.json",
    content: JSON.stringify(metadata, null, 2),
  };
}

function getReadmeFile(project: ProjectDetail): ZipFile {
  const readme = `# ${project.name}

This project was exported from IdeaForge.

## Contents

- \`metadata.json\` - Project metadata
- \`01_request.md\` - Initial request/requirements${project.requestContent ? "" : " (not available)"}
- \`02_specification.md\` - Technical specification${project.specContent ? "" : " (not available)"}
- \`03_implementation_plan.md\` - Step-by-step implementation plan${project.planContent ? "" : " (not available)"}

## Project Info

- **Current Phase:** ${project.currentPhase}
- **Created:** ${project.createdAt.toLocaleDateString()}
- **Last Updated:** ${project.updatedAt.toLocaleDateString()}
- **Exported:** ${new Date().toLocaleString()}
`;

  return {
    name: "README.md",
    content: readme,
  };
}

export async function exportToZip(
  project: ProjectDetail,
  format: ZipExportFormat = "markdown"
): Promise<Blob> {
  const zip = new JSZip();
  const baseFilename = sanitizeFilename(project.name);

  // Create a folder for the project
  const folder = zip.folder(baseFilename);
  if (!folder) {
    throw new Error("Failed to create ZIP folder");
  }

  // Add README
  const readme = getReadmeFile(project);
  folder.file(readme.name, readme.content);

  // Add metadata
  const metadata = getMetadataFile(project);
  folder.file(metadata.name, metadata.content);

  // Add phase files
  const phaseFiles = getPhaseFiles(project, format);
  for (const file of phaseFiles) {
    folder.file(file.name, file.content);
  }

  // Generate the ZIP
  return zip.generateAsync({ type: "blob" });
}

export async function downloadZip(
  project: ProjectDetail,
  format: ZipExportFormat = "markdown"
): Promise<void> {
  const blob = await exportToZip(project, format);
  const filename = `${sanitizeFilename(project.name)}_export.zip`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
