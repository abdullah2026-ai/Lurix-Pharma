"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("PWA Service Worker registered:", reg.scope))
        .catch((err) => console.error("PWA Service Worker registration failed:", err));
    }

    // Check if already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !showInstallBanner) return null;

  return (
    <aside aria-label="Install App" className="fixed bottom-4 right-4 z-[9990] max-w-sm w-[calc(100vw-2rem)] sm:w-auto bg-surface-card border border-emerald-100 rounded-2xl shadow-neu-elevated p-4 flex items-center gap-3 animate-fade-in">
      <div className="w-10 h-10 rounded-xl bg-brand-800 flex items-center justify-center text-white shrink-0 shadow-sm">
        <Download className="w-5 h-5 text-brand-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 truncate">Install {APP_CONFIG.name}</p>
        <p className="text-[11px] text-gray-500">Fast offline launch & native app feel</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-medium rounded-lg transition-all shadow-sm active:scale-95"
        >
          Install
        </button>
        <button
          onClick={() => setShowInstallBanner(false)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
