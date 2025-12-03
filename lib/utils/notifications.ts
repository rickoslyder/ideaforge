import { toast } from "@/hooks/use-toast";

export const notify = {
  success: (message: string, description?: string) => {
    toast({
      title: message,
      description,
    });
  },

  error: (message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: "destructive",
    });
  },

  info: (message: string, description?: string) => {
    toast({
      title: message,
      description,
    });
  },

  // Common actions
  saved: () => notify.success("Changes saved"),
  deleted: (item = "Item") => notify.success(`${item} deleted`),
  copied: () => notify.success("Copied to clipboard"),
  exported: (format: string) => notify.success(`Exported as ${format}`),

  // Error scenarios
  networkError: () =>
    notify.error("Network error", "Please check your connection and try again"),
  saveFailed: () =>
    notify.error("Save failed", "Your changes could not be saved"),
  loadFailed: () =>
    notify.error("Load failed", "Could not load the requested data"),
  unauthorized: () =>
    notify.error("Unauthorized", "Please sign in to continue"),
};
