import { WalletState } from "@/lib/types";

/** Default mock wallet — simulates a connected Community Admin */
export const MOCK_WALLET: WalletState = {
  address: "0x1234567890abcdef1234567890abcdef12345678",
  isConnected: true,
  role: "admin",
  ensName: "alice.eth",
};

/** Alternative mock wallets for testing different roles */
export const MOCK_WALLETS: Record<string, WalletState> = {
  admin: {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    isConnected: true,
    role: "admin",
    ensName: "alice.eth",
  },
  affair: {
    address: "0xabc1230000000000000000000000000000000001",
    isConnected: true,
    role: "affair",
  },
  member: {
    address: "0xdef4560000000000000000000000000000000002",
    isConnected: true,
    role: "member",
  },
  guest: {
    address: "",
    isConnected: false,
    role: "guest",
  },
};
