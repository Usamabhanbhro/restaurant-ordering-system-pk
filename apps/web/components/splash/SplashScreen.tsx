"use client";

import { useEffect } from "react";

interface SplashScreenProps {
  isExiting: boolean;
  onDismiss: () => void;
}

export function SplashScreen({ isExiting, onDismiss }: SplashScreenProps) {
  useEffect(() => {
    // Auto-dismiss after 1.8 seconds (Apple restraint: kill latency, don't trap the user)
    const timer = setTimeout(() => {
      onDismiss();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      className={`fixed inset-0 z-50 flex items-center justify-center select-none cursor-pointer transition-all ${
        isExiting
          ? "opacity-0 scale-[1.04] pointer-events-none"
          : "opacity-100 scale-100"
      }`}
      style={{
        backgroundColor: "#fc683f",
        transitionDuration: "360ms",
        transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
      }}
      role="dialog"
      aria-label="QueueLess Opening Splash"
    >
      {/* Center: Iconic Speed Cup 'Q' Logo in Pure White */}
      <div className="relative flex items-center justify-center animate-splash-emblem">
        <svg
          viewBox="0 0 512 512"
          className="w-28 h-28 sm:w-32 sm:h-32 text-white"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Lightning Bolt / Wing */}
          <path d="M 235 125 L 140 285 L 210 285 L 145 395 L 295 240 L 225 240 Z" />
          {/* Circular Cup Q Loop */}
          <path d="M 230 150 C 310 150 370 205 370 285 C 370 335 345 375 305 395 L 340 435 L 285 435 L 255 400 C 247 401 238 402 230 402 C 215 402 200 398 185 392 L 210 355 C 217 358 223 359 230 359 C 285 359 325 325 325 285 C 325 245 285 193 230 193 C 218 193 205 197 195 203 L 195 158 C 206 153 218 150 230 150 Z" />
          {/* Cup Handle */}
          <path d="M 370 230 C 400 230 415 250 415 280 C 415 310 400 330 370 330 L 370 295 C 382 295 387 290 387 280 C 387 270 382 265 370 265 Z" />
        </svg>
      </div>
    </div>
  );
}
