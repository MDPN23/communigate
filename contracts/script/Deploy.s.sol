// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "../src/CommunitySBT.sol";
import "../src/EventBadge.sol";
import "../src/CommuniGateFactory.sol";

/// @title Deploy -- Chain-agnostic deployment script for CommuniGate
///
/// @dev Supports both Ethereum Sepolia and Arbitrum Sepolia.
///      The script auto-detects the chain from block.chainid and adjusts
///      the deploy fee accordingly (Arbitrum L2 gas is much cheaper).
///
/// Usage:
///   # Ethereum Sepolia
///   forge script script/Deploy.s.sol:Deploy \
///       --rpc-url $SEPOLIA_RPC_URL \
///       --broadcast \
///       --verify \
///       --etherscan-api-key $ETHERSCAN_API_KEY \
///       -vvvv
///
///   # Arbitrum Sepolia
///   forge script script/Deploy.s.sol:Deploy \
///       --rpc-url $ARBITRUM_SEPOLIA_RPC_URL \
///       --broadcast \
///       --verify \
///       --etherscan-api-key $ARBISCAN_API_KEY \
///       -vvvv
///
///   # Using named network aliases from foundry.toml
///   forge script script/Deploy.s.sol:Deploy --network sepolia --broadcast --verify
///   forge script script/Deploy.s.sol:Deploy --network arbitrum_sepolia --broadcast --verify

contract Deploy is Script {

    // ----------------------------------------------------------------
    // Chain IDs
    // ----------------------------------------------------------------
    uint256 constant CHAIN_ETH_SEPOLIA  = 11155111;
    uint256 constant CHAIN_ARB_SEPOLIA  = 421614;

    // ----------------------------------------------------------------
    // Deploy fees per chain
    // L1 Sepolia: 0.01 ETH  (gas is expensive on L1)
    // Arbitrum  : 0.01 ETH  (same nominal; gas cost in ETH is negligible on L2)
    // ----------------------------------------------------------------
    uint256 constant FEE_L1  = 0.01 ether;
    uint256 constant FEE_L2  = 0.01 ether;

    function run() external {
        uint256 deployerPrivKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivKey);

        (string memory networkName, uint256 deployFee) = _networkConfig();

        console.log("=======================================================");
        console.log("  CommuniGate -- Deployment");
        console.log("=======================================================");
        console.log("  Network    :", networkName);
        console.log("  Chain ID   :", block.chainid);
        console.log("  Deployer   :", deployer);
        console.log("  Deploy fee :", deployFee);
        console.log("=======================================================");

        vm.startBroadcast(deployerPrivKey);

        // 1. Deploy implementation contracts
        //    (_disableInitializers in constructor prevents direct takeover)
        CommunitySBT sbtImpl = new CommunitySBT();
        console.log("  [1] CommunitySBT impl :", address(sbtImpl));

        EventBadge badgeImpl = new EventBadge();
        console.log("  [2] EventBadge impl   :", address(badgeImpl));

        // 2. Deploy factory (single public entry point for communities)
        CommuniGateFactory factory = new CommuniGateFactory(
            address(sbtImpl),
            address(badgeImpl),
            deployFee,
            deployer  // deployer becomes SuperAdmin (DEFAULT_ADMIN_ROLE)
        );
        console.log("  [3] Factory           :", address(factory));

        vm.stopBroadcast();

        // 3. Print .env.local values for the frontend
        console.log("");
        console.log("=======================================================");
        console.log("  Add to app/.env.local:");
        console.log("=======================================================");
        console.log("  NEXT_PUBLIC_CHAIN_ID=", block.chainid);
        console.log("  NEXT_PUBLIC_FACTORY_ADDRESS=", address(factory));
        console.log("  NEXT_PUBLIC_SBT_IMPLEMENTATION=", address(sbtImpl));
        console.log("  NEXT_PUBLIC_BADGE_IMPLEMENTATION=", address(badgeImpl));
    }

    // ----------------------------------------------------------------
    // Internal: resolve network name + deploy fee from chain ID
    // ----------------------------------------------------------------
    function _networkConfig()
        internal
        view
        returns (string memory name, uint256 fee)
    {
        if (block.chainid == CHAIN_ETH_SEPOLIA) {
            return ("Ethereum Sepolia (testnet)", FEE_L1);
        }

        if (block.chainid == CHAIN_ARB_SEPOLIA) {
            return ("Arbitrum Sepolia (testnet)", FEE_L2);
        }

        // Unknown / local anvil — allow with default fee
        return ("Unknown / Local", FEE_L1);
    }
}
