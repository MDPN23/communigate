"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TxStatus } from "@/lib/types";
import { formatAddress } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

interface TransactionToastProps {
  status: TxStatus;
  hash?: string;
  error?: string;
  label?: string;
  onClose?: () => void;
}

const STATUS_CONFIG: Record<TxStatus, {
  icon: React.ReactNode;
  title: string;
  color: string;
  borderColor: string;
}> = {
  idle: { icon: null, title: "", color: "", borderColor: "" },
  pending: {
    icon: <Loader2 className="w-5 h-5 animate-spin text-amber-400" />,
    title: "Waiting for approval...",
    color: "text-amber-400",
    borderColor: "border-l-amber-400",
  },
  confirming: {
    icon: <Loader2 className="w-5 h-5 animate-spin text-blue-400" />,
    title: "Confirming transaction...",
    color: "text-blue-400",
    borderColor: "border-l-blue-400",
  },
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    title: "Transaction confirmed!",
    color: "text-emerald-400",
    borderColor: "border-l-emerald-400",
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-red-400" />,
    title: "Transaction failed",
    color: "text-red-400",
    borderColor: "border-l-red-400",
  },
};

export function TransactionToast({
  status,
  hash,
  error,
  label,
  onClose,
}: TransactionToastProps) {
  if (status === "idle") return null;
  const config = STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 w-80",
        "glass rounded-xl p-4 border-l-4",
        config.borderColor,
        "animate-slide-up"
      )}
    >
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="flex-1 min-w-0">
          <p className={cn("font-semibold text-sm", config.color)}>
            {config.title}
          </p>
          {label && (
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          )}
          {hash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 mt-1 font-mono"
            >
              {formatAddress(hash, 8)}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {error && (
            <p className="text-xs text-red-300 mt-1">{error}</p>
          )}
        </div>
        {(status === "success" || status === "error") && onClose && (
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-xs"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
