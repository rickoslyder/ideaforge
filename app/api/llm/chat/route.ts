import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createLLMClient, getProviderFromModel } from "@/lib/llm/client";
import { streamToReadable } from "@/lib/llm/streaming";
import { decryptApiKey } from "@/lib/crypto/api-keys";
import { getApiKey, getApiKeys } from "@/lib/db/queries/api-keys";
import type { Provider, Message } from "@/lib/llm/types";
import { DEFAULT_MODELS } from "@/lib/llm/types";

// Ensure this runs on Node.js runtime (not Edge) for Clerk compatibility
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Debug endpoint to verify the route exists
export async function GET() {
  return Response.json({
    status: "ok",
    endpoint: "/api/llm/chat",
    methods: ["GET", "POST"],
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  console.log("[LLM Chat] ====== ROUTE HANDLER INVOKED ======");
  console.log("[LLM Chat] POST request received", {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
  });

  try {
    const { userId } = await auth();
    console.log("[LLM Chat] Auth result:", { userId: userId ? "present" : "missing" });

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("[LLM Chat] Request body:", {
      model: body.model,
      provider: body.provider,
      messageCount: body.messages?.length
    });
    let {
      provider: providedProvider,
      model,
      messages,
      stream = true,
      temperature,
      maxTokens,
    } = body as {
      provider?: Provider;
      model?: string;
      messages: Message[];
      stream?: boolean;
      temperature?: number;
      maxTokens?: number;
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid request: messages are required", {
        status: 400,
      });
    }

    // If no model/provider specified, use the user's first/default API key
    let provider: Provider;
    let apiKeyRecord;

    if (model) {
      provider = providedProvider || getProviderFromModel(model);
      apiKeyRecord = await getApiKey(userId, provider);
    } else {
      // Get any available API key (preferring default)
      const allKeys = await getApiKeys(userId);
      if (allKeys.length === 0) {
        return new Response(
          "No API keys configured. Please add an API key in Settings.",
          { status: 400 }
        );
      }
      // Prefer default key, otherwise use first one
      apiKeyRecord = allKeys.find((k) => k.is_default) || allKeys[0];
      provider = apiKeyRecord.provider as Provider;
      model = DEFAULT_MODELS[provider];
    }

    if (!apiKeyRecord) {
      return new Response(`No API key configured for provider: ${provider}`, {
        status: 400,
      });
    }

    const decryptedKey = await decryptApiKey(apiKeyRecord.encrypted_key, userId);

    const baseUrl = apiKeyRecord.endpoint_url || undefined;
    console.log("[LLM Chat] Creating client:", {
      provider,
      model,
      hasCustomEndpoint: !!baseUrl,
      endpoint: baseUrl || "default"
    });

    // Create LLM client
    const client = createLLMClient(provider, {
      apiKey: decryptedKey,
      baseUrl,
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
    console.error("[LLM Chat] Error:", {
      name: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new Response(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
}
