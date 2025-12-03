export interface SpecSection {
  id: string;
  name: string;
  description: string;
  prompt: string;
  required: boolean;
  order: number;
  enabled: boolean;
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
