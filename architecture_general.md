# CommuniGate - General Architecture & Monorepo Structure

## 1. System Overview
CommuniGate is a strictly "No-Backend" / Serverless Web3 Platform as a Service (PaaS). It allows real-world communities (student organizations, sports clubs) to issue non-transferable Identity Passports (SBTs/ERC-721) and Event Badges (ERC-1155). These digital assets function as verifiable O2O (Online-to-Offline) tickets via QR code scanning.

## 2. The "No-Backend" Philosophy (CRITICAL)
AI Agents working on this repository MUST adhere to the following constraints:
- **No Database:** Do NOT initialize Prisma, Drizzle, Supabase, PostgreSQL, or MongoDB. 
- **State Layer:** The EVM Smart Contracts on the Sepolia Testnet act as the absolute single source of truth.
- **Storage Layer:** IPFS (via Pinata) is used exclusively for storing static JSON files (off-chain approval lists and metadata).
- **Client Layer:** Next.js application hosting the UI, wallet connections, and QR scanner.

## 3. Monorepo Directory Structure
Ensure all new files follow this exact monorepo structure to keep the frontend and smart contracts completely isolated but within the same workspace:

```text
/communigate-monorepo
├── /app                    # Next.js Frontend (React, Tailwind, Wagmi)
│   ├── /src
│   │   ├── /app            # Pages, Layouts, Server Actions
│   │   ├── /components     # UI components, RainbowKit buttons, QR Scanner
│   │   ├── /hooks          # Custom Wagmi hooks wrapper
│   │   └── /lib            # EIP-712 hashing utilities, Pinata API logic
├── /contracts              # Foundry Smart Contracts (Solidity)
│   ├── /src                # The 3 Core Contracts (Factory, SBT, Badge)
│   ├── /test               # Foundry .t.sol tests
│   └── /script             # Deployment scripts
├── architecture_general.md
├── architecture_sc.md
├── architecture_app.md
├── architecture_crypto.md
└── designSystem.md