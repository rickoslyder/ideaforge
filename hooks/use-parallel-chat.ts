"use client";

import { useCallback, useRef } from "react";
import { useComparisonStore } from "@/stores/comparison-store";
import type { SelectedModel } from "@/types/comparison";

interface ParallelChatOptions {
  onError?: (modelId: string, error: string) => void;
  onComplete?: (modelId: string) => void;
}

export function useParallelChat(options: ParallelChatOptions = {}) {
  const { selectedModels, updateColumn, clearColumns } = useComparisonStore();
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const startParallelStreams = useCallback(
    async (
      prompt: string,
      systemPrompt?: string,
      apiEndpoint: string = "/api/chat"
    ) => {
      // Clear previous content
      clearColumns();

      // Abort any existing streams
      abortControllersRef.current.forEach((controller) => controller.abort());
      abortControllersRef.current.clear();

      // Start streaming for each selected model
      const streamPromises = selectedModels.map(async (model) => {
        const controller = new AbortController();
        abortControllersRef.current.set(model.id, controller);

        // Mark as streaming
        updateColumn(model.id, { isStreaming: true, error: undefined });

        try {
          const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: model.model,
              provider: model.provider,
              messages: [
                ...(systemPrompt
                  ? [{ role: "system", content: systemPrompt }]
                  : []),
                { role: "user", content: prompt },
              ],
              stream: true,
            }),
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("No response body");
          }

          const decoder = new TextDecoder();
          let buffer = "";
          let fullContent = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    fullContent += parsed.content;
                    updateColumn(model.id, { content: fullContent });
                  }
                  if (parsed.error) {
                    throw new Error(parsed.error);
                  }
                  if (parsed.inputTokens || parsed.outputTokens) {
                    updateColumn(model.id, {
                      inputTokens: parsed.inputTokens,
                      outputTokens: parsed.outputTokens,
                    });
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }

          updateColumn(model.id, { isStreaming: false });
          options.onComplete?.(model.id);
        } catch (error) {
          if ((error as Error).name === "AbortError") {
            updateColumn(model.id, { isStreaming: false });
            return;
          }

          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          updateColumn(model.id, { isStreaming: false, error: errorMessage });
          options.onError?.(model.id, errorMessage);
        } finally {
          abortControllersRef.current.delete(model.id);
        }
      });

      await Promise.allSettled(streamPromises);
    },
    [selectedModels, updateColumn, clearColumns, options]
  );

  const stopAllStreams = useCallback(() => {
    abortControllersRef.current.forEach((controller) => controller.abort());
    abortControllersRef.current.clear();
    selectedModels.forEach((model) => {
      updateColumn(model.id, { isStreaming: false });
    });
  }, [selectedModels, updateColumn]);

  const stopStream = useCallback(
    (modelId: string) => {
      const controller = abortControllersRef.current.get(modelId);
      if (controller) {
        controller.abort();
        abortControllersRef.current.delete(modelId);
        updateColumn(modelId, { isStreaming: false });
      }
    },
    [updateColumn]
  );

  return {
    startParallelStreams,
    stopAllStreams,
    stopStream,
  };
}
