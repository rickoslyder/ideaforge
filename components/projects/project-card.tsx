"use client";

import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils/formatters";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PHASE_INFO } from "@/types/project";
import type { ProjectListItem } from "@/types/project";

interface ProjectCardProps {
  project: ProjectListItem;
  onDelete: (localId: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const phaseInfo = PHASE_INFO[project.currentPhase];

  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <Link href={`/projects/${project.localId}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-1 text-lg">{project.name}</CardTitle>
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: phaseInfo.color }}
              title={phaseInfo.label}
            />
          </div>
        </CardHeader>
        <CardContent>
          {project.initialIdea && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {project.initialIdea}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium" style={{ color: phaseInfo.color }}>
              {phaseInfo.label}
            </span>
            <span>Updated {formatDistanceToNow(project.updatedAt)}</span>
          </div>
        </CardContent>
      </Link>

      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.preventDefault()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.preventDefault();
                onDelete(project.localId);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
