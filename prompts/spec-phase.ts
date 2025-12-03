import type { SpecSection } from "@/types/spec";

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
  return `Generate the "${section.name}" section for this specification.

${section.prompt}

Format the output as a markdown section with the heading "## ${section.name}" followed by well-structured content. Use subheadings, lists, code blocks, and tables where appropriate to make the content clear and actionable.`;
}

export function getFullSpecPrompt(
  request: string,
  sections: SpecSection[],
  customInstructions?: string
): string {
  const sectionsList = sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order)
    .map((s) => `- ${s.name}: ${s.prompt}`)
    .join("\n");

  return `You are a senior technical architect. Create a comprehensive software specification document based on the project request below.

PROJECT REQUEST:
${request}

REQUIRED SECTIONS:
${sectionsList}

${customInstructions ? `ADDITIONAL INSTRUCTIONS:\n${customInstructions}\n` : ""}

Generate the complete specification document in markdown format. Each section should be thorough, specific to this project, and actionable. Use proper markdown formatting including:
- H2 headers (##) for each main section
- H3 headers (###) for subsections as needed
- Bullet points and numbered lists
- Code blocks with language specifiers when showing examples
- Tables where appropriate

Begin the document with a title "# Software Specification" and include all requested sections in the order listed.`;
}
