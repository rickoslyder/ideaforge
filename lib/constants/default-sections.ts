import type { SpecSection } from "@/types/spec";
import { nanoid } from "nanoid";

export const DEFAULT_SPEC_SECTIONS: SpecSection[] = [
  {
    id: nanoid(),
    name: "Executive Summary",
    description: "High-level overview of the project and its goals",
    prompt:
      "Write a concise executive summary that captures the essence of this project, its purpose, and expected outcomes.",
    required: true,
    order: 0,
    enabled: true,
  },
  {
    id: nanoid(),
    name: "Problem Statement",
    description: "Detailed description of the problem being solved",
    prompt:
      "Describe the problem this project aims to solve. Include the current pain points, who is affected, and why solving this matters.",
    required: true,
    order: 1,
    enabled: true,
  },
  {
    id: nanoid(),
    name: "Proposed Solution",
    description: "Overview of how the project will solve the problem",
    prompt:
      "Describe the proposed solution at a high level. How will it address the problem? What is the core approach?",
    required: true,
    order: 2,
    enabled: true,
  },
  {
    id: nanoid(),
    name: "User Stories",
    description: "User-centered requirements as stories",
    prompt:
      "Write user stories in the format: 'As a [type of user], I want [goal] so that [benefit]'. Cover all key user interactions.",
    required: false,
    order: 3,
    enabled: true,
  },
  {
    id: nanoid(),
    name: "Functional Requirements",
    description: "Detailed list of what the system must do",
    prompt:
      "List the functional requirements. What features and capabilities must the system have? Be specific and comprehensive.",
    required: true,
    order: 4,
    enabled: true,
  },
  {
    id: nanoid(),
    name: "Non-Functional Requirements",
    description: "Performance, security, scalability requirements",
    prompt:
      "Describe the non-functional requirements including performance expectations, security requirements, scalability needs, and any constraints.",
    required: false,
    order: 5,
    enabled: true,
  },
  {
    id: nanoid(),
    name: "Technical Architecture",
    description: "System architecture and technology choices",
    prompt:
      "Describe the technical architecture. Include system components, technology stack recommendations, and how components interact.",
    required: true,
    order: 6,
    enabled: true,
  },
  {
    id: nanoid(),
    name: "Data Model",
    description: "Database schema and data relationships",
    prompt:
      "Define the data model. What entities exist? What are their relationships? Include field descriptions for key entities.",
    required: false,
    order: 7,
    enabled: true,
  },
  {
    id: nanoid(),
    name: "API Specification",
    description: "API endpoints and contracts",
    prompt:
      "Define the API specification. List endpoints, methods, request/response formats, and authentication requirements.",
    required: false,
    order: 8,
    enabled: true,
  },
  {
    id: nanoid(),
    name: "UI/UX Guidelines",
    description: "User interface and experience requirements",
    prompt:
      "Describe the UI/UX requirements. Include key screens, user flows, accessibility requirements, and design principles.",
    required: false,
    order: 9,
    enabled: true,
  },
  {
    id: nanoid(),
    name: "Testing Strategy",
    description: "Approach to testing and quality assurance",
    prompt:
      "Define the testing strategy. What types of tests are needed? What are the quality metrics? Include test coverage goals.",
    required: false,
    order: 10,
    enabled: false,
  },
  {
    id: nanoid(),
    name: "Deployment Plan",
    description: "How the system will be deployed and maintained",
    prompt:
      "Describe the deployment plan. Include environments, CI/CD requirements, monitoring needs, and maintenance considerations.",
    required: false,
    order: 11,
    enabled: false,
  },
  {
    id: nanoid(),
    name: "Risk Assessment",
    description: "Potential risks and mitigation strategies",
    prompt:
      "Identify potential risks and challenges. For each risk, describe its likelihood, impact, and mitigation strategy.",
    required: false,
    order: 12,
    enabled: false,
  },
  {
    id: nanoid(),
    name: "Success Metrics",
    description: "How success will be measured",
    prompt:
      "Define the success metrics. What KPIs will indicate the project is successful? How will they be measured?",
    required: false,
    order: 13,
    enabled: true,
  },
];

export function createDefaultSpecConfig() {
  return {
    sections: DEFAULT_SPEC_SECTIONS.map((s) => ({ ...s, id: nanoid() })),
    customInstructions: "",
  };
}
