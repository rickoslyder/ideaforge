"use client";

import { WifiOff } from "lucide-react";
import { useOffline } from "@/hooks/use-offline";

export function OfflineBanner() {
  const { isOffline } = useOffline();

  if (!isOffline) return null;

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2">
      <div className="container flex items-center justify-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
        <WifiOff className="h-4 w-4" />
        <span>You&apos;re offline. Changes will sync when you reconnect.</span>
      </div>
    </div>
  );
}
