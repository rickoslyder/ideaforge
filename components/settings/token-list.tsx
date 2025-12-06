"use client";

import { useState } from "react";
import { Trash2, Clock, AlertCircle, Copy, Check } from "lucide-react";
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
import type { TokenInfo } from "@/hooks/use-tokens";

interface TokenListProps {
  tokens: TokenInfo[];
  isLoading: boolean;
  onRevoke: (id: string) => Promise<void>;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeDate(dateString: string | null): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export function TokenList({ tokens, isLoading, onRevoke }: TokenListProps) {
  const [revoking, setRevoking] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading tokens...
        </CardContent>
      </Card>
    );
  }

  if (tokens.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No API tokens created yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a token to use the Quick Capture API or browser extension.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      await onRevoke(id);
    } finally {
      setRevoking(null);
      setConfirmDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {tokens.map((token) => {
          const expired = isExpired(token.expiresAt);
          return (
            <Card key={token.id} className={expired ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{token.name}</CardTitle>
                    {expired && (
                      <Badge variant="destructive" className="text-xs">
                        Expired
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setConfirmDelete(token.id)}
                    disabled={revoking === token.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="font-mono text-xs">
                  {token.tokenPrefix}...
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Created {formatDate(token.createdAt)}
                  </span>
                  {token.lastUsedAt && (
                    <span>Last used {formatRelativeDate(token.lastUsedAt)}</span>
                  )}
                  {token.expiresAt && !expired && (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Expires {formatDate(token.expiresAt)}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Token?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately revoke the token. Any applications using it
              will no longer be able to access the API. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && handleRevoke(confirmDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revoke Token
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface TokenDisplayProps {
  token: string;
  onDone: () => void;
}

export function TokenDisplay({ token, onDone }: TokenDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-green-500/50 bg-green-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-green-600 dark:text-green-400">
          <Check className="h-4 w-4" />
          Token Created Successfully
        </CardTitle>
        <CardDescription>
          Copy this token now. You won&apos;t be able to see it again!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <code className="flex-1 p-3 bg-muted rounded-md text-sm font-mono break-all">
            {token}
          </code>
          <Button variant="outline" size="icon" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button onClick={onDone} className="w-full">
          Done
        </Button>
      </CardContent>
    </Card>
  );
}
