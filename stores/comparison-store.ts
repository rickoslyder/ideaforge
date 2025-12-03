import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  SelectedModel,
  ComparisonColumn,
  CherryPickedSection,
  ComparisonMode,
} from "@/types/comparison";

interface ComparisonState {
  // Selected models for comparison
  selectedModels: SelectedModel[];
  maxModels: number;

  // Comparison columns with streaming state
  columns: Record<string, ComparisonColumn>;

  // View mode
  mode: ComparisonMode;

  // Cherry-picked sections
  cherryPickedSections: CherryPickedSection[];

  // Actions
  addModel: (model: SelectedModel) => void;
  removeModel: (modelId: string) => void;
  clearModels: () => void;
  setMaxModels: (max: number) => void;

  updateColumn: (modelId: string, update: Partial<ComparisonColumn>) => void;
  clearColumns: () => void;

  setMode: (mode: ComparisonMode) => void;

  addCherryPick: (section: CherryPickedSection) => void;
  removeCherryPick: (sectionId: string) => void;
  clearCherryPicks: () => void;
  reorderCherryPicks: (fromIndex: number, toIndex: number) => void;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set) => ({
      selectedModels: [],
      maxModels: 4,
      columns: {},
      mode: "side-by-side",
      cherryPickedSections: [],

      addModel: (model) =>
        set((state) => {
          if (state.selectedModels.length >= state.maxModels) {
            return state;
          }
          if (state.selectedModels.some((m) => m.id === model.id)) {
            return state;
          }
          return {
            selectedModels: [...state.selectedModels, model],
            columns: {
              ...state.columns,
              [model.id]: {
                modelId: model.id,
                content: "",
                isStreaming: false,
              },
            },
          };
        }),

      removeModel: (modelId) =>
        set((state) => {
          const newColumns = { ...state.columns };
          delete newColumns[modelId];
          return {
            selectedModels: state.selectedModels.filter((m) => m.id !== modelId),
            columns: newColumns,
            cherryPickedSections: state.cherryPickedSections.filter(
              (s) => s.modelId !== modelId
            ),
          };
        }),

      clearModels: () =>
        set({
          selectedModels: [],
          columns: {},
          cherryPickedSections: [],
        }),

      setMaxModels: (max) => set({ maxModels: max }),

      updateColumn: (modelId, update) =>
        set((state) => ({
          columns: {
            ...state.columns,
            [modelId]: {
              ...state.columns[modelId],
              ...update,
            },
          },
        })),

      clearColumns: () =>
        set((state) => ({
          columns: Object.fromEntries(
            state.selectedModels.map((m) => [
              m.id,
              { modelId: m.id, content: "", isStreaming: false },
            ])
          ),
        })),

      setMode: (mode) => set({ mode }),

      addCherryPick: (section) =>
        set((state) => {
          // Replace if section already exists
          const existing = state.cherryPickedSections.findIndex(
            (s) => s.sectionId === section.sectionId
          );
          if (existing >= 0) {
            const updated = [...state.cherryPickedSections];
            updated[existing] = section;
            return { cherryPickedSections: updated };
          }
          return {
            cherryPickedSections: [...state.cherryPickedSections, section],
          };
        }),

      removeCherryPick: (sectionId) =>
        set((state) => ({
          cherryPickedSections: state.cherryPickedSections.filter(
            (s) => s.sectionId !== sectionId
          ),
        })),

      clearCherryPicks: () => set({ cherryPickedSections: [] }),

      reorderCherryPicks: (fromIndex, toIndex) =>
        set((state) => {
          const updated = [...state.cherryPickedSections];
          const [removed] = updated.splice(fromIndex, 1);
          updated.splice(toIndex, 0, removed);
          return { cherryPickedSections: updated };
        }),
    }),
    {
      name: "ideaforge-comparison",
      partialize: (state) => ({
        selectedModels: state.selectedModels,
        maxModels: state.maxModels,
        mode: state.mode,
      }),
    }
  )
);
