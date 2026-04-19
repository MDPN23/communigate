"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  glow?: boolean;
}

export function GlassCard({
  children,
  className,
  hoverable = false,
  glow = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative bg-card border border-white/5 rounded-2xl p-6 transition-all duration-500 overflow-hidden",
        hoverable && "hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] cursor-pointer group",
        className
      )}
      {...props}
    >
      {glow && (
        <div className="absolute inset-x-0 -top-px mx-auto h-[1px] w-1/3 rainbow-gradient opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
