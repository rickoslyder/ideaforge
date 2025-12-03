"use client";

import { useCallback, useState } from "react";
import type { ProjectDetail } from "@/types/project";
import type { Phase } from "@/lib/db/types";
import {
  exportToMarkdown,
  exportPhaseToMarkdown,
  exportToJson,
  exportPhaseToJson,
  copyToClipboard,
  downloadFile,
  sanitizeFilename,
  type ExportOptions,
} from "@/lib/export";

export type ExportFormat = "markdown" | "json" | "clipboard";
export type ExportScope = "full" | Phase;

interface UseExportReturn {
  isExporting: boolean;
  error: string | null;
  exportProject: (
    project: ProjectDetail,
    format: ExportFormat,
    scope: ExportScope,
    options?: Partial<ExportOptions>
  ) => Promise<boolean>;
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportProject = useCallback(
    async (
      project: ProjectDetail,
      format: ExportFormat,
      scope: ExportScope,
      options?: Partial<ExportOptions>
    ): Promise<boolean> => {
      setIsExporting(true);
      setError(null);

      try {
        let content: string;
        let filename: string;
        const baseFilename = sanitizeFilename(project.name);

        if (scope === "full") {
          if (format === "json") {
            content = exportToJson(project);
            filename = `${baseFilename}_full.json`;
          } else {
            content = exportToMarkdown(project, options);
            filename = `${baseFilename}_full.md`;
          }
        } else {
          if (format === "json") {
            content = exportPhaseToJson(project, scope);
            filename = `${baseFilename}_${scope}.json`;
          } else {
            content = exportPhaseToMarkdown(project, scope);
            filename = `${baseFilename}_${scope}.md`;
          }
        }

        if (format === "clipboard") {
          const success = await copyToClipboard(content);
          if (!success) {
            throw new Error("Failed to copy to clipboard");
          }
          return true;
        }

        const mimeType =
          format === "json" ? "application/json" : "text/markdown";
        downloadFile(content, filename, mimeType);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Export failed");
        return false;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return {
    isExporting,
    error,
    exportProject,
  };
}
