export function getPlanPhaseSystemPrompt(
  request: string,
  specification: string
): string {
  return `You are a senior software architect creating an actionable implementation plan.

Based on the project request and specification below, create a detailed step-by-step implementation plan that a development team can follow.

PROJECT REQUEST:
${request}

SPECIFICATION:
${specification}

Guidelines:
- Break down the project into logical, sequential steps
- Each step should be independently completable
- Include specific tasks within each step
- Consider dependencies between steps
- Prioritize core functionality before enhancements
- Include setup, development, testing, and deployment phases
- Be specific about technologies and approaches to use
- Each task should be actionable and clear

Output Format:
Generate the plan in this JSON format wrapped in a markdown code block:

\`\`\`json
{
  "summary": "Brief overview of the implementation approach",
  "steps": [
    {
      "title": "Step title",
      "description": "Detailed description of what this step accomplishes",
      "category": "setup|backend|frontend|database|integration|testing|deployment|documentation",
      "tasks": [
        "Specific task 1",
        "Specific task 2"
      ],
      "dependencies": ["Step title of dependency if any"]
    }
  ]
}
\`\`\`

Create a comprehensive plan with 8-15 steps that covers the entire project lifecycle.`;
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
