"use client";

import { useCallback, useMemo } from "react";
import { useComparisonStore } from "@/stores/comparison-store";
import { useModels, type AvailableModel } from "./use-models";
import type { SelectedModel, CherryPickedSection } from "@/types/comparison";

export function useComparison() {
  const store = useComparisonStore();
  const { getModelById } = useModels();

  // Add model by ID
  const addModelById = useCallback(
    (modelId: string) => {
      const model = getModelById(modelId);
      if (model) {
        const selectedModel: SelectedModel = {
          id: model.id,
          model: model.model,
          provider: model.provider,
          displayName: model.displayName,
        };
        store.addModel(selectedModel);
      }
    },
    [getModelById, store]
  );

  // Add model directly
  const addModel = useCallback(
    (model: AvailableModel) => {
      const selectedModel: SelectedModel = {
        id: model.id,
        model: model.model,
        provider: model.provider,
        displayName: model.displayName,
      };
      store.addModel(selectedModel);
    },
    [store]
  );

  // Check if a model is selected
  const isModelSelected = useCallback(
    (modelId: string) => {
      return store.selectedModels.some((m) => m.id === modelId);
    },
    [store.selectedModels]
  );

  // Can add more models?
  const canAddModel = useMemo(() => {
    return store.selectedModels.length < store.maxModels;
  }, [store.selectedModels.length, store.maxModels]);

  // Get merged content from cherry-picked sections
  const getMergedContent = useCallback((): string => {
    if (store.cherryPickedSections.length === 0) {
      return "";
    }

    return store.cherryPickedSections.map((s) => s.content).join("\n\n");
  }, [store.cherryPickedSections]);

  // Check if any column is streaming
  const isAnyStreaming = useMemo(() => {
    return Object.values(store.columns).some((col) => col.isStreaming);
  }, [store.columns]);

  // Get all errors
  const errors = useMemo(() => {
    return Object.values(store.columns)
      .filter((col) => col.error)
      .map((col) => ({ modelId: col.modelId, error: col.error! }));
  }, [store.columns]);

  return {
    // State
    selectedModels: store.selectedModels,
    columns: store.columns,
    mode: store.mode,
    cherryPickedSections: store.cherryPickedSections,
    maxModels: store.maxModels,
    canAddModel,
    isAnyStreaming,
    errors,

    // Model actions
    addModel,
    addModelById,
    removeModel: store.removeModel,
    clearModels: store.clearModels,
    isModelSelected,
    setMaxModels: store.setMaxModels,

    // Column actions
    updateColumn: store.updateColumn,
    clearColumns: store.clearColumns,

    // Mode actions
    setMode: store.setMode,

    // Cherry-pick actions
    addCherryPick: store.addCherryPick,
    removeCherryPick: store.removeCherryPick,
    clearCherryPicks: store.clearCherryPicks,
    reorderCherryPicks: store.reorderCherryPicks,
    getMergedContent,
  };
}
