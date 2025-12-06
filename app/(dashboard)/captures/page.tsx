"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Inbox,
  ArrowRight,
  Trash2,
  ExternalLink,
  Clock,
  Globe,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useCaptures } from "@/hooks/use-captures";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getSourceIcon(sourceType: string) {
  switch (sourceType) {
    case "extension":
      return <Globe className="h-3 w-3" />;
    case "pwa":
      return <FileText className="h-3 w-3" />;
    default:
      return <FileText className="h-3 w-3" />;
  }
}

export default function CapturesPage() {
  const { captures, isLoading, deleteCapture, convertToProject } = useCaptures();
  const [converting, setConverting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleConvert = async (id: string) => {
    setConverting(id);
    try {
      await convertToProject(id);
    } catch (error) {
      console.error("Failed to convert:", error);
    } finally {
      setConverting(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteCapture(id);
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Inbox className="h-8 w-8" />
          Captures
        </h1>
        <p className="text-muted-foreground mt-1">
          Quick ideas captured for later development
        </p>
      </div>

      {captures.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No captures yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use the Quick Capture API or browser extension to send ideas here.
            </p>
            <Link href="/settings/tokens">
              <Button variant="outline">
                Set up API Token
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {captures.map((capture) => (
            <Card key={capture.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {capture.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(capture.created_at)}
                      <Badge variant="secondary" className="text-xs">
                        {getSourceIcon(capture.source_type)}
                        <span className="ml-1">{capture.source_type}</span>
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleConvert(capture.id)}
                      disabled={converting === capture.id}
                    >
                      {converting === capture.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Convert to Project
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setConfirmDelete(capture.id)}
                      disabled={deleting === capture.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {capture.idea && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {capture.idea}
                  </p>
                )}
                {capture.selected_text && (
                  <div className="text-sm bg-muted/50 p-2 rounded-md border-l-2 border-primary/30">
                    <p className="text-muted-foreground line-clamp-2">
                      &ldquo;{capture.selected_text}&rdquo;
                    </p>
                  </div>
                )}
                {capture.source_url && (
                  <a
                    href={capture.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {capture.source_title || capture.source_url}
                  </a>
                )}
                {capture.tags && capture.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {capture.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Capture?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this capture. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
