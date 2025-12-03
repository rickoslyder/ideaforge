export type DetailLevel = "brief" | "standard" | "comprehensive";

export const DETAIL_LEVEL_LABELS: Record<DetailLevel, string> = {
  brief: "Brief",
  standard: "Standard",
  comprehensive: "Comprehensive",
};

export const DETAIL_LEVEL_DESCRIPTIONS: Record<DetailLevel, string> = {
  brief: "High-level overview, 1-2 paragraphs",
  standard: "Moderate detail with key points",
  comprehensive: "In-depth coverage with examples",
};

export interface SpecSection {
  id: string;
  name: string;
  description: string;
  prompt: string;
  required: boolean;
  order: number;
  enabled: boolean;
  detailLevel: DetailLevel;
  includeCodeExamples: boolean;
}

export interface SpecConfig {
  sections: SpecSection[];
  customInstructions?: string;
}

export interface GeneratedSpec {
  id: string;
  projectId: string;
  sections: GeneratedSection[];
  fullContent: string;
  createdAt: string;
  version: number;
}

export interface GeneratedSection {
  id: string;
  sectionId: string;
  name: string;
  content: string;
  status: "pending" | "generating" | "completed" | "error";
  error?: string;
}
