"use client";

import { useState } from "react";
import { Check, MoreVertical, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { Provider } from "@/lib/llm/types";

interface ApiKeyInfo {
  id: string;
  provider: Provider;
  name: string | null;
  isDefault: boolean;
  createdAt: string;
  hasKey: boolean;
}

const providerLabels: Record<Provider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google (Gemini)",
  ollama: "Ollama",
  custom: "Custom",
};

const providerColors: Record<Provider, string> = {
  openai: "bg-green-500/10 text-green-600 dark:text-green-400",
  anthropic: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  google: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  ollama: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  custom: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

interface ApiKeyListProps {
  apiKeys: ApiKeyInfo[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
}

export function ApiKeyList({
  apiKeys,
  isLoading,
  onDelete,
  onSetDefault,
}: ApiKeyListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await onDelete(deleteId);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (apiKeys.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            No API keys configured yet.
            <br />
            Add your first API key to start using IdeaForge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {apiKeys.map((key) => (
          <Card key={key.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                      providerColors[key.provider]
                    }`}
                  >
                    {providerLabels[key.provider]}
                  </span>
                  <CardTitle className="text-base">
                    {key.name || "Unnamed Key"}
                  </CardTitle>
                  {key.isDefault && (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <Star className="h-3 w-3 fill-current" />
                      Default
                    </span>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!key.isDefault && (
                      <>
                        <DropdownMenuItem onClick={() => onSetDefault(key.id)}>
                          <Check className="mr-2 h-4 w-4" />
                          Set as default
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => setDeleteId(key.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Added {new Date(key.createdAt).toLocaleDateString()}
                {key.hasKey ? " • Key stored securely" : " • No key stored"}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the API
              key from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
