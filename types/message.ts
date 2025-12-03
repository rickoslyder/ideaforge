export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  projectId: string;
  phase: "request" | "spec" | "plan";
  role: MessageRole;
  content: string;
  createdAt: string;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  model?: string;
  provider?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  latencyMs?: number;
  error?: string;
}

export interface StreamingMessage {
  id: string;
  role: "assistant";
  content: string;
  isStreaming: boolean;
}

export interface ChatState {
  messages: Message[];
  streamingMessage: StreamingMessage | null;
  isLoading: boolean;
  error: string | null;
}
