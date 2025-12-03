"use client";

import { useState, useEffect, useCallback } from "react";
import { useSyncStore } from "@/stores/sync-store";

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);
  const setIsOnline = useSyncStore((state) => state.setIsOnline);

  const updateOnlineStatus = useCallback(() => {
    const online = typeof navigator !== "undefined" ? navigator.onLine : true;
    setIsOffline(!online);
    setIsOnline(online);
  }, [setIsOnline]);

  useEffect(() => {
    updateOnlineStatus();

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, [updateOnlineStatus]);

  return { isOffline, isOnline: !isOffline };
}
