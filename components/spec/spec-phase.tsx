"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, FileText, ArrowRight } from "lucide-react";
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
import { MarkdownPreview } from "./markdown-preview";
import { useChat } from "@/hooks/use-chat";
import { useSpecConfig } from "@/hooks/use-spec-config";
import { getFullSpecPrompt } from "@/prompts/spec-phase";

interface SpecPhaseProps {
  projectId: string;
  projectName: string;
  projectRequest?: string;
}

export function SpecPhase({
  projectId,
  projectName,
  projectRequest,
}: SpecPhaseProps) {
  const router = useRouter();
  const { config, getEnabledSections } = useSpecConfig(projectId);
  const [generatedSpec, setGeneratedSpec] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"chat" | "preview">("chat");

  const systemPrompt = projectRequest
    ? getFullSpecPrompt(projectRequest, getEnabledSections(), config.customInstructions)
    : undefined;

  const { messages, streamingMessage, isLoading, error, sendMessage, stop } =
    useChat({
      projectId,
      phase: "spec",
      systemPrompt,
      onMessage: (message) => {
        if (message.role === "assistant") {
          setGeneratedSpec(message.content);
        }
      },
    });

  function handleGenerate() {
    if (!projectRequest) {
      router.push(`/projects/${projectId}/request`);
      return;
    }
    sendMessage("Generate the complete specification document.");
  }

  function handleProceedToPlan() {
    router.push(`/projects/${projectId}/plan`);
  }

  const hasSpec = generatedSpec.length > 0;

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "preview")}>
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="preview" disabled={!hasSpec}>
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/projects/${projectId}/spec/configure`)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
          {hasSpec && (
            <Button size="sm" onClick={handleProceedToPlan}>
              Proceed to Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" ? (
          !projectRequest ? (
            <div className="h-full flex items-center justify-center">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle>No Request Found</CardTitle>
                  <CardDescription>
                    You need to complete the Request phase before generating a
                    specification.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => router.push(`/projects/${projectId}/request`)}
                    className="w-full"
                  >
                    Go to Request Phase
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : messages.length === 0 && !streamingMessage ? (
            <div className="h-full flex items-center justify-center">
              <Card className="max-w-md">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Generate Specification</CardTitle>
                  <CardDescription>
                    Ready to generate your technical specification based on your
                    project request.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <strong>{getEnabledSections().length}</strong> sections will
                    be generated
                  </div>
                  <Button onClick={handleGenerate} className="w-full">
                    Generate Specification
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
              phase="spec"
              projectName={projectName}
              onSend={sendMessage}
              onStop={stop}
              placeholder="Ask questions about the specification or request changes..."
            />
          )
        ) : (
          <div className="h-full p-4 overflow-auto">
            <MarkdownPreview
              content={generatedSpec}
              editable
              onChange={setGeneratedSpec}
            />
          </div>
        )}
      </div>
    </div>
  );
}
