"use client";

import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { EmptyChat } from "./empty-chat";
import { ModelSelector } from "./model-selector";
import type { Message, StreamingMessage } from "@/types/message";

interface ChatInterfaceProps {
  messages: Message[];
  streamingMessage: StreamingMessage | null;
  isLoading: boolean;
  error: string | null;
  phase: "request" | "spec" | "plan";
  projectName?: string;
  onSend: (message: string) => void;
  onStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
  showModelSelector?: boolean;
}

export function ChatInterface({
  messages,
  streamingMessage,
  isLoading,
  error,
  phase,
  projectName,
  onSend,
  onStop,
  placeholder,
  disabled,
  showModelSelector = true,
}: ChatInterfaceProps) {
  const hasMessages = messages.length > 0 || streamingMessage;

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {hasMessages ? (
        <MessageList messages={messages} streamingMessage={streamingMessage} />
      ) : (
        <EmptyChat phase={phase} projectName={projectName} />
      )}

      <div className="border-t">
        {showModelSelector && (
          <div className="px-4 pt-2">
            <ModelSelector phase={phase} disabled={isLoading} />
          </div>
        )}
        <ChatInput
          onSend={onSend}
          onStop={onStop}
          isLoading={isLoading}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
