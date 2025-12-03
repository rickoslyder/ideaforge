"use client";

import { ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Provider } from "@/lib/llm/types";

interface ProviderInfo {
  provider: Provider;
  name: string;
  description: string;
  signupUrl: string;
  docsUrl: string;
  features: string[];
}

const providers: ProviderInfo[] = [
  {
    provider: "openai",
    name: "OpenAI",
    description: "GPT-4, GPT-4 Turbo, and GPT-3.5 models",
    signupUrl: "https://platform.openai.com/signup",
    docsUrl: "https://platform.openai.com/docs",
    features: ["GPT-4o", "GPT-4 Turbo", "GPT-3.5 Turbo", "Vision support"],
  },
  {
    provider: "anthropic",
    name: "Anthropic",
    description: "Claude 3.5, Claude 3, and Claude 2 models",
    signupUrl: "https://console.anthropic.com/",
    docsUrl: "https://docs.anthropic.com/",
    features: ["Claude 3.5 Sonnet", "Claude 3 Opus", "Claude 3 Haiku", "Long context"],
  },
  {
    provider: "google",
    name: "Google (Gemini)",
    description: "Gemini Pro and Gemini Ultra models",
    signupUrl: "https://makersuite.google.com/app/apikey",
    docsUrl: "https://ai.google.dev/docs",
    features: ["Gemini 1.5 Pro", "Gemini 1.5 Flash", "Multimodal", "Long context"],
  },
  {
    provider: "ollama",
    name: "Ollama",
    description: "Run models locally on your machine",
    signupUrl: "https://ollama.ai/download",
    docsUrl: "https://ollama.ai/",
    features: ["Llama 3", "Mistral", "Code Llama", "No API key needed"],
  },
  {
    provider: "custom",
    name: "Custom / OpenAI-compatible",
    description: "Connect to any OpenAI-compatible API",
    signupUrl: "",
    docsUrl: "",
    features: ["Self-hosted", "Custom endpoints", "OpenAI API format"],
  },
];

interface ProviderConfigProps {
  configuredProviders: Provider[];
}

export function ProviderConfig({ configuredProviders }: ProviderConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Supported Providers</h3>
        <p className="text-sm text-muted-foreground">
          IdeaForge supports multiple LLM providers. Configure the ones you want
          to use.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((provider) => {
          const isConfigured = configuredProviders.includes(provider.provider);

          return (
            <Card
              key={provider.provider}
              className={isConfigured ? "border-primary/50" : ""}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{provider.name}</CardTitle>
                  {isConfigured && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Configured
                    </span>
                  )}
                </div>
                <CardDescription>{provider.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {provider.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs bg-muted px-2 py-1 rounded-md"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {(provider.signupUrl || provider.docsUrl) && (
                  <div className="flex gap-2">
                    {provider.signupUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={provider.signupUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Get API Key
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {provider.docsUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={provider.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Docs
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
