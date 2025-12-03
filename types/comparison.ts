import type { Provider } from "@/lib/llm/types";

export interface SelectedModel {
  id: string;
  model: string;
  provider: Provider;
  displayName: string;
}

export interface ComparisonColumn {
  modelId: string;
  content: string;
  isStreaming: boolean;
  error?: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface CherryPickedSection {
  sectionId: string;
  modelId: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

export type ComparisonMode = "side-by-side" | "grid" | "sequential";

export interface MergedOutput {
  sections: CherryPickedSection[];
  fullContent: string;
  validated: boolean;
  coherenceIssues?: string[];
}
