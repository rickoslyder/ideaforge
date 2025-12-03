"use client";

import { Download, FileJson, FileText, Copy, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectDetail } from "@/types/project";
import type { Phase } from "@/lib/db/types";
import { useExport, type ExportFormat, type ExportScope } from "@/hooks/use-export";

interface ExportMenuProps {
  project: ProjectDetail;
  currentPhase?: Phase;
  onExportSuccess?: () => void;
}

export function ExportMenu({
  project,
  currentPhase,
  onExportSuccess,
}: ExportMenuProps) {
  const { isExporting, exportProject } = useExport();

  const handleExport = async (format: ExportFormat, scope: ExportScope) => {
    const success = await exportProject(project, format, scope);
    if (success && onExportSuccess) {
      onExportSuccess();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="h-4 w-4 mr-1" />
          Export
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Full Project</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleExport("markdown", "full")}>
          <FileText className="h-4 w-4 mr-2" />
          Download as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json", "full")}>
          <FileJson className="h-4 w-4 mr-2" />
          Download as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("clipboard", "full")}>
          <Copy className="h-4 w-4 mr-2" />
          Copy to Clipboard
        </DropdownMenuItem>

        {currentPhase && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Export Current Phase</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleExport("markdown", currentPhase)}
            >
              <FileText className="h-4 w-4 mr-2" />
              {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} as
              Markdown
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExport("clipboard", currentPhase)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
