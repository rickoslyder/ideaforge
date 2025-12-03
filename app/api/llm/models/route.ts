import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { Provider, ModelInfo } from "@/lib/llm/types";

// Static model list - can be expanded or fetched dynamically
const MODELS: ModelInfo[] = [
  // OpenAI
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    contextWindow: 128000,
    inputCostPer1kTokens: 0.005,
    outputCostPer1kTokens: 0.015,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    contextWindow: 128000,
    inputCostPer1kTokens: 0.00015,
    outputCostPer1kTokens: 0.0006,
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    contextWindow: 128000,
    inputCostPer1kTokens: 0.01,
    outputCostPer1kTokens: 0.03,
  },

  // Anthropic
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude Sonnet 4",
    provider: "anthropic",
    contextWindow: 200000,
    inputCostPer1kTokens: 0.003,
    outputCostPer1kTokens: 0.015,
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    contextWindow: 200000,
    inputCostPer1kTokens: 0.003,
    outputCostPer1kTokens: 0.015,
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
    contextWindow: 200000,
    inputCostPer1kTokens: 0.0008,
    outputCostPer1kTokens: 0.004,
  },

  // Google
  {
    id: "gemini-2.5-flash-preview-05-20",
    name: "Gemini 2.5 Flash",
    provider: "google",
    contextWindow: 1000000,
    inputCostPer1kTokens: 0.00015,
    outputCostPer1kTokens: 0.0006,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    contextWindow: 1000000,
    inputCostPer1kTokens: 0.0001,
    outputCostPer1kTokens: 0.0004,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    contextWindow: 2000000,
    inputCostPer1kTokens: 0.00125,
    outputCostPer1kTokens: 0.005,
  },

  // Ollama (local, no cost)
  {
    id: "llama3.2",
    name: "Llama 3.2",
    provider: "ollama",
    contextWindow: 128000,
  },
  {
    id: "mistral",
    name: "Mistral",
    provider: "ollama",
    contextWindow: 32000,
  },
  {
    id: "codellama",
    name: "Code Llama",
    provider: "ollama",
    contextWindow: 16000,
  },
];

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider") as Provider | null;

  let models = MODELS;
  if (provider) {
    models = models.filter((m) => m.provider === provider);
  }

  return Response.json({ models });
}
