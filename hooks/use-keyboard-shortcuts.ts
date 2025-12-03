"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent);

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const modKey = isMac ? event.metaKey : event.ctrlKey;
        const ctrlMatch = shortcut.ctrl || shortcut.meta ? modKey : !modKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export function useGlobalShortcuts() {
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: "n",
      ctrl: true,
      description: "Create new project",
      action: () => router.push("/projects/new"),
    },
    {
      key: "p",
      ctrl: true,
      description: "Go to projects",
      action: () => router.push("/projects"),
    },
    {
      key: ",",
      ctrl: true,
      description: "Open settings",
      action: () => router.push("/settings"),
    },
    {
      key: "/",
      ctrl: true,
      description: "Show keyboard shortcuts",
      action: () => {
        // Emit custom event for shortcuts dialog
        window.dispatchEvent(new CustomEvent("show-shortcuts-dialog"));
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}

export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? "⌘" : "Ctrl");
  }
  if (shortcut.shift) {
    parts.push(isMac ? "⇧" : "Shift");
  }
  if (shortcut.alt) {
    parts.push(isMac ? "⌥" : "Alt");
  }

  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? "" : "+");
}
