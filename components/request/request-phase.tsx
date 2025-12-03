"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import { RequestPreview } from "./request-preview";
import { useChat } from "@/hooks/use-chat";
import { getRequestPhasePrompt } from "@/prompts/request-phase";
import { extractRequest, hasRequestBlock } from "@/lib/parsers/request-block";

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
  const [extractedRequest, setExtractedRequest] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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

  function handleConfirmRequest(finalRequest: string) {
    // Save the finalized request and proceed to spec phase
    // TODO: Save to database
    console.log("Finalized request:", finalRequest);
    router.push(`/projects/${projectId}/spec`);
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
