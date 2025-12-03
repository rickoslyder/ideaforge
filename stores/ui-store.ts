import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Comparison panel state
  comparisonPanelOpen: boolean;
  toggleComparisonPanel: () => void;
  setComparisonPanelOpen: (open: boolean) => void;

  // Mobile menu
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;

  // Model selector dialog
  modelSelectorOpen: boolean;
  setModelSelectorOpen: (open: boolean) => void;

  // Toast/notification state
  activeToast: {
    message: string;
    type: "success" | "error" | "info";
  } | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      comparisonPanelOpen: false,
      toggleComparisonPanel: () =>
        set((state) => ({ comparisonPanelOpen: !state.comparisonPanelOpen })),
      setComparisonPanelOpen: (open) => set({ comparisonPanelOpen: open }),

      mobileMenuOpen: false,
      toggleMobileMenu: () =>
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

      modelSelectorOpen: false,
      setModelSelectorOpen: (open) => set({ modelSelectorOpen: open }),

      activeToast: null,
      showToast: (message, type = "info") =>
        set({ activeToast: { message, type } }),
      hideToast: () => set({ activeToast: null }),
    }),
    {
      name: "ideaforge-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
