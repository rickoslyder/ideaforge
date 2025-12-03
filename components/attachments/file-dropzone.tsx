"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ACCEPTED_FILE_TYPES = {
  "text/plain": [".txt"],
  "text/markdown": [".md"],
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/json": [".json"],
  "text/javascript": [".js", ".jsx", ".ts", ".tsx"],
  "text/css": [".css"],
  "text/html": [".html"],
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

interface FileDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

export function FileDropzone({
  onFilesAccepted,
  disabled,
  className,
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAccepted(acceptedFiles);
    },
    [onFilesAccepted]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_FILE_TYPES,
      maxSize: MAX_FILE_SIZE,
      disabled,
      multiple: true,
    });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragActive && !isDragReject && "border-primary bg-primary/5",
        isDragReject && "border-destructive bg-destructive/5",
        disabled && "opacity-50 cursor-not-allowed",
        !isDragActive && !disabled && "hover:border-primary/50",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        {isDragActive ? (
          <>
            <File className="h-8 w-8 text-primary" />
            <p className="text-sm text-primary font-medium">
              Drop files here...
            </p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop files here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, DOCX, TXT, MD, code files, or images (max 100MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
