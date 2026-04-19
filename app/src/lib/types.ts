// ─────────────────────────────────────────────────────────
// CommuniGate — TypeScript Interfaces
// Mirrors Solidity structs exactly for seamless Wagmi swap.
// ─────────────────────────────────────────────────────────

/** Mirrors EventBadge.EventStatus enum */
export enum EventStatus {
  Draft = 0,
  Active = 1,
  Closed = 2,
  Archived = 3,
}

/** Mirrors EventBadge.EventInfo struct (storage-packed in Solidity) */
export interface EventInfo {
  id: number;
  name: string;
  maxCapacity: number;
  currentMinted: number;
  claimListCID: string;
  status: EventStatus;
  createdAt: Date;
  imageURI?: string;
}

/** Community data derived from CommunitySBT + Factory mappings */
export interface CommunityInfo {
  adminAddress: string;
  name: string;
  symbol: string;
  baseURI: string;
  sbtProxy: string;
  badgeProxy: string;
  memberCount: number;
  eventCount: number;
  totalBadgesMinted: number;
  createdAt: Date;
  description?: string;
  imageURI?: string;
}

/** User role within the RBAC system */
export type UserRole = "superadmin" | "admin" | "affair" | "member" | "guest";

/** Connected wallet state */
export interface WalletState {
  address: string;
  isConnected: boolean;
  role: UserRole;
  ensName?: string;
}

/** A community member with their role */
export interface CommunityMember {
  address: string;
  role: UserRole;
  sbtTokenId: number;
  joinedAt: Date;
  displayName?: string;
}

/** Badge (ERC-1155 token) owned by a user */
export interface UserBadge {
  eventId: number;
  eventName: string;
  communityName: string;
  communityId: string;
  mintedAt: Date;
  imageURI: string;
  tokenURI: string;
}

/** Transaction status for the mock tx lifecycle */
export type TxStatus = "idle" | "pending" | "confirming" | "success" | "error";

/** Mock transaction result */
export interface TxResult {
  status: TxStatus;
  hash?: string;
  error?: string;
}

/** Navigation item type */
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
}
