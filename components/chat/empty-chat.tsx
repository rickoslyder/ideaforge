"use client";

import { MessageSquare, Lightbulb, FileText, ListChecks } from "lucide-react";

interface EmptyChatProps {
  phase: "request" | "spec" | "plan";
  projectName?: string;
}

const phaseContent = {
  request: {
    icon: MessageSquare,
    title: "Start Your Request",
    description:
      "Describe your idea or project in natural language. The AI will help you clarify and refine your requirements.",
    suggestions: [
      "I want to build a mobile app that...",
      "I need a web application for...",
      "Can you help me design a system that...",
      "I'm thinking of creating a tool to...",
    ],
  },
  spec: {
    icon: FileText,
    title: "Generate Specification",
    description:
      "Based on your request, the AI will generate a detailed technical specification for your project.",
    suggestions: [
      "Generate the full specification",
      "Focus on the technical architecture",
      "Include user stories and acceptance criteria",
      "Add API documentation section",
    ],
  },
  plan: {
    icon: ListChecks,
    title: "Create Implementation Plan",
    description:
      "Transform your specification into an actionable step-by-step implementation plan.",
    suggestions: [
      "Create a detailed implementation plan",
      "Break down into weekly milestones",
      "Prioritize the core features first",
      "Include testing and deployment steps",
    ],
  },
};

export function EmptyChat({ phase, projectName }: EmptyChatProps) {
  const content = phaseContent[phase];
  const Icon = content.icon;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
        <Icon className="h-8 w-8 text-primary" />
      </div>

      <h2 className="text-2xl font-semibold mb-2">{content.title}</h2>

      {projectName && (
        <p className="text-lg text-muted-foreground mb-2">for {projectName}</p>
      )}

      <p className="text-muted-foreground max-w-md mb-8">
        {content.description}
      </p>

      <div className="w-full max-w-lg">
        <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Try saying:
        </p>
        <div className="grid gap-2">
          {content.suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="text-left px-4 py-3 rounded-lg border bg-card hover:bg-muted transition-colors text-sm"
            >
              "{suggestion}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
