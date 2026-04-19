"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeSVGProps {
  eventName: string;
  communityName: string;
  eventId: number;
  accentColor?: string; // Kept for prop compatibility, but we use spectral gradient
  className?: string;
  size?: number;
}

/**
 * Dynamic SVG badge — renders a visual badge preview.
 * This will be the on-chain / IPFS metadata image.
 */
export function BadgeSVG({
  eventName,
  communityName,
  eventId,
  className,
  size = 240,
}: BadgeSVGProps) {
  const gradientId = `badge-spectrum-${eventId}`;
  const glowId = `badge-glow-${eventId}`;

  return (
    <div className={cn("relative group", className)}>
      {/* Float shadow effect (spectral aura) */}
      <div
        className="absolute inset-4 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rainbow-gradient"
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-2xl"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF5F6D" />
            <stop offset="25%" stopColor="#FFC371" />
            <stop offset="50%" stopColor="#81FFB4" />
            <stop offset="75%" stopColor="#48D1CC" />
            <stop offset="100%" stopColor="#C77DFF" />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer ring */}
        <circle
          cx="120"
          cy="120"
          r="110"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.5"
          fill="none"
          opacity="0.8"
        />

        {/* Inner filled circle */}
        <circle
          cx="120"
          cy="120"
          r="95"
          fill="#0A0A0A"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />

        {/* Decorative inner ring */}
        <circle
          cx="120"
          cy="120"
          r="80"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
          fill="none"
          strokeDasharray="4 4"
        />

        {/* Badge icon (star) */}
        <path
          d="M120 55 L130 90 L167 90 L137 112 L148 147 L120 127 L92 147 L103 112 L73 90 L110 90 Z"
          fill="#ffffff"
          filter={`url(#${glowId})`}
          opacity="0.9"
        />

        {/* Event name */}
        <text
          x="120"
          y="175"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="12"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontWeight="700"
        >
          {eventName.length > 22 ? eventName.slice(0, 22) + "…" : eventName}
        </text>

        {/* Community name */}
        <text
          x="120"
          y="195"
          textAnchor="middle"
          fill="#a1a1aa"
          fontSize="9"
          fontFamily="'Inter', sans-serif"
        >
          {communityName}
        </text>

        {/* Token ID */}
        <text
          x="120"
          y="215"
          textAnchor="middle"
          fill="#71717a"
          fontSize="8"
          fontFamily="'Geist Mono', monospace"
        >
          #{eventId.toString().padStart(4, "0")}
        </text>
      </svg>
    </div>
  );
}
