"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WalletButton } from "@/components/shared/WalletButton";
import {
  LayoutDashboard,
  Ticket,
  QrCode,
  ImageIcon,
  Menu,
  X,
} from "lucide-react";

interface NavbarProps {
  address: string;
  isConnected: boolean;
  role: string;
  ensName?: string;
  onConnect: (role?: string) => void;
  onDisconnect: () => void;
  onSwitchRole?: (role: string) => void;
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/claim", label: "Claim", icon: Ticket },
  { href: "/scanner", label: "Scanner", icon: QrCode },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
];

export function Navbar({
  address,
  isConnected,
  role,
  ensName,
  onConnect,
  onDisconnect,
  onSwitchRole,
}: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      {/* Backdrop blur bar */}
      <div className="glass-noir">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center transition-transform group-hover:scale-110">
                <span className="text-black font-bold text-sm">CG</span>
              </div>
              <span className="text-lg font-bold tracking-tighter text-white hidden sm:block">
                CommuniGate
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-2">
              {NAV_LINKS.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      isActive
                        ? "text-white bg-white/10"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-x-0 -bottom-0.5 mx-auto h-[1px] w-1/2 rainbow-gradient opacity-80" />
                    )}
                    <link.icon className="w-4 h-4" strokeWidth={1.25} />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Wallet + Mobile Toggle */}
            <div className="flex items-center gap-3">
              <WalletButton
                address={address}
                isConnected={isConnected}
                role={role}
                ensName={ensName}
                onConnect={onConnect}
                onDisconnect={onDisconnect}
                onSwitchRole={onSwitchRole}
              />
              <button
                className="md:hidden text-slate-400 hover:text-slate-200"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-noir animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  <link.icon className="w-4 h-4" strokeWidth={1.25} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
