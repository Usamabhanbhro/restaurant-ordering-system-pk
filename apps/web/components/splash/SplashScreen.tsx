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
      {/* Center: The Velocity Platter Logo in Pure White */}
      <div className="relative flex items-center justify-center animate-splash-emblem">
        <svg
          viewBox="0 0 800 800"
          className="w-32 h-32 sm:w-36 sm:h-36 text-white"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <g fill="#FFFFFF" fillRule="evenodd">
            {/* Plume 01: Top Aerodynamic Streak */}
            <path d="M 235 285 C 310 290, 410 265, 545 220 L 495 265 C 415 275, 320 295, 235 285 Z" />

            {/* Plume 02: Mid Velocity Flow */}
            <path d="M 195 348 C 285 352, 420 325, 595 272 L 535 325 C 425 338, 305 362, 195 348 Z" />

            {/* Plume 03: The Kinetic Serving Vessel */}
            <path d="M 205 435 C 275 425, 470 380, 615 330 C 570 470, 470 545, 345 545 C 260 545, 215 500, 205 435 Z M 245 448 C 255 485, 290 512, 350 512 C 435 512, 515 460, 560 365 C 445 405, 300 440, 245 448 Z" />
          </g>
        </svg>
      </div>
    </div>
  );
}
