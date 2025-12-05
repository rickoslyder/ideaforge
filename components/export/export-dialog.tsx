"use client";

import { useState } from "react";
import { Download, FileJson, FileText, Copy, Check, Loader2, FolderArchive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectDetail } from "@/types/project";
import { useExport, type ExportFormat, type ExportScope } from "@/hooks/use-export";
import type { ExportOptions } from "@/lib/export";

interface ExportDialogProps {
  project: ProjectDetail;
  trigger?: React.ReactNode;
}

export function ExportDialog({ project, trigger }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("markdown");
  const [scope, setScope] = useState<ExportScope>("full");
  const [options, setOptions] = useState<ExportOptions>({
    includeRequest: true,
    includeSpec: true,
    includePlan: true,
    includeMetadata: true,
  });
  const [success, setSuccess] = useState(false);

  const { isExporting, error, exportProject } = useExport();

  const handleExport = async () => {
    const result = await exportProject(project, format, scope, options);
    if (result) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (format === "clipboard") {
          // Keep dialog open briefly for clipboard
          setTimeout(() => setOpen(false), 500);
        } else {
          setOpen(false);
        }
      }, 1500);
    }
  };

  const formatIcons: Record<ExportFormat, React.ReactNode> = {
    markdown: <FileText className="h-4 w-4" />,
    json: <FileJson className="h-4 w-4" />,
    clipboard: <Copy className="h-4 w-4" />,
    "zip-markdown": <FolderArchive className="h-4 w-4" />,
    "zip-json": <FolderArchive className="h-4 w-4" />,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Project</DialogTitle>
          <DialogDescription>
            Choose export format and options for "{project.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format selection */}
          <div className="space-y-2">
            <Label>Format</Label>
            <Select
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="markdown">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Markdown (.md)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON (.json)
                  </div>
                </SelectItem>
                <SelectItem value="clipboard">
                  <div className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </div>
                </SelectItem>
                <SelectItem value="zip-markdown">
                  <div className="flex items-center gap-2">
                    <FolderArchive className="h-4 w-4" />
                    ZIP (Markdown files)
                  </div>
                </SelectItem>
                <SelectItem value="zip-json">
                  <div className="flex items-center gap-2">
                    <FolderArchive className="h-4 w-4" />
                    ZIP (JSON files)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scope selection */}
          <div className="space-y-2">
            <Label>Scope</Label>
            <Select
              value={scope}
              onValueChange={(v) => setScope(v as ExportScope)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Project</SelectItem>
                <SelectItem value="request" disabled={!project.requestContent}>
                  Request Only
                </SelectItem>
                <SelectItem value="spec" disabled={!project.specContent}>
                  Specification Only
                </SelectItem>
                <SelectItem value="plan" disabled={!project.planContent}>
                  Plan Only
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options (only for full export with markdown) */}
          {scope === "full" && format === "markdown" && (
            <div className="space-y-3 pt-2">
              <Label className="text-sm font-medium">Include Sections</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="request" className="text-sm font-normal">
                    Request
                  </Label>
                  <Switch
                    id="request"
                    checked={options.includeRequest}
                    onCheckedChange={(c) =>
                      setOptions((o) => ({ ...o, includeRequest: c }))
                    }
                    disabled={!project.requestContent}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="spec" className="text-sm font-normal">
                    Specification
                  </Label>
                  <Switch
                    id="spec"
                    checked={options.includeSpec}
                    onCheckedChange={(c) =>
                      setOptions((o) => ({ ...o, includeSpec: c }))
                    }
                    disabled={!project.specContent}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="plan" className="text-sm font-normal">
                    Plan
                  </Label>
                  <Switch
                    id="plan"
                    checked={options.includePlan}
                    onCheckedChange={(c) =>
                      setOptions((o) => ({ ...o, includePlan: c }))
                    }
                    disabled={!project.planContent}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="metadata" className="text-sm font-normal">
                    Metadata (dates, phase)
                  </Label>
                  <Switch
                    id="metadata"
                    checked={options.includeMetadata}
                    onCheckedChange={(c) =>
                      setOptions((o) => ({ ...o, includeMetadata: c }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || success}>
            {success ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Done
              </>
            ) : isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                {formatIcons[format]}
                <span className="ml-1">
                  {format === "clipboard" ? "Copy" : "Download"}
                </span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
