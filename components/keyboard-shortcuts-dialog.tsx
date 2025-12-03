"use client";

import { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGlobalShortcuts, formatShortcut } from "@/hooks/use-keyboard-shortcuts";

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);
  const shortcuts = useGlobalShortcuts();

  useEffect(() => {
    const handleShowDialog = () => setOpen(true);
    window.addEventListener("show-shortcuts-dialog", handleShowDialog);
    return () => window.removeEventListener("show-shortcuts-dialog", handleShowDialog);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Quick actions to navigate the app
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <span className="text-sm">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                {formatShortcut(shortcut)}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
