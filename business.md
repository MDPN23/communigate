# CommuniGate - Comprehensive Business Logic & Processes

## 1. Product Vision & PaaS Model
CommuniGate is a decentralized "Identity and Event Verification" Platform as a Service (PaaS). It allows real-world communities to issue tamper-proof digital passports (SBTs) and event badges (ERC-1155) without running traditional backend servers. The smart contracts enforce access, security, and the economic model natively on the EVM.

## 2. Granular Role-Based Access Control (RBAC)
The system uses OpenZeppelin's `AccessControlUpgradeable`.

### A. SuperAdmin (`DEFAULT_ADMIN_ROLE`)
- **Entity:** The CommuniGate Platform Owner.
- **Capabilities:**
  - Upgrades the implementation contracts (if using UUPS).
  - Pauses the Factory contract in case of a critical vulnerability.
  - Modifies the base PaaS deployment fee.
  - Can permanently blacklist a malicious community (preventing them from minting new badges).

### B. Community Admin (`COMMUNITY_ADMIN_ROLE`)
- **Entity:** The Head/President of a registered community.
- **Capabilities:**
  - Grants/Revokes the `COMMUNITY_AFFAIR_ROLE` to event committees.
  - Updates the Community BaseURI (changing the default visual template of the SBTs).
  - Withdraws any accumulated native tokens (ETH) from their specific proxy contract (if event tickets are sold).

### C. Community Affair (`COMMUNITY_AFFAIR_ROLE`)
- **Entity:** Event operators or committee members.
- **Capabilities:**
  - Creates new Events and manages their lifecycle states.
  - Generates offline cryptographic signatures for members to claim badges.
  - Performs "Soft Deletes" (Revokes) on member SBTs if they violate community rules.

## 3. The Economic Model (PaaS Monetization)
Since there is no backend subscription, the platform monetizes directly on-chain:
- **Community Setup Fee:** When a new community calls `deployCommunity()` on the Factory, they must pass `msg.value` (e.g., 0.01 ETH). This fee is sent directly to the SuperAdmin's treasury.
- **Gas Sponsoring (Future Phase):** Currently, members pay their own gas on Sepolia. The architecture must allow for a future Paymaster implementation (ERC-4337) where the Community Admin funds a gas tank to sponsor member transactions.

## 4. Cryptographic Claim Flow & IPFS Distribution (EIP-712)
To ensure anti-replay attack security and provide a seamless Web2-like UX, all claims use typed data signatures distributed via IPFS, eliminating the need for users to manually paste claim codes.

### The Claim UX Lifecycle (Identity & Badges)
1. **Off-chain Generation (Admin):** Community Affair selects eligible users on the frontend. The Next.js app uses the Admin's wallet to sign an EIP-712 message for each user.
   - Identity Message: `{ userAddress: "0x...", nonce: 0 }`
   - Badge Message: `{ userAddress: "0x...", eventId: 1, nonce: 1 }`
2. **IPFS Bundling (Admin):** The frontend bundles these signatures into a single JSON object mapping addresses to signatures, and uploads it to IPFS (Pinata) via a Server Action.
3. **On-Chain Update (Admin):** The Admin calls `updateClaimList(eventId, "ipfs://Qm...")` on the smart contract, paying a small gas fee to store the URI. (For SBTs, this is stored on the `CommunitySBT` contract).
4. **Auto-Discovery (Member):** - Member connects wallet.
   - Frontend reads the IPFS CID from the contract.
   - Frontend fetches the JSON. If the connected `msg.sender` exists in the JSON keys, the UI renders a "Claim Badge" button.
5. **On-Chain Verification (Member):** User clicks "Claim". The contract:
   - Recovers the signer using `ECDSA.recover()`.
   - Checks `hasRole(COMMUNITY_AFFAIR_ROLE, recoveredSigner)`.
   - Validates `userAddress == msg.sender`.
   - Mints the SBT/Badge and increments the user's `nonce`.

## 5. Event Lifecycle State Machine
Events within the `EventBadge.sol` contract follow strict states. An event is defined by a struct containing: `id`, `name`, `maxCapacity`, `currentMinted`, `claimListCID` (string), and `status`.

- **`Draft`:** Created by Affair. Metadata (URI) can still be changed. No minting allowed.
- **`Active`:** Changed by Affair. The `claimListCID` must be set. Members can now submit signatures to mint badges.
- **`Closed`:** Manually triggered by Affair OR automatically triggered if `currentMinted == maxCapacity`. Minting reverts.
- **`Archived` (Soft Delete):** Event is hidden from the main UI queries. Badges remain in user wallets, but the event itself is deprecated.

## 6. O2O (Online-to-Offline) QR Authentication
When members attend a physical event, they do not bring paper tickets.
1. Member opens the CommuniGate Web App, which generates a QR code containing their public address.
2. The gate guard (Community Affair) uses the scanner page (`/scanner`).
3. The scanner reads the address and queries the blockchain: `EventBadge.balanceOf(scannedAddress, currentEventId)`.
4. If `balance > 0`, the UI turns green. No state changes occur on-chain during scanning (Zero Gas cost for verification).

## 7. Edge Cases & Security Fallbacks
- **Compromised Affair Key:** If a Community Affair's private key is leaked, the Community Admin can immediately call `revokeRole()` for that address. All pending signatures signed by that key instantly become invalid.
- **Revoked Members:** If a member is expelled, the Affair calls `revokeIdentity(userAddress)`. The SBT is burned (sent to `address(0)`). The user will automatically fail all future event claims because the gatekeeping check (`balanceOf(SBT) > 0`) will fail.