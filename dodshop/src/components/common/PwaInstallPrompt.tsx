"use client";

import React, { useEffect, useState } from "react";
import { X, Download, Smartphone, Share } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Detect if app is already running in standalone mode (installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // 2. Detect iOS Device Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    // Safari user agent contains 'safari' but not 'chrome', 'crios' (Chrome on iOS), or 'firefox'
    const isSafari = /safari/.test(userAgent) && !/crios/.test(userAgent) && !/fxios/.test(userAgent) && !/chrome/.test(userAgent);

    const isDismissed = sessionStorage.getItem("pwa_install_dismissed");

    if (isIosDevice && isSafari && !isDismissed) {
      setIsIos(true);
      setIsVisible(true);
      return;
    }

    // 3. Android/Chrome/Windows installation prompt event listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted install");
    }

    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa_install_dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-24 left-4 right-4 z-[9999] md:bottom-6 md:right-6 md:left-auto md:w-96 p-4 rounded-xl bg-zinc-950/95 border border-amber-500/30 shadow-2xl backdrop-blur-md flex flex-col gap-3 text-white font-body"
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-center">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Smartphone size={24} />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase text-amber-500">
                Install Designs of Dreams
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Enjoy offline access, faster load speeds, and push notifications.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-zinc-500 hover:text-white transition-colors duration-200"
          >
            <X size={18} />
          </button>
        </div>

        {isIos ? (
          // Custom instruction layout for Apple iOS devices
          <div className="mt-2 text-xs bg-zinc-900 p-3 rounded-lg border border-zinc-800 text-zinc-300 leading-relaxed">
            <p className="mb-2">To install this app on your iPhone:</p>
            <ol className="list-decimal pl-4 space-y-1.5">
              <li>
                Tap the Safari <strong>Share</strong> button <Share size={14} className="inline-block mx-1 text-amber-500" /> below.
              </li>
              <li>
                Scroll down and select <strong>"Add to Home Screen"</strong>.
              </li>
            </ol>
          </div>
        ) : (
          // Install trigger layout for Chrome/Android/Windows
          <div className="flex gap-2 justify-end mt-1">
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-xs font-semibold tracking-widest uppercase text-zinc-400 hover:text-white transition-colors duration-200"
            >
              Later
            </button>
            <button
              onClick={handleInstallClick}
              className="px-5 py-2 text-xs font-semibold tracking-widest uppercase bg-amber-500 text-zinc-950 hover:bg-amber-600 transition-all duration-200 flex items-center gap-1.5 rounded"
            >
              <Download size={14} /> Install App
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
