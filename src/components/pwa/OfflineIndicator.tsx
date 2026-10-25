"use client";

import { useEffect, useState } from "react";
import { WifiOff, AlertTriangle } from "lucide-react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Only in browser
    if (typeof window === "undefined") return;

    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white text-xs sm:text-sm font-medium py-2 px-4 shadow-md flex items-center justify-center gap-2 transition-all">
      <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
      <span>
        <strong>You are offline:</strong> Changes and stock transactions will not be recorded until your internet connection is restored.
      </span>
    </div>
  );
}
