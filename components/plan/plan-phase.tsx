"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, MessageSquare, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChatInterface } from "@/components/chat/chat-interface";
import { PlanStepList } from "./plan-step-list";
import { useChat } from "@/hooks/use-chat";
import { getPlanPhaseSystemPrompt } from "@/prompts/plan-phase";
import { parsePlan } from "@/lib/parsers/plan-steps";
import type { PlanStep } from "@/types/plan";

interface PlanPhaseProps {
  projectId: string;
  projectName: string;
  projectRequest?: string;
  projectSpec?: string;
}

export function PlanPhase({
  projectId,
  projectName,
  projectRequest,
  projectSpec,
}: PlanPhaseProps) {
  const router = useRouter();
  const [steps, setSteps] = useState<PlanStep[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "plan">("chat");
  const [copied, setCopied] = useState(false);

  const systemPrompt =
    projectRequest && projectSpec
      ? getPlanPhaseSystemPrompt(projectRequest, projectSpec)
      : undefined;

  const { messages, streamingMessage, isLoading, error, sendMessage, stop } =
    useChat({
      projectId,
      phase: "plan",
      systemPrompt,
      onMessage: (message) => {
        if (message.role === "assistant") {
          const parsedSteps = parsePlan(message.content);
          if (parsedSteps.length > 0) {
            setSteps(parsedSteps);
            setActiveTab("plan");
          }
        }
      },
    });

  function handleGenerate() {
    if (!projectRequest || !projectSpec) {
      router.push(`/projects/${projectId}/spec`);
      return;
    }
    sendMessage("Generate the implementation plan.");
  }

  function handleTaskToggle(
    stepId: string,
    taskId: string,
    completed: boolean
  ) {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? {
              ...step,
              tasks: step.tasks.map((task) =>
                task.id === taskId ? { ...task, completed } : task
              ),
            }
          : step
      )
    );
  }

  async function handleCopy() {
    const planText = steps
      .map(
        (step, index) =>
          `## Step ${index + 1}: ${step.title}\n\n${step.description}\n\n${step.tasks
            .map((t) => `- [${t.completed ? "x" : " "}] ${t.title}`)
            .join("\n")}`
      )
      .join("\n\n---\n\n");

    await navigator.clipboard.writeText(planText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const planText = `# Implementation Plan: ${projectName}\n\n${steps
      .map(
        (step, index) =>
          `## Step ${index + 1}: ${step.title}\n\n${step.description}\n\n### Tasks\n${step.tasks
            .map((t) => `- [${t.completed ? "x" : " "}] ${t.title}`)
            .join("\n")}`
      )
      .join("\n\n---\n\n")}`;

    const blob = new Blob([planText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-plan.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const hasPlan = steps.length > 0;
  const hasPrerequisites = projectRequest && projectSpec;

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "chat" | "plan")}
          >
            <TabsList>
              <TabsTrigger value="chat">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="plan" disabled={!hasPlan}>
                <ListChecks className="mr-2 h-4 w-4" />
                Plan
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {hasPlan && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" ? (
          !hasPrerequisites ? (
            <div className="h-full flex items-center justify-center">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle>Prerequisites Missing</CardTitle>
                  <CardDescription>
                    You need to complete the Request and Spec phases before
                    generating an implementation plan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {!projectRequest && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        router.push(`/projects/${projectId}/request`)
                      }
                    >
                      Go to Request Phase
                    </Button>
                  )}
                  {projectRequest && !projectSpec && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/projects/${projectId}/spec`)}
                    >
                      Go to Spec Phase
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : messages.length === 0 && !streamingMessage ? (
            <div className="h-full flex items-center justify-center">
              <Card className="max-w-md">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <ListChecks className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Generate Implementation Plan</CardTitle>
                  <CardDescription>
                    Transform your specification into an actionable step-by-step
                    implementation plan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleGenerate} className="w-full">
                    Generate Plan
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <ChatInterface
              messages={messages}
              streamingMessage={streamingMessage}
              isLoading={isLoading}
              error={error}
              phase="plan"
              projectName={projectName}
              onSend={sendMessage}
              onStop={stop}
              placeholder="Ask questions about the plan or request changes..."
            />
          )
        ) : (
          <div className="h-full p-4 overflow-auto">
            <PlanStepList steps={steps} onTaskToggle={handleTaskToggle} />
          </div>
        )}
      </div>
    </div>
  );
}
