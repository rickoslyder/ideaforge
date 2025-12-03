"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { ProjectSnapshot } from "@/lib/db/types";
import { PHASE_INFO } from "@/types/project";

interface SnapshotPreviewProps {
  snapshot: ProjectSnapshot | null;
  open: boolean;
  onClose: () => void;
}

export function SnapshotPreview({ snapshot, open, onClose }: SnapshotPreviewProps) {
  if (!snapshot) return null;

  const phaseInfo = PHASE_INFO[snapshot.phase_at_snapshot];
  const data = snapshot.snapshot_data;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Snapshot Preview
              <Badge variant="outline">{phaseInfo.label}</Badge>
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {data.name} · {new Date(snapshot.created_at).toLocaleString()}
          </p>
        </DialogHeader>

        <Tabs defaultValue="request" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="request" disabled={!data.request_content}>
              Request
            </TabsTrigger>
            <TabsTrigger value="spec" disabled={!data.spec_content}>
              Specification
            </TabsTrigger>
            <TabsTrigger value="plan" disabled={!data.plan_content}>
              Plan
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="request" className="h-full m-0">
              {data.request_content ? (
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">
                    {data.request_content}
                  </pre>
                </div>
              ) : (
                <EmptyContent phase="request" />
              )}
            </TabsContent>

            <TabsContent value="spec" className="h-full m-0">
              {data.spec_content ? (
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">
                    {data.spec_content}
                  </pre>
                </div>
              ) : (
                <EmptyContent phase="spec" />
              )}
            </TabsContent>

            <TabsContent value="plan" className="h-full m-0">
              {data.plan_content ? (
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">
                    {data.plan_content}
                  </pre>
                </div>
              ) : (
                <EmptyContent phase="plan" />
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function EmptyContent({ phase }: { phase: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <p>No {phase} content in this snapshot</p>
    </div>
  );
}
