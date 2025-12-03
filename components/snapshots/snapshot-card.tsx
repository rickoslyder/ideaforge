"use client";

import { formatDistanceToNow } from "date-fns";
import { Clock, History, Trash2, Eye, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ProjectSnapshot } from "@/lib/db/types";
import { PHASE_INFO } from "@/types/project";

interface SnapshotCardProps {
  snapshot: ProjectSnapshot;
  onPreview: () => void;
  onRestore: () => void;
  onDelete: () => void;
  isFirst?: boolean;
}

export function SnapshotCard({
  snapshot,
  onPreview,
  onRestore,
  onDelete,
  isFirst,
}: SnapshotCardProps) {
  const phaseInfo = PHASE_INFO[snapshot.phase_at_snapshot];
  const createdAt = new Date(snapshot.created_at);

  return (
    <div className="relative flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "w-3 h-3 rounded-full border-2 bg-background",
            isFirst ? "border-primary" : "border-muted-foreground"
          )}
        />
        <div className="w-0.5 flex-1 bg-border" />
      </div>

      {/* Card content */}
      <Card className="flex-1 mb-4">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                {snapshot.trigger === "auto" ? (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Auto
                  </Badge>
                ) : (
                  <Badge className="gap-1">
                    <History className="h-3 w-3" />
                    Manual
                  </Badge>
                )}
                <Badge variant="outline">{phaseInfo.label}</Badge>
                {isFirst && (
                  <Badge variant="default" className="bg-green-600">
                    Latest
                  </Badge>
                )}
              </div>

              <div className="text-sm">
                <span className="font-medium">{snapshot.snapshot_data.name}</span>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
                <span className="mx-1">·</span>
                <span>{createdAt.toLocaleDateString()}</span>
                <span>{createdAt.toLocaleTimeString()}</span>
              </div>

              {/* Content summary */}
              <div className="text-xs text-muted-foreground mt-2 space-y-1">
                {snapshot.snapshot_data.request_content && (
                  <div>Request: {snapshot.snapshot_data.request_content.length} chars</div>
                )}
                {snapshot.snapshot_data.spec_content && (
                  <div>Spec: {snapshot.snapshot_data.spec_content.length} chars</div>
                )}
                {snapshot.snapshot_data.plan_content && (
                  <div>Plan: {snapshot.snapshot_data.plan_content.length} chars</div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Button variant="outline" size="sm" onClick={onPreview}>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button variant="outline" size="sm" onClick={onRestore}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Restore
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
