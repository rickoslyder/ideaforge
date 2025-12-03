import type { ProjectDetail } from "@/types/project";
import type { Phase } from "@/lib/db/types";

export interface JsonExport {
  version: string;
  exportedAt: string;
  project: {
    name: string;
    currentPhase: Phase;
    createdAt: string;
    updatedAt: string;
    request?: string;
    spec?: string;
    specConfig?: unknown;
    plan?: string;
  };
}

export function exportToJson(project: ProjectDetail): string {
  const exportData: JsonExport = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    project: {
      name: project.name,
      currentPhase: project.currentPhase,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      request: project.requestContent,
      spec: project.specContent,
      specConfig: project.specConfig,
      plan: project.planContent,
    },
  };

  return JSON.stringify(exportData, null, 2);
}

export function exportPhaseToJson(
  project: ProjectDetail,
  phase: Phase
): string {
  const phaseContent: Record<Phase, string | undefined> = {
    request: project.requestContent,
    spec: project.specContent,
    plan: project.planContent,
  };

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    projectName: project.name,
    phase,
    content: phaseContent[phase] || null,
    ...(phase === "spec" && project.specConfig
      ? { specConfig: project.specConfig }
      : {}),
  };

  return JSON.stringify(exportData, null, 2);
}
