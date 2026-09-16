"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Download, X, Smartphone, Share, PlusSquare } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  canInstall: boolean;
  isIOS: boolean;
  showIOSModal: boolean;
  setShowIOSModal: (show: boolean) => void;
  triggerInstall: () => Promise<void>;
}

const PWAInstallContext = createContext<PWAInstallContextType>({
  deferredPrompt: null,
  isInstalled: false,
  canInstall: false,
  isIOS: false,
  showIOSModal: false,
  setShowIOSModal: () => {},
  triggerInstall: async () => {},
});

// Early event capture to prevent missing beforeinstallprompt before React mount
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
  });
}

export function PWAInstallProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // 1. Detect if running in standalone mode (already installed)
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsInstalled(isStandalone);
      if (isStandalone) {
        setCanInstall(false);
      }
      return isStandalone;
    };

    const alreadyInstalled = checkStandalone();

    // 2. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafari =
      /safari/.test(userAgent) && !/chrome|crios|fxios|edgios|opr/.test(userAgent);
    const isIOSSafari = isIOSDevice && isSafari;
    setIsIOS(isIOSSafari);

    // If already installed, app cannot be installed again
    if (alreadyInstalled) {
      setCanInstall(false);
      return;
    }

    // 3. Set canInstall based on captured deferredPrompt or iOS Safari
    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
      setCanInstall(true);
    } else if (isIOSSafari) {
      setCanInstall(true);
    }

    // 4. Capture beforeinstallprompt for Chromium browsers
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      globalDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      if (!checkStandalone()) {
        setCanInstall(true);
      }
    };

    // 5. When app is installed, immediately hide install controls
    const handleAppInstalled = () => {
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
      setCanInstall(false);
      setShowIOSModal(false);
    };

    // 6. Listen for standalone display-mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setCanInstall(false);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  const triggerInstall = async () => {
    // If already installed, do nothing (no alert)
    if (isInstalled) return;

    // iOS Safari does not support prompt(), show step-by-step visual modal instead of alert
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    const promptEvent = deferredPrompt || globalDeferredPrompt;
    if (promptEvent && typeof promptEvent.prompt === "function") {
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult.outcome === "accepted") {
          setIsInstalled(true);
          setCanInstall(false);
        }
      } catch (err) {
        console.warn("[PWA] Installation prompt failed:", err);
      } finally {
        globalDeferredPrompt = null;
        setDeferredPrompt(null);
        setCanInstall(false);
      }
    }
  };

  return (
    <PWAInstallContext.Provider
      value={{
        deferredPrompt,
        isInstalled,
        canInstall,
        isIOS,
        showIOSModal,
        setShowIOSModal,
        triggerInstall,
      }}
    >
      {children}
    </PWAInstallContext.Provider>
  );
}

export function usePWAInstall() {
  return useContext(PWAInstallContext);
}

/**
 * Responsive Header Install Button
 * - Appears in dashboard header
 * - Desktop: "Install App" pill with bounce animation
 * - Mobile: Compact "Install" button
 * - Hidden when installed or installation unavailable
 */
export function PwaInstallButton({ className }: { className?: string }) {
  const { canInstall, isInstalled, triggerInstall } = usePWAInstall();

  if (!canInstall || isInstalled) return null;

  return (
    <button
      onClick={triggerInstall}
      className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FF6A00] hover:bg-[#e05d00] text-white shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer shrink-0 border border-[#FF6A00]/30 ${className || ""}`}
      title="Install DOD Admin App on your device"
      aria-label="Install App"
    >
      <Download size={14} className="shrink-0 animate-pulse" />
      <span className="font-poppins font-medium tracking-wide">
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </span>
    </button>
  );
}

/**
 * Sidebar Drawer Install Banner
 * - Appears in the mobile/tablet navigation drawer
 * - Hidden when installed or installation unavailable
 */
export function PwaSidebarInstall({ className }: { className?: string }) {
  const { canInstall, isInstalled, triggerInstall } = usePWAInstall();

  if (!canInstall || isInstalled) return null;

  return (
    <div
      className={`p-3 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-[#FF6A00]/25 flex items-center justify-between gap-3 ${className || ""}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-[#FF6A00] text-white flex items-center justify-center shrink-0 shadow-sm">
          <Download size={15} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#1A1A1A] truncate">DOD Admin App</p>
          <p className="text-[10px] text-[#6E6E6E] truncate">Install for fast access</p>
        </div>
      </div>
      <button
        onClick={triggerInstall}
        className="px-3 py-1.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all shrink-0 cursor-pointer"
      >
        Install
      </button>
    </div>
  );
}

/**
 * Backward compatibility export
 */
export function PwaHeaderButton() {
  return <PwaInstallButton />;
}

/**
 * Main prompt wrapper - handles iOS instructions modal gracefully
 * Absolutely NO alert() dialogs!
 */
export default function PwaInstallPrompt() {
  const { showIOSModal, setShowIOSModal } = usePWAInstall();

  return (
    <AnimatePresence>
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-900 border border-[#FF6A00]/30 text-white p-6 rounded-2xl max-w-md w-full shadow-2xl relative"
          >
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="text-[#FF6A00]" size={28} />
              <h3 className="font-marcellus text-lg text-amber-400 font-semibold">
                Install on iOS (Safari)
              </h3>
            </div>
            <p className="text-xs text-zinc-300 mb-4">
              Follow these simple steps to install Designs of Dreams Atelier Admin on your device:
            </p>
            <ol className="space-y-3 text-xs text-zinc-300">
              <li className="flex items-center gap-3 bg-zinc-800/60 p-2.5 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-[#FF6A00] text-white font-bold flex items-center justify-center text-xs shrink-0">
                  1
                </span>
                <span>
                  Tap the <strong className="text-amber-400">Share button</strong> (icon{" "}
                  <Share size={14} className="inline mx-1 text-amber-400" />) at the bottom of your screen.
                </span>
              </li>
              <li className="flex items-center gap-3 bg-zinc-800/60 p-2.5 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-[#FF6A00] text-white font-bold flex items-center justify-center text-xs shrink-0">
                  2
                </span>
                <span>
                  Scroll down and tap{" "}
                  <strong className="text-amber-400">&apos;Add to Home Screen&apos;</strong> (
                  <PlusSquare size={14} className="inline mx-1 text-amber-400" />
                  ).
                </span>
              </li>
              <li className="flex items-center gap-3 bg-zinc-800/60 p-2.5 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-[#FF6A00] text-white font-bold flex items-center justify-center text-xs shrink-0">
                  3
                </span>
                <span>
                  Tap <strong className="text-amber-400">&apos;Add&apos;</strong> in the top-right corner to finish.
                </span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-6 bg-[#FF6A00] text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-[#e05d00] transition-colors cursor-pointer"
            >
              Got It
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
