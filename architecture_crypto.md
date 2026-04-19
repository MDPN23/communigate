# CommuniGate - Cryptographic & Anti-Replay Architecture

## 1. Overview (EIP-712)
The bridge between off-chain approvals (Community Affair) and on-chain minting relies entirely on EIP-712 Typed Data Signatures. This mechanism is critical. It must prevent replay attacks across different events, different users, and different EVM networks.

## 2. The Signature Data Structure
Both Viem (Next.js) and Solidity (Foundry) MUST adhere to the exact same domain separator and struct formatting. If a single byte mismatches, the signature will fail to recover.

### Domain Separator
- `name`: "CommuniGate"
- `version`: "1"
- `chainId`: `block.chainid` (CRITICAL: Prevents a signature on Sepolia from being re-used on Mainnet/Polygon).
- `verifyingContract`: `address(this)` (CRITICAL: Must point to the cloned proxy address, NOT the implementation address).

### Claim Badge Struct
```solidity
struct BadgeClaim {
    address userAddress;
    uint256 eventId;
    uint256 nonce;
}