# CommuniGate - Smart Contract Architecture (Foundry)

## 1. Core Contracts & The Proxy Pattern
To maintain economic viability for the PaaS model, deploying new communities MUST be extremely cheap. AI Agents MUST implement the **EIP-1167 Minimal Proxy Standard**. Never deploy full logic contracts for new communities.

- **`CommuniGateFactory.sol`**: The orchestrator. It holds the addresses of the implementation logic contracts. It uses OpenZeppelin's `Clones.clone()` to deploy cheap proxies. It collects a base ETH `msg.value` fee upon deployment.
- **`CommunitySBT.sol`**: The implementation contract for Identity. Inherits `ERC721Upgradeable`. MUST be strictly Non-Transferable (Soulbound). Override the `_update` or `_transfer` hooks to revert the transaction unless it is the initial minting or an admin revoking the token.
- **`EventBadge.sol`**: The implementation contract for Events. Inherits `ERC1155Upgradeable` and `EIP712Upgradeable`. 

## 2. Initialization & Access Control
Because implementation contracts are cloned, standard constructors will not work for state setup.
- **Constructor Rule:** Call `_disableInitializers()` strictly inside the `constructor()` of the implementation contracts to prevent malicious takeovers.
- **Initialization:** Use `initialize()` functions protected by the `initializer` modifier to setup the cloned proxies.
- **RBAC:** Utilize `@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol`. Define `DEFAULT_ADMIN_ROLE`, `COMMUNITY_ADMIN`, and `COMMUNITY_AFFAIR`.

## 3. Gas Optimization & Best Practices
- **Storage Packing:** Group data types efficiently. (e.g., inside an Event struct, pack `uint32 currentMinted`, `uint32 maxCapacity`, and `bool isActive` together to share a single 256-bit storage slot).
- **Custom Errors:** Strictly use Custom Errors (e.g., `error Unauthorized();`, `error EventClosed();`) instead of `require(..., "String")`.
- **Calldata:** Always use `calldata` instead of `memory` for reference types (arrays, strings) in external functions.
- **Events:** Emit robust Solidity Events (e.g., `event BadgeClaimed(address indexed user, uint256 indexed eventId)`) since we do not use on-chain arrays to track users.