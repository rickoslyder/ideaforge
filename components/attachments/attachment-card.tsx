"use client";

import {
  File,
  Link,
  FileText,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import type { Attachment } from "@/types/attachment";

interface AttachmentCardProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTypeIcon(attachment: Attachment) {
  if (attachment.type === "url") return Link;
  if (attachment.type === "text") return FileText;
  if (attachment.mimeType?.startsWith("image/")) return Image;
  return File;
}

function getStatusIcon(status: Attachment["extractionStatus"]) {
  switch (status) {
    case "processing":
      return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
    case "completed":
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    case "failed":
      return <AlertCircle className="h-3 w-3 text-destructive" />;
    default:
      return null;
  }
}

export function AttachmentCard({ attachment, onRemove }: AttachmentCardProps) {
  const Icon = getTypeIcon(attachment);

  return (
    <Card className="p-3">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded flex items-center justify-center",
            attachment.type === "file" && "bg-blue-100 dark:bg-blue-900/30",
            attachment.type === "url" && "bg-purple-100 dark:bg-purple-900/30",
            attachment.type === "text" && "bg-green-100 dark:bg-green-900/30"
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4",
              attachment.type === "file" && "text-blue-600 dark:text-blue-400",
              attachment.type === "url" &&
                "text-purple-600 dark:text-purple-400",
              attachment.type === "text" && "text-green-600 dark:text-green-400"
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium truncate block">
                    {attachment.name}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{attachment.name}</p>
                  {attachment.sourceUrl && (
                    <p className="text-xs text-muted-foreground">
                      {attachment.sourceUrl}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {getStatusIcon(attachment.extractionStatus)}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{attachment.type}</span>
            {attachment.sizeBytes && (
              <>
                <span>•</span>
                <span>{formatFileSize(attachment.sizeBytes)}</span>
              </>
            )}
            {attachment.extractedContent && (
              <>
                <span>•</span>
                <span>
                  {attachment.extractedContent.length.toLocaleString()} chars
                </span>
              </>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(attachment.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
