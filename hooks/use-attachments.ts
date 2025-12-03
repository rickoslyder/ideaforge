"use client";

import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import type { Attachment, CreateAttachmentInput } from "@/types/attachment";

export function useAttachments(projectId: string) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFileAttachment = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);

      try {
        const attachment: Attachment = {
          id: nanoid(),
          projectId,
          type: "file",
          name: file.name,
          originalFilename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          extractionStatus: "pending",
          createdAt: new Date().toISOString(),
        };

        setAttachments((prev) => [...prev, attachment]);

        // TODO: Upload to storage and extract content
        // For now, read text files directly
        if (file.type.startsWith("text/") || file.name.endsWith(".md")) {
          const text = await file.text();
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === attachment.id
                ? { ...a, extractedContent: text, extractionStatus: "completed" }
                : a
            )
          );
        }

        return attachment;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add file");
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [projectId]
  );

  const addUrlAttachment = useCallback(
    async (url: string, name?: string) => {
      setIsUploading(true);
      setError(null);

      try {
        const attachment: Attachment = {
          id: nanoid(),
          projectId,
          type: "url",
          name: name || new URL(url).hostname,
          sourceUrl: url,
          extractionStatus: "processing",
          createdAt: new Date().toISOString(),
        };

        setAttachments((prev) => [...prev, attachment]);

        // Extract URL content
        try {
          const response = await fetch("/api/extract/url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });

          if (response.ok) {
            const data = await response.json();
            setAttachments((prev) =>
              prev.map((a) =>
                a.id === attachment.id
                  ? {
                      ...a,
                      extractedContent: data.content,
                      extractionStatus: "completed",
                    }
                  : a
              )
            );
          } else {
            setAttachments((prev) =>
              prev.map((a) =>
                a.id === attachment.id
                  ? { ...a, extractionStatus: "failed" }
                  : a
              )
            );
          }
        } catch {
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === attachment.id
                ? { ...a, extractionStatus: "failed" }
                : a
            )
          );
        }

        return attachment;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add URL");
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [projectId]
  );

  const addTextAttachment = useCallback(
    (name: string, content: string) => {
      const attachment: Attachment = {
        id: nanoid(),
        projectId,
        type: "text",
        name,
        content,
        extractedContent: content,
        extractionStatus: "completed",
        createdAt: new Date().toISOString(),
      };

      setAttachments((prev) => [...prev, attachment]);
      return attachment;
    },
    [projectId]
  );

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  const getContextString = useCallback(() => {
    return attachments
      .filter((a) => a.extractedContent || a.content)
      .map((a) => {
        const content = a.extractedContent || a.content || "";
        const source =
          a.type === "url" ? a.sourceUrl : a.type === "file" ? a.name : a.name;
        return `--- ${a.type.toUpperCase()}: ${source} ---\n${content}`;
      })
      .join("\n\n");
  }, [attachments]);

  return {
    attachments,
    isUploading,
    error,
    addFileAttachment,
    addUrlAttachment,
    addTextAttachment,
    removeAttachment,
    clearAttachments,
    getContextString,
  };
}
