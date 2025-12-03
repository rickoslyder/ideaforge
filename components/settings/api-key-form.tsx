"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Provider } from "@/lib/llm/types";

const providers: { value: Provider; label: string; placeholder: string }[] = [
  {
    value: "openai",
    label: "OpenAI",
    placeholder: "sk-...",
  },
  {
    value: "anthropic",
    label: "Anthropic",
    placeholder: "sk-ant-...",
  },
  {
    value: "google",
    label: "Google (Gemini)",
    placeholder: "AIza...",
  },
  {
    value: "ollama",
    label: "Ollama (Local)",
    placeholder: "Not required for local models",
  },
  {
    value: "custom",
    label: "Custom / OpenAI-compatible",
    placeholder: "Your API key",
  },
];

interface ApiKeyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    provider: Provider,
    key: string,
    name?: string,
    endpointUrl?: string
  ) => Promise<void>;
}

export function ApiKeyForm({ open, onOpenChange, onSubmit }: ApiKeyFormProps) {
  const [provider, setProvider] = useState<Provider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [name, setName] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProvider = providers.find((p) => p.value === provider);
  const isOllama = provider === "ollama";
  const isCustom = provider === "custom";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isOllama && !apiKey.trim()) {
      setError("API key is required");
      return;
    }

    if (isCustom && !endpointUrl.trim()) {
      setError("Endpoint URL is required for custom providers");
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit(
        provider,
        isOllama ? "ollama-local" : apiKey.trim(),
        name.trim() || undefined,
        endpointUrl.trim() || undefined
      );
      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add API key");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setProvider("openai");
    setApiKey("");
    setName("");
    setEndpointUrl("");
    setShowKey(false);
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add API Key</DialogTitle>
          <DialogDescription>
            Add a new API key to use with IdeaForge. Your key is encrypted
            before being stored.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={provider}
              onValueChange={(v) => setProvider(v as Provider)}
            >
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providers.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              placeholder="e.g., Work API Key"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {!isOllama && (
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  placeholder={selectedProvider?.placeholder}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {(isOllama || isCustom) && (
            <div className="space-y-2">
              <Label htmlFor="endpoint-url">
                Endpoint URL {isOllama && "(optional)"}
              </Label>
              <Input
                id="endpoint-url"
                placeholder={
                  isOllama
                    ? "http://localhost:11434"
                    : "https://api.example.com/v1"
                }
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
              />
              {isOllama && (
                <p className="text-xs text-muted-foreground">
                  Leave empty to use default localhost:11434
                </p>
              )}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
