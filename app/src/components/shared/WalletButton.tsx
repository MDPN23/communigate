"use client";

import React, { useState } from "react";
import { cn, formatAddress } from "@/lib/utils";
import { Wallet, ChevronDown, LogOut, User, Shield, Users } from "lucide-react";

interface WalletButtonProps {
  address: string;
  isConnected: boolean;
  role: string;
  ensName?: string;
  onConnect: (role?: string) => void;
  onDisconnect: () => void;
  onSwitchRole?: (role: string) => void;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  superadmin: { label: "Super Admin", color: "text-red-400", icon: <Shield className="w-3 h-3" /> },
  admin: { label: "Admin", color: "text-amber-400", icon: <Shield className="w-3 h-3" /> },
  affair: { label: "Affair", color: "text-blue-400", icon: <Users className="w-3 h-3" /> },
  member: { label: "Member", color: "text-emerald-400", icon: <User className="w-3 h-3" /> },
  guest: { label: "Guest", color: "text-slate-400", icon: <User className="w-3 h-3" /> },
};

export function WalletButton({
  address,
  isConnected,
  role,
  ensName,
  onConnect,
  onDisconnect,
  onSwitchRole,
}: WalletButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const roleInfo = ROLE_CONFIG[role] || ROLE_CONFIG.guest;

  if (!isConnected) {
    return (
      <button
        id="connect-wallet-btn"
        onClick={() => onConnect("admin")}
        className={cn(
          "flex items-center gap-2 rounded-full",
          "bg-white text-black px-8 py-2.5 font-semibold text-sm",
          "hover:scale-105 transition-transform duration-300"
        )}
      >
        <Wallet className="w-4 h-4" strokeWidth={1.25} />
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        id="wallet-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-full",
          "border border-white/5 bg-black/40 hover:border-white/20 transition-all duration-300",
          "text-sm font-medium"
        )}
      >
        <div className="w-7 h-7 rounded-full rainbow-gradient flex items-center justify-center">
          <span className="text-xs font-bold text-black">
            {(ensName || address).slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-slate-200 font-mono text-xs">
            {ensName || formatAddress(address)}
          </span>
          <span className={cn("text-[10px] flex items-center gap-1", roleInfo.color)}>
            {roleInfo.icon}
            {roleInfo.label}
          </span>
        </div>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 text-slate-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 glass-noir rounded-xl py-2 z-50 animate-slide-up border border-white/10">
          <div className="px-4 py-2 border-b border-white/5">
            <p className="text-xs text-muted-foreground">Switch Role (Mock)</p>
          </div>
          {Object.entries(ROLE_CONFIG).filter(([key]) => key !== "guest").map(([key, config]) => (
            <button
              key={key}
              onClick={() => { onSwitchRole?.(key); setIsOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left",
                "hover:bg-white/5 transition-colors",
                role === key && "bg-white/5"
              )}
            >
              <span className={config.color}>{config.icon}</span>
              <span className="text-slate-300">{config.label}</span>
              {role === key && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>
          ))}
          <div className="border-t border-white/5 mt-1 pt-1">
            <button
              onClick={() => { onDisconnect(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
