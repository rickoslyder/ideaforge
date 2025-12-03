"use client";

import { memo } from "react";
import { User, Bot, Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import type { Message, StreamingMessage } from "@/types/message";

interface MessageBubbleProps {
  message: Message | StreamingMessage;
  isStreaming?: boolean;
}

function MessageBubbleComponent({ message, isStreaming }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  async function copyToClipboard() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={cn(
        "group flex gap-3 px-4 py-6",
        isUser ? "bg-background" : "bg-muted/50"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isUser ? "You" : "Assistant"}
          </span>
          {"metadata" in message && message.metadata?.model && (
            <span className="text-xs text-muted-foreground">
              {message.metadata.model}
            </span>
          )}
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap break-words">
            {message.content}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-foreground animate-pulse" />
            )}
          </p>
        </div>

        {"metadata" in message && message.metadata?.totalTokens && (
          <div className="text-xs text-muted-foreground">
            {message.metadata.totalTokens} tokens
            {message.metadata.latencyMs && (
              <> • {(message.metadata.latencyMs / 1000).toFixed(2)}s</>
            )}
          </div>
        )}
      </div>

      {!isUser && !isStreaming && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}

export const MessageBubble = memo(MessageBubbleComponent);
