"use client";

import { useState, useCallback } from "react";
import { WalletState } from "@/lib/types";
import { MOCK_WALLETS } from "@/lib/mock/users";

/**
 * Mock wallet hook — simulates RainbowKit useAccount + useConnect.
 * Will be replaced by real RainbowKit when contracts are connected.
 */
export function useMockWallet() {
  const [wallet, setWallet] = useState<WalletState>(MOCK_WALLETS.guest);

  const connect = useCallback((role: keyof typeof MOCK_WALLETS = "admin") => {
    setWallet(MOCK_WALLETS[role]);
  }, []);

  const disconnect = useCallback(() => {
    setWallet(MOCK_WALLETS.guest);
  }, []);

  const switchRole = useCallback((role: keyof typeof MOCK_WALLETS) => {
    setWallet(MOCK_WALLETS[role]);
  }, []);

  return {
    ...wallet,
    connect,
    disconnect,
    switchRole,
  };
}
