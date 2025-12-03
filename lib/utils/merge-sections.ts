import type { CherryPickedSection } from "@/types/comparison";

export interface MergeOptions {
  addSeparators?: boolean;
  separator?: string;
  includeSourceMarkers?: boolean;
}

// Merge cherry-picked sections into a single document
export function mergeSections(
  sections: CherryPickedSection[],
  options: MergeOptions = {}
): string {
  const {
    addSeparators = false,
    separator = "\n\n---\n\n",
    includeSourceMarkers = false,
  } = options;

  if (sections.length === 0) {
    return "";
  }

  const parts = sections.map((section) => {
    let content = section.content.trim();

    if (includeSourceMarkers) {
      content = `<!-- Source: ${section.modelId} -->\n${content}`;
    }

    return content;
  });

  return addSeparators ? parts.join(separator) : parts.join("\n\n");
}

// Validate merged sections for potential issues
export function validateMerge(sections: CherryPickedSection[]): string[] {
  const issues: string[] = [];

  if (sections.length === 0) {
    issues.push("No sections selected");
    return issues;
  }

  // Check for potential duplicates
  const contentHashes = new Set<string>();
  sections.forEach((section) => {
    const hash = section.content.slice(0, 100); // Simple hash based on start
    if (contentHashes.has(hash)) {
      issues.push(`Potential duplicate content detected`);
    }
    contentHashes.add(hash);
  });

  // Check for conflicting information (basic heuristic)
  const modelIds = new Set(sections.map((s) => s.modelId));
  if (modelIds.size > 1) {
    issues.push(
      `Content from ${modelIds.size} different models may have inconsistencies`
    );
  }

  return issues;
}

// Generate diff preview between two versions
export function generateDiffPreview(
  original: string,
  merged: string
): { added: number; removed: number; preview: string } {
  const originalLines = original.split("\n");
  const mergedLines = merged.split("\n");

  const added = mergedLines.length - originalLines.length;
  const removed = Math.max(0, originalLines.length - mergedLines.length);

  // Simple preview showing first differences
  const preview =
    merged.length > 500 ? merged.slice(0, 500) + "..." : merged;

  return { added, removed, preview };
}
