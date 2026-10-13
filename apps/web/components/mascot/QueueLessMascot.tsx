"use client";

import React from "react";

export type MascotState = "sad" | "happy" | "celebratory";

interface QueueLessMascotProps {
  state?: MascotState;
  className?: string;
  size?: "sm" | "md" | "lg";
  alt?: string;
}

const MASCOT_IMAGES: Record<MascotState, string> = {
  sad: "/mascot/sad.jpg",
  happy: "/mascot/happy.jpg",
  celebratory: "/mascot/celebratory.jpg",
};

const SIZE_CLASSES = {
  sm: "w-16 h-16",
  md: "w-28 h-28 sm:w-32 sm:h-32",
  lg: "w-40 h-40 sm:w-48 sm:h-48",
};

export function QueueLessMascot({
  state = "sad",
  className = "",
  size = "md",
  alt,
}: QueueLessMascotProps) {
  const src = MASCOT_IMAGES[state] || MASCOT_IMAGES.sad;
  const defaultAlt = `QueueLess Mascot (${state})`;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${SIZE_CLASSES[size]} ${className}`}
    >
      <img
        src={src}
        alt={alt || defaultAlt}
        className="w-full h-full object-contain rounded-2xl drop-shadow-md select-none pointer-events-none"
        loading="lazy"
      />
    </div>
  );
}

export default QueueLessMascot;
