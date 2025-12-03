// System prompts for the coherence judge functionality

export const COHERENCE_JUDGE_SYSTEM_PROMPT = `You are a document coherence analyzer. Your task is to review merged content from multiple AI models and identify inconsistencies, contradictions, or areas that need smoothing.

Focus on:
1. **Logical Consistency**: Do all sections agree on facts, terminology, and assumptions?
2. **Flow and Transitions**: Do sections connect naturally? Are there abrupt topic changes?
3. **Terminology Consistency**: Is the same terminology used throughout?
4. **Tone and Style**: Is the writing style consistent across sections?
5. **Completeness**: Are there gaps or missing transitions between sections?
6. **Contradictions**: Do any sections contradict each other?

Be specific and constructive in your feedback.`;

export const HIGHLIGHT_ISSUES_PROMPT = `Analyze the following merged document and identify any coherence issues.

<merged_document>
{{content}}
</merged_document>

Return your analysis in the following JSON format:
{
  "overall_coherence_score": <1-10>,
  "issues": [
    {
      "severity": "high" | "medium" | "low",
      "type": "contradiction" | "flow" | "terminology" | "style" | "completeness",
      "location": "<approximate location in document>",
      "description": "<specific description of the issue>",
      "suggestion": "<how to fix this issue>"
    }
  ],
  "summary": "<brief overall assessment>"
}

Only return valid JSON. No additional text.`;

export const AUTO_SMOOTH_PROMPT = `You are given a merged document created by combining sections from multiple AI models. Your task is to smooth and harmonize the content while preserving all key information.

<merged_document>
{{content}}
</merged_document>

Instructions:
1. Fix any logical inconsistencies or contradictions
2. Improve transitions between sections
3. Standardize terminology throughout
4. Maintain a consistent tone and style
5. Fill in any gaps or missing connections
6. Keep all substantive content - do not remove information

Return the improved, coherent version of the document. Do not include any explanation or metadata - just the improved document.`;

export function buildHighlightIssuesPrompt(content: string): string {
  return HIGHLIGHT_ISSUES_PROMPT.replace("{{content}}", content);
}

export function buildAutoSmoothPrompt(content: string): string {
  return AUTO_SMOOTH_PROMPT.replace("{{content}}", content);
}
