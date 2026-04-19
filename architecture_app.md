# CommuniGate - Frontend Architecture (Next.js)

## 1. Tech Stack & Configuration
- **Framework:** Next.js 14+ (App Router).
- **Styling:** TailwindCSS. Adhere to the cinematic, glassmorphism aesthetic (minimalist, dark/slate tones, ethereal accents).
- **Web3 Engine:** Wagmi v2 & Viem.
- **Wallet Connection:** RainbowKit. Configure Sepolia as the primary and only supported chain for the MVP.

## 2. Interaction Flows (Client vs Server)
- **Client Components (`"use client"`):** All Web3 interactions (Wagmi hooks, RainbowKit, QR Scanning, Signature generation) MUST occur in Client Components.
- **Read Operations:** Use Wagmi's `useReadContract`. Provide skeleton loaders while data is fetching.
- **Write Operations:** Use Wagmi's `useWriteContract` and `useWaitForTransactionReceipt`. Provide clear toast notifications (Pending -> Waiting for confirmation -> Success/Reverted).

## 3. The IPFS Workflow (Pinata)
To bypass the need for a database, Community Affairs approve members by uploading an EIP-712 signature list to IPFS.
1. **Admin Action (Client):** Admin selects users to approve. Frontend uses Viem's `signTypedData` to loop and generate EIP-712 signatures.
2. **Upload (Server Action):** Frontend passes the constructed JSON object to a Next.js Server Action. The Server Action securely uses the Pinata API Key (stored in `.env`) to upload the JSON and returns the `ipfs://` CID.
3. **On-Chain Update (Client):** Admin triggers a transaction to save that CID to the smart contract via `updateEventClaimList(eventId, cid)`.
4. **Member Claim (Client):** Member's UI fetches the CID from the contract, fetches the JSON via a public IPFS gateway, finds their signature, and enables the "Claim" button.

## 4. Specific Libraries
- **QR Scanner:** Use `html5-qrcode` or `react-qr-reader`. Ensure it requests camera permissions gracefully and renders within a Tailwind-styled card.
- **Dynamic SVGs:** Badges should be rendered as raw SVG code inside React components before being converted to Base64 (if generating entirely on-chain) or uploaded to IPFS.