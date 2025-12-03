"use client";

import { FileDropzone } from "./file-dropzone";
import { UrlInput } from "./url-input";
import { TextContextInput } from "./text-context-input";
import { AttachmentList } from "./attachment-list";
import { useAttachments } from "@/hooks/use-attachments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { File, Link, FileText } from "lucide-react";

interface AttachmentManagerProps {
  projectId: string;
  onContextChange?: (context: string) => void;
}

export function AttachmentManager({
  projectId,
  onContextChange,
}: AttachmentManagerProps) {
  const {
    attachments,
    isUploading,
    addFileAttachment,
    addUrlAttachment,
    addTextAttachment,
    removeAttachment,
    getContextString,
  } = useAttachments(projectId);

  const handleFilesAccepted = async (files: File[]) => {
    for (const file of files) {
      await addFileAttachment(file);
    }
    onContextChange?.(getContextString());
  };

  const handleUrlSubmit = async (url: string) => {
    await addUrlAttachment(url);
    onContextChange?.(getContextString());
  };

  const handleTextSubmit = (name: string, content: string) => {
    addTextAttachment(name, content);
    onContextChange?.(getContextString());
  };

  const handleRemove = (id: string) => {
    removeAttachment(id);
    onContextChange?.(getContextString());
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Project Context</CardTitle>
        <CardDescription>
          Attach files, URLs, or text to provide additional context for
          specification generation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="files" className="gap-2">
              <File className="h-4 w-4" />
              <span className="hidden sm:inline">Files</span>
            </TabsTrigger>
            <TabsTrigger value="urls" className="gap-2">
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">URLs</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="mt-4">
            <FileDropzone
              onFilesAccepted={handleFilesAccepted}
              disabled={isUploading}
            />
          </TabsContent>

          <TabsContent value="urls" className="mt-4">
            <UrlInput onUrlSubmit={handleUrlSubmit} disabled={isUploading} />
            <p className="text-xs text-muted-foreground mt-2">
              Content will be automatically extracted from the URL.
            </p>
          </TabsContent>

          <TabsContent value="text" className="mt-4">
            <TextContextInput
              onTextSubmit={handleTextSubmit}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Add custom text context like requirements, notes, or references.
            </p>
          </TabsContent>
        </Tabs>

        <AttachmentList attachments={attachments} onRemove={handleRemove} />
      </CardContent>
    </Card>
  );
}
