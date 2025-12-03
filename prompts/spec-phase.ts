import type { SpecSection, DetailLevel } from "@/types/spec";

const DETAIL_LEVEL_INSTRUCTIONS: Record<DetailLevel, string> = {
  brief: "Keep this section concise with only essential information (1-2 paragraphs or a short list).",
  standard: "Provide moderate detail covering key points and considerations.",
  comprehensive: "Provide in-depth coverage with thorough explanations, multiple examples, and edge cases.",
};

export function getSpecPhaseSystemPrompt(
  request: string,
  customInstructions?: string
): string {
  return `You are a senior technical architect creating a detailed software specification document.

Based on the following project request, you will generate comprehensive specification sections.

PROJECT REQUEST:
${request}

${customInstructions ? `ADDITIONAL INSTRUCTIONS:\n${customInstructions}\n` : ""}

Guidelines:
- Be thorough and specific, not generic
- Include concrete examples where appropriate
- Use clear, professional technical writing
- Format output in clean markdown
- Consider edge cases and potential challenges
- Make technology recommendations when appropriate
- Ensure consistency across all sections`;
}

export function getSectionPrompt(section: SpecSection): string {
  const detailInstruction = DETAIL_LEVEL_INSTRUCTIONS[section.detailLevel];
  const codeInstruction = section.includeCodeExamples
    ? "Include relevant code examples, snippets, or pseudocode to illustrate key concepts."
    : "Do not include code examples in this section.";

  return `Generate the "${section.name}" section for this specification.

${section.prompt}

DETAIL LEVEL: ${section.detailLevel.toUpperCase()}
${detailInstruction}

CODE EXAMPLES: ${section.includeCodeExamples ? "YES" : "NO"}
${codeInstruction}

Format the output as a markdown section with the heading "## ${section.name}" followed by well-structured content. Use subheadings, lists, and tables where appropriate to make the content clear and actionable.`;
}

export function getFullSpecPrompt(
  request: string,
  sections: SpecSection[],
  customInstructions?: string
): string {
  const enabledSections = sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const sectionsList = enabledSections
    .map((s) => {
      const detailNote = `[${s.detailLevel}]`;
      const codeNote = s.includeCodeExamples ? "[with code]" : "";
      return `- ${s.name} ${detailNote}${codeNote}: ${s.prompt}`;
    })
    .join("\n");

  const detailGuidelines = `
DETAIL LEVEL GUIDELINES:
- BRIEF: Keep sections concise with only essential information (1-2 paragraphs or short lists)
- STANDARD: Provide moderate detail covering key points and considerations
- COMPREHENSIVE: Provide in-depth coverage with thorough explanations, examples, and edge cases`;

  return `You are a senior technical architect. Create a comprehensive software specification document based on the project request below.

PROJECT REQUEST:
${request}

REQUIRED SECTIONS:
${sectionsList}
${detailGuidelines}

${customInstructions ? `ADDITIONAL INSTRUCTIONS:\n${customInstructions}\n` : ""}

Generate the complete specification document in markdown format. Each section should:
1. Follow its specified detail level (brief/standard/comprehensive)
2. Include code examples only where marked [with code]
3. Be specific to this project and actionable

Use proper markdown formatting including:
- H2 headers (##) for each main section
- H3 headers (###) for subsections as needed
- Bullet points and numbered lists
- Code blocks with language specifiers when showing examples (only for sections marked [with code])
- Tables where appropriate

Begin the document with a title "# Software Specification" and include all requested sections in the order listed.`;
}
