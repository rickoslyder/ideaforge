"use client";

import { useState, useCallback, useEffect } from "react";
import { createDefaultSpecConfig } from "@/lib/constants/default-sections";
import type { SpecConfig } from "@/types/spec";

const STORAGE_KEY = "ideaforge_spec_config";

export function useSpecConfig(projectId: string) {
  const [config, setConfig] = useState<SpecConfig>(() => createDefaultSpecConfig());
  const [isLoading, setIsLoading] = useState(true);

  // Load config from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${projectId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig(parsed);
      }
    } catch (error) {
      console.error("Failed to load spec config:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Save config to localStorage when it changes
  const updateConfig = useCallback(
    (newConfig: SpecConfig) => {
      setConfig(newConfig);
      try {
        localStorage.setItem(
          `${STORAGE_KEY}_${projectId}`,
          JSON.stringify(newConfig)
        );
      } catch (error) {
        console.error("Failed to save spec config:", error);
      }
    },
    [projectId]
  );

  const resetConfig = useCallback(() => {
    const defaultConfig = createDefaultSpecConfig();
    updateConfig(defaultConfig);
    return defaultConfig;
  }, [updateConfig]);

  const getEnabledSections = useCallback(() => {
    return config.sections
      .filter((s) => s.enabled)
      .sort((a, b) => a.order - b.order);
  }, [config.sections]);

  return {
    config,
    updateConfig,
    resetConfig,
    getEnabledSections,
    isLoading,
  };
}
