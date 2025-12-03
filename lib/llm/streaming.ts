import type { StreamChunk } from "./types";

// Server-Sent Events (SSE) parser for streaming responses

export function parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<string> {
  const decoder = new TextDecoder();

  return (async function* () {
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const data = trimmed.slice(6);
          if (data !== "[DONE]") {
            yield data;
          }
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (trimmed.startsWith("data: ")) {
        const data = trimmed.slice(6);
        if (data !== "[DONE]") {
          yield data;
        }
      }
    }
  })();
}

// Create a ReadableStream from an async generator
export function streamToReadable(
  generator: AsyncGenerator<StreamChunk>
): ReadableStream {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await generator.next();
      if (done) {
        controller.close();
      } else {
        const data = JSON.stringify(value);
        controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
      }
    },
  });
}

// Parse a ReadableStream into StreamChunks (client-side)
export async function* parseStreamResponse(
  response: Response
): AsyncGenerator<StreamChunk> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data: ")) {
        const data = trimmed.slice(6);
        if (data && data !== "[DONE]") {
          try {
            yield JSON.parse(data) as StreamChunk;
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}

// Utility to accumulate stream chunks into a single response
export async function accumulateStream(
  generator: AsyncGenerator<StreamChunk>
): Promise<{ content: string; inputTokens?: number; outputTokens?: number }> {
  let content = "";
  let inputTokens: number | undefined;
  let outputTokens: number | undefined;

  for await (const chunk of generator) {
    content += chunk.content;
    if (chunk.inputTokens !== undefined) inputTokens = chunk.inputTokens;
    if (chunk.outputTokens !== undefined) outputTokens = chunk.outputTokens;
  }

  return { content, inputTokens, outputTokens };
}
