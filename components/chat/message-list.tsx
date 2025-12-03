"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import type { Message, StreamingMessage } from "@/types/message";

interface MessageListProps {
  messages: Message[];
  streamingMessage: StreamingMessage | null;
}

export function MessageList({ messages, streamingMessage }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingMessage?.content]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="divide-y divide-border">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {streamingMessage && (
          <MessageBubble
            message={streamingMessage}
            isStreaming={streamingMessage.isStreaming}
          />
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
