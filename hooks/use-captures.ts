"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { QuickCapture } from "@/lib/db/types";

export function useCaptures() {
  const { userId } = useAuth();
  const router = useRouter();
  const [captures, setCaptures] = useState<QuickCapture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCaptures = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/captures");
      if (!response.ok) throw new Error("Failed to fetch captures");
      const data = await response.json();
      setCaptures(data.captures);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCaptures();
  }, [fetchCaptures]);

  async function deleteCapture(id: string) {
    const response = await fetch(`/api/captures/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to delete capture");
    }

    await fetchCaptures();
  }

  async function convertToProject(
    id: string,
    options?: { name?: string }
  ): Promise<string> {
    const response = await fetch(`/api/captures/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: options?.name }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to convert capture");
    }

    const data = await response.json();
    await fetchCaptures();

    // Navigate to the new project
    router.push(`/projects/${data.projectId}/request`);

    return data.projectId;
  }

  return {
    captures,
    isLoading,
    error,
    deleteCapture,
    convertToProject,
    refetch: fetchCaptures,
  };
}
