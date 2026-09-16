"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Preloader.scss";

const AUDIO_SRC = "/assets/audio/little Krishna flute music ringtone - lord Krishna (128k) (1).mp3";

const MandalaSVG = () => (
  <motion.svg 
    width="200" 
    height="200" 
    viewBox="0 0 200 200" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
    animate={{ 
      rotate: 360, 
      scale: 1, 
      opacity: 1,
      transition: { 
        rotate: { duration: 40, repeat: Infinity, ease: "linear" },
        scale: { duration: 2, ease: "easeOut" },
        opacity: { duration: 1.5 }
      }
    }}
  >
    <circle cx="100" cy="100" r="18" stroke="#FF6A00" strokeWidth="1" />
    <circle cx="100" cy="100" r="12" fill="#FF6A00" opacity="0.8" />
    <path d="M100 70 L105 85 L100 100 L95 85 Z" fill="#FF6A00" />
    <path d="M100 130 L105 115 L100 100 L95 115 Z" fill="#FF6A00" />
    <path d="M70 100 L85 105 L100 100 L85 95 Z" fill="#FF6A00" />
    <path d="M130 100 L115 105 L100 100 L115 95 Z" fill="#FF6A00" />
    
    {[...Array(12)].map((_, i) => (
      <g key={i} transform={`rotate(${i * 30} 100 100)`}>
        <path 
          d="M100 40 C110 55 110 75 100 90 C90 75 90 55 100 40" 
          stroke="#FF6A00" 
          strokeWidth="0.8" 
          opacity="0.6"
        />
        <circle cx="100" cy="35" r="1.5" fill="#FF6A00" />
      </g>
    ))}
    
    {[...Array(24)].map((_, i) => (
      <line 
        key={i}
        x1="100" y1="20" x2="100" y2="25" 
        stroke="#FF6A00" 
        strokeWidth="0.5" 
        opacity="0.4"
        transform={`rotate(${i * 15} 100 100)`}
      />
    ))}
  </motion.svg>
);

const Preloader: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPreloaderActiveRef = useRef(true);

  useEffect(() => {
    isPreloaderActiveRef.current = true;

    // Initialize audio instance
    const audio = new Audio(AUDIO_SRC);
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = 0.75;
    audioRef.current = audio;

    // Fallback interaction handler in case browser autoplay policy blocks unprompted audio
    const handleInteraction = () => {
      if (isPreloaderActiveRef.current && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
      cleanupInteraction();
    };

    const cleanupInteraction = () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });

    // Attempt autoplay immediately
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Silently handled: waiting for user interaction fallback
      });
    }

    // Smooth volume fade out
    const fadeOutAndStop = () => {
      isPreloaderActiveRef.current = false;
      cleanupInteraction();
      const currentAudio = audioRef.current;
      if (!currentAudio) return;

      const startVolume = currentAudio.volume;
      const duration = 1200; // ms smooth gentle fade
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const factor = Math.min(elapsed / duration, 1);
        if (currentAudio) {
          currentAudio.volume = Math.max(0, startVolume * (1 - factor));
        }

        if (factor < 1) {
          requestAnimationFrame(step);
        } else {
          if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
          }
        }
      };

      requestAnimationFrame(step);
    };

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          // Start smooth audio fade-out as progress hits 100%
          fadeOutAndStop();
          setTimeout(() => {
            setLoading(false);
            window.dispatchEvent(new CustomEvent("preloaderComplete"));
          }, 1300);
          return 100;
        }
        return prev + 1;
      });
    }, 65);

    return () => {
      clearInterval(timer);
      isPreloaderActiveRef.current = false;
      cleanupInteraction();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="heritage-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
          {/* Decorative Corners */}
          <div className="corner tl" />
          <div className="corner tr" />
          <div className="corner bl" />
          <div className="corner br" />

          {/* Palace Silhouette Bottom */}
          <div className="palace-silhouette" />

          <div className="preloader-main">
            {/* Brand Logo */}
            <div className="mandala-container">
              <motion.img 
                src="/logo.png" 
                alt="Logo" 
                className="preloader-logo-img"
                initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
                animate={{ 
                  rotate: 360, 
                  scale: 1, 
                  opacity: 1,
                  transition: { 
                    rotate: { duration: 45, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, ease: "easeOut" },
                    opacity: { duration: 1.5 }
                  }
                }}
              />
            </div>

            {/* Brand Name */}
            <motion.h1 
              className="heritage-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              DESIGNS OF DREAMS
            </motion.h1>

            {/* Dots */}
            <div className="loading-dots">
              <span />
              <span />
              <span />
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-track">
                <motion.div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="loading-text">Loading... {progress}%</p>
            </div>

            {/* Tagline */}
            <motion.div 
              className="tagline-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
            >
              <span className="line" />
              <p className="tagline">ROOTED IN TRADITION, DESIGNED FOR YOU</p>
              <span className="line" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
