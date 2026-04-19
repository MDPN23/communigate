"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useMockWallet } from "@/hooks/useMockWallet";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const wallet = useMockWallet();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        address={wallet.address}
        isConnected={wallet.isConnected}
        role={wallet.role}
        ensName={wallet.ensName}
        onConnect={(role) => wallet.connect(role as "admin" | "affair" | "member")}
        onDisconnect={wallet.disconnect}
        onSwitchRole={(role) => wallet.switchRole(role as "admin" | "affair" | "member")}
      />
      <main className="flex-1 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
