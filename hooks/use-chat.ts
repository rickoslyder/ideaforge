"use client";

import { useState, useCallback, useRef } from "react";
import { nanoid } from "nanoid";
import type { Message, StreamingMessage, ChatState } from "@/types/message";
import type { Provider } from "@/lib/llm/types";
import { parseSSEStreamChunks } from "@/lib/llm/streaming";

interface UseChatOptions {
  projectId: string;
  phase: "request" | "spec" | "plan";
  model?: string;
  provider?: Provider;
  systemPrompt?: string;
  onMessage?: (message: Message) => void;
  onError?: (error: Error) => void;
}

interface UseChatReturn extends ChatState {
  sendMessage: (content: string) => Promise<void>;
  stop: () => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;
}

export function useChat({
  projectId,
  phase,
  model,
  provider,
  systemPrompt,
  onMessage,
  onError,
}: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] =
    useState<StreamingMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setStreamingMessage(null);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setError(null);
      setIsLoading(true);

      // Create user message
      const userMessage: Message = {
        id: nanoid(),
        projectId,
        phase,
        role: "user",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // Initialize streaming message
      const streamingId = nanoid();
      setStreamingMessage({
        id: streamingId,
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      try {
        // Build messages array for API
        const apiMessages = [
          ...(systemPrompt
            ? [{ role: "system" as const, content: systemPrompt }]
            : []),
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content: content.trim() },
        ];

        const response = await fetch("/api/llm/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            model,
            provider,
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `HTTP ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        // Parse SSE stream
        let fullContent = "";
        const startTime = Date.now();

        for await (const chunk of parseSSEStreamChunks(response.body)) {
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }

          if (chunk.type === "content") {
            fullContent += chunk.content;
            setStreamingMessage({
              id: streamingId,
              role: "assistant",
              content: fullContent,
              isStreaming: true,
            });
          } else if (chunk.type === "error") {
            throw new Error(chunk.error);
          }
        }

        // Create final assistant message
        const assistantMessage: Message = {
          id: streamingId,
          projectId,
          phase,
          role: "assistant",
          content: fullContent,
          createdAt: new Date().toISOString(),
          metadata: {
            model,
            provider,
            latencyMs: Date.now() - startTime,
          },
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingMessage(null);
        onMessage?.(assistantMessage);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Request was cancelled, finalize streaming message if any content
          if (streamingMessage?.content) {
            const partialMessage: Message = {
              id: streamingId,
              projectId,
              phase,
              role: "assistant",
              content: streamingMessage.content,
              createdAt: new Date().toISOString(),
              metadata: { model, provider },
            };
            setMessages((prev) => [...prev, partialMessage]);
          }
        } else {
          const errorMessage =
            err instanceof Error ? err.message : "An error occurred";
          setError(errorMessage);
          onError?.(err instanceof Error ? err : new Error(errorMessage));
        }
        setStreamingMessage(null);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [
      projectId,
      phase,
      model,
      provider,
      systemPrompt,
      messages,
      streamingMessage,
      onMessage,
      onError,
    ]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingMessage(null);
    setError(null);
  }, []);

  return {
    messages,
    streamingMessage,
    isLoading,
    error,
    sendMessage,
    stop,
    clearMessages,
    setMessages,
  };
}
