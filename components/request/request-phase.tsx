"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import { RequestPreview } from "./request-preview";
import { useChat } from "@/hooks/use-chat";
import { useProject } from "@/hooks/use-project";
import { getRequestPhasePrompt } from "@/prompts/request-phase";
import { extractRequest, hasRequestBlock } from "@/lib/parsers/request-block";
import { toast } from "@/hooks/use-toast";

interface RequestPhaseProps {
  projectId: string;
  projectName: string;
  projectDescription?: string;
}

export function RequestPhase({
  projectId,
  projectName,
  projectDescription,
}: RequestPhaseProps) {
  const router = useRouter();
  const { advanceToPhase } = useProject(projectId);
  const [extractedRequest, setExtractedRequest] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const systemPrompt = getRequestPhasePrompt(projectDescription);

  const {
    messages,
    streamingMessage,
    isLoading,
    error,
    sendMessage,
    stop,
  } = useChat({
    projectId,
    phase: "request",
    systemPrompt,
    onMessage: (message) => {
      // Check if the response contains a finalized request
      if (message.role === "assistant" && hasRequestBlock(message.content)) {
        const request = extractRequest(message.content);
        if (request) {
          setExtractedRequest(request);
          setShowPreview(true);
        }
      }
    },
  });

  // Auto-send initial message if project has description
  useEffect(() => {
    if (projectDescription && messages.length === 0 && !isLoading) {
      sendMessage(projectDescription);
    }
  }, [projectDescription, messages.length, isLoading, sendMessage]);

  async function handleConfirmRequest(finalRequest: string) {
    setIsSaving(true);
    try {
      // Save the finalized request and advance to spec phase
      await advanceToPhase("spec", finalRequest);
      toast({
        title: "Request confirmed",
        description: "Moving to specification phase",
      });
      router.push(`/projects/${projectId}/spec`);
    } catch (error) {
      console.error("Failed to save request:", error);
      toast({
        title: "Error saving request",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancelPreview() {
    setShowPreview(false);
    setExtractedRequest(null);
  }

  if (showPreview && extractedRequest) {
    return (
      <div className="h-full p-4">
        <RequestPreview
          content={extractedRequest}
          onConfirm={handleConfirmRequest}
          onCancel={handleCancelPreview}
        />
      </div>
    );
  }

  return (
    <ChatInterface
      messages={messages}
      streamingMessage={streamingMessage}
      isLoading={isLoading}
      error={error}
      phase="request"
      projectName={projectName}
      onSend={sendMessage}
      onStop={stop}
      placeholder="Describe your project idea..."
    />
  );
}
