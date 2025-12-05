"use client";

import Link from "next/link";
import { ArrowLeft, MoreHorizontal, History, Download, FileText, FileJson, Copy, FolderArchive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExport, type ExportFormat } from "@/hooks/use-export";
import type { ProjectDetail } from "@/types/project";

interface ProjectHeaderProps {
  name: string;
  projectId: string;
  project?: ProjectDetail;
}

export function ProjectHeader({ name, projectId, project }: ProjectHeaderProps) {
  const { isExporting, exportProject } = useExport();

  const handleExport = async (format: ExportFormat) => {
    if (!project) {
      console.error("No project data available for export");
      return;
    }
    await exportProject(project, format, "full");
  };

  return (
    <div className="flex items-center justify-between border-b bg-background px-4 py-2">
      <div className="flex items-center gap-3">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to projects</span>
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">{name}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Project options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href={`/projects/${projectId}/snapshots`}>
              <History className="mr-2 h-4 w-4" />
              Version History
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={isExporting || !project}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-52">
              <DropdownMenuLabel>Single File</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExport("markdown")}>
                <FileText className="mr-2 h-4 w-4" />
                Markdown (.md)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <FileJson className="mr-2 h-4 w-4" />
                JSON (.json)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("clipboard")}>
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Individual Files (ZIP)</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExport("zip-markdown")}>
                <FolderArchive className="mr-2 h-4 w-4" />
                Markdown Files (.zip)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("zip-json")}>
                <FolderArchive className="mr-2 h-4 w-4" />
                JSON Files (.zip)
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
