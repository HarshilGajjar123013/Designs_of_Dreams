"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export default function PWAStatusProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // 1. Monitor online/offline network status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    // 2. Register Service Worker on all environments for PWA installability
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered:", reg.scope);
          setSwRegistered(true);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, []);

  return (
    <>
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-zinc-950 px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center justify-between shadow-md animate-pulse">
          <div className="flex items-center gap-2">
            <WifiOff size={16} />
            <span>Working Offline — Changes stored locally and synced when connection recovers</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1 bg-zinc-950 text-amber-400 px-2.5 py-1 rounded text-[10px] font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <RefreshCw size={12} /> Retry Connection
          </button>
        </div>
      )}
      {children}
    </>
  );
}
