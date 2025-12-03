"use client";

import { useState, useCallback, useEffect } from "react";
import type { Phase } from "@/lib/db/types";

export interface ModelConfig {
  defaultModel: string;
  phaseModels: Record<Phase, string | null>;
}

const DEFAULT_CONFIG: ModelConfig = {
  defaultModel: "claude-sonnet-4-5-20250929",
  phaseModels: {
    request: null,
    spec: null,
    plan: null,
  },
};

const STORAGE_KEY = "ideaforge-model-config";

export function useModelConfig() {
  const [config, setConfig] = useState<ModelConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // Load config from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setConfig(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load model config:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save config to localStorage
  const saveConfig = useCallback((newConfig: ModelConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error("Failed to save model config:", error);
    }
  }, []);

  const setDefaultModel = useCallback(
    (model: string) => {
      saveConfig({ ...config, defaultModel: model });
    },
    [config, saveConfig]
  );

  const setPhaseModel = useCallback(
    (phase: Phase, model: string | null) => {
      saveConfig({
        ...config,
        phaseModels: { ...config.phaseModels, [phase]: model },
      });
    },
    [config, saveConfig]
  );

  const getModelForPhase = useCallback(
    (phase: Phase): string => {
      return config.phaseModels[phase] || config.defaultModel;
    },
    [config]
  );

  const resetToDefaults = useCallback(() => {
    saveConfig(DEFAULT_CONFIG);
  }, [saveConfig]);

  return {
    config,
    isLoading,
    setDefaultModel,
    setPhaseModel,
    getModelForPhase,
    resetToDefaults,
  };
}
