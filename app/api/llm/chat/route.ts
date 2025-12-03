import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createLLMClient, getProviderFromModel } from "@/lib/llm/client";
import { streamToReadable } from "@/lib/llm/streaming";
import { decryptApiKey } from "@/lib/crypto/api-keys";
import { getApiKey } from "@/lib/db/queries/api-keys";
import type { Provider, Message } from "@/lib/llm/types";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      provider: providedProvider,
      model,
      messages,
      stream = true,
      temperature,
      maxTokens,
    } = body as {
      provider?: Provider;
      model: string;
      messages: Message[];
      stream?: boolean;
      temperature?: number;
      maxTokens?: number;
    };

    if (!model || !messages || !Array.isArray(messages)) {
      return new Response("Invalid request: model and messages are required", {
        status: 400,
      });
    }

    // Determine provider from model if not specified
    const provider = providedProvider || getProviderFromModel(model);

    // Get and decrypt API key
    const apiKeyRecord = await getApiKey(userId, provider);
    if (!apiKeyRecord) {
      return new Response(`No API key configured for provider: ${provider}`, {
        status: 400,
      });
    }

    const decryptedKey = await decryptApiKey(apiKeyRecord.encrypted_key, userId);

    // Create LLM client
    const client = createLLMClient(provider, {
      apiKey: decryptedKey,
      baseUrl: apiKeyRecord.endpoint_url || undefined,
    });

    const request = {
      model,
      messages,
      temperature,
      maxTokens,
      stream,
    };

    if (stream) {
      // Streaming response
      const generator = client.streamChat(request);
      const readable = streamToReadable(generator);

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Non-streaming response
      const response = await client.chat(request);
      return Response.json(response);
    }
  } catch (error) {
    console.error("LLM API error:", error);
    return new Response(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
}
