export function getPlanPhaseSystemPrompt(
  request: string,
  specification: string
): string {
  return `You are a senior software architect creating an actionable implementation plan.

Based on the project request and specification below, create a step-by-step implementation plan.

PROJECT REQUEST:
${request}

SPECIFICATION:
${specification}

Guidelines:
- Break down into 8-12 logical, sequential steps
- Each step should be independently completable
- Keep tasks concise (5-8 tasks per step maximum)
- Focus on key deliverables, not granular implementation details
- Prioritize core functionality before enhancements

IMPORTANT: Keep the output concise to avoid truncation. Each task should be a short phrase (under 15 words).

Output Format:
\`\`\`json
{
  "summary": "1-2 sentence overview",
  "steps": [
    {
      "title": "Step title",
      "description": "Brief description (1-2 sentences)",
      "category": "setup|backend|frontend|database|integration|testing|deployment|documentation",
      "tasks": ["Task 1", "Task 2"],
      "dependencies": []
    }
  ]
}
\`\`\`

Generate 8-12 steps covering: setup, database, backend, frontend, integration, testing, and deployment.`;
}

export const PLAN_PHASE_INITIAL_MESSAGE = `I'll analyze your specification and create a detailed implementation plan. This plan will include:

1. **Setup & Configuration** - Project initialization and environment setup
2. **Core Development** - Main features and functionality
3. **Integration** - Connecting components and external services
4. **Testing** - Quality assurance and validation
5. **Deployment** - Release preparation and launch

Let me generate the complete implementation plan...`;

export function getPlanRefinementPrompt(feedback: string): string {
  return `Based on this feedback, please update the implementation plan:

${feedback}

Provide the updated plan in the same JSON format as before.`;
}
