"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { Phase } from "@/lib/db/types";

export interface ModelConfig {
  defaultModel: string;
  phaseModels: Record<Phase, string | null>;
}

const DEFAULT_CONFIG: ModelConfig = {
  defaultModel: "gemini-3.0-pro-preview",
  phaseModels: {
    request: null,
    spec: null,
    plan: null,
  },
};

const STORAGE_KEY = "ideaforge-model-config";

interface ModelConfigContextValue {
  config: ModelConfig;
  isLoading: boolean;
  setDefaultModel: (model: string) => void;
  setPhaseModel: (phase: Phase, model: string | null) => void;
  getModelForPhase: (phase: Phase) => string;
  resetToDefaults: () => void;
}

const ModelConfigContext = createContext<ModelConfigContextValue | null>(null);

export function ModelConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ModelConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // Load config from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new phases added later
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
          phaseModels: {
            ...DEFAULT_CONFIG.phaseModels,
            ...(parsed.phaseModels || {}),
          },
        });
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

  return (
    <ModelConfigContext.Provider
      value={{
        config,
        isLoading,
        setDefaultModel,
        setPhaseModel,
        getModelForPhase,
        resetToDefaults,
      }}
    >
      {children}
    </ModelConfigContext.Provider>
  );
}

export function useModelConfig(): ModelConfigContextValue {
  const context = useContext(ModelConfigContext);
  if (!context) {
    throw new Error("useModelConfig must be used within a ModelConfigProvider");
  }
  return context;
}
