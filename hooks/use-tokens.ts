"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

export interface TokenInfo {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateTokenResult {
  token: string; // Raw token - only shown once!
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  expiresAt: string | null;
  createdAt: string;
}

export function useTokens() {
  const { userId } = useAuth();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/settings/tokens");
      if (!response.ok) throw new Error("Failed to fetch tokens");
      const data = await response.json();
      // Transform snake_case to camelCase
      setTokens(
        data.tokens.map((t: Record<string, unknown>) => ({
          id: t.id,
          name: t.name,
          tokenPrefix: t.token_prefix,
          scopes: t.scopes,
          lastUsedAt: t.last_used_at,
          expiresAt: t.expires_at,
          createdAt: t.created_at,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  async function createToken(
    name: string,
    options?: {
      scopes?: string[];
      expiresInDays?: number;
    }
  ): Promise<CreateTokenResult> {
    const response = await fetch("/api/settings/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        scopes: options?.scopes,
        expiresInDays: options?.expiresInDays,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to create token");
    }

    const result = await response.json();
    await fetchTokens();
    return result;
  }

  async function revokeToken(id: string) {
    const response = await fetch(`/api/settings/tokens/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to revoke token");
    }

    await fetchTokens();
  }

  return {
    tokens,
    isLoading,
    error,
    createToken,
    revokeToken,
    refetch: fetchTokens,
  };
}
