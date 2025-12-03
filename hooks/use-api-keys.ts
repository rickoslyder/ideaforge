"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import type { Provider } from "@/lib/llm/types";

interface ApiKeyInfo {
  id: string;
  provider: Provider;
  name: string | null;
  isDefault: boolean;
  createdAt: string;
  hasKey: boolean;
}

export function useApiKeys() {
  const { userId } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApiKeys = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/settings/api-keys");
      if (!response.ok) throw new Error("Failed to fetch API keys");
      const data = await response.json();
      setApiKeys(data.apiKeys);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  async function addApiKey(
    provider: Provider,
    key: string,
    name?: string,
    endpointUrl?: string,
    isDefault?: boolean
  ) {
    const response = await fetch("/api/settings/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, key, name, endpointUrl, isDefault }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    await fetchApiKeys();
  }

  async function removeApiKey(id: string) {
    const response = await fetch(`/api/settings/api-keys/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    await fetchApiKeys();
  }

  async function setDefaultApiKey(id: string) {
    const response = await fetch(`/api/settings/api-keys/${id}/default`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    await fetchApiKeys();
  }

  return {
    apiKeys,
    isLoading,
    error,
    addApiKey,
    removeApiKey,
    setDefaultApiKey,
    refetch: fetchApiKeys,
  };
}
