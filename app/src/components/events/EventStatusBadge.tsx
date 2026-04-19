"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { EventStatus } from "@/lib/types";

const STATUS_MAP: Record<EventStatus, { label: string; className: string }> = {
  [EventStatus.Draft]: {
    label: "Draft",
    className: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  },
  [EventStatus.Active]: {
    label: "Active",
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  [EventStatus.Closed]: {
    label: "Closed",
    className: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  [EventStatus.Archived]: {
    label: "Archived",
    className: "bg-red-500/20 text-red-300 border-red-500/30",
  },
};

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const config = STATUS_MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === EventStatus.Active && "bg-emerald-400 animate-pulse",
        status === EventStatus.Draft && "bg-slate-400",
        status === EventStatus.Closed && "bg-amber-400",
        status === EventStatus.Archived && "bg-red-400",
      )} />
      {config.label}
    </span>
  );
}
