"use client";

import { useState, useCallback } from "react";
import {
  analyzeCoherence,
  smoothContent,
  smoothContentStream,
  type CoherenceAnalysis,
} from "@/lib/llm/coherence";

type CoherenceMode = "highlight" | "smooth";

interface UseCoherenceCheckReturn {
  // State
  isAnalyzing: boolean;
  isSmoothing: boolean;
  analysis: CoherenceAnalysis | null;
  smoothedContent: string;
  error: string | null;

  // Actions
  analyze: (content: string) => Promise<void>;
  smooth: (content: string, streaming?: boolean) => Promise<void>;
  reset: () => void;
}

export function useCoherenceCheck(
  apiEndpoint: string = "/api/chat"
): UseCoherenceCheckReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSmoothing, setIsSmoothing] = useState(false);
  const [analysis, setAnalysis] = useState<CoherenceAnalysis | null>(null);
  const [smoothedContent, setSmoothedContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (content: string) => {
      setIsAnalyzing(true);
      setError(null);

      try {
        const result = await analyzeCoherence(content, apiEndpoint);
        if (result.success && result.analysis) {
          setAnalysis(result.analysis);
        } else {
          setError(result.error || "Analysis failed");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsAnalyzing(false);
      }
    },
    [apiEndpoint]
  );

  const smooth = useCallback(
    async (content: string, streaming: boolean = true) => {
      setIsSmoothing(true);
      setError(null);
      setSmoothedContent("");

      try {
        if (streaming) {
          for await (const chunk of smoothContentStream(content, apiEndpoint)) {
            setSmoothedContent((prev) => prev + chunk);
          }
        } else {
          const result = await smoothContent(content, apiEndpoint);
          if (result.success && result.smoothedContent) {
            setSmoothedContent(result.smoothedContent);
          } else {
            setError(result.error || "Smoothing failed");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsSmoothing(false);
      }
    },
    [apiEndpoint]
  );

  const reset = useCallback(() => {
    setAnalysis(null);
    setSmoothedContent("");
    setError(null);
  }, []);

  return {
    isAnalyzing,
    isSmoothing,
    analysis,
    smoothedContent,
    error,
    analyze,
    smooth,
    reset,
  };
}
