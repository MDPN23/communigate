// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./CommunitySBT.sol";
import "./EventBadge.sol";

/// @title CommuniGateFactory — PaaS Community Deployment Orchestrator
/// @notice Deploys cheap EIP-1167 minimal proxy clones of CommunitySBT and EventBadge
///         for each new community. Collects a one-time ETH setup fee.
/// @dev Uses OpenZeppelin Clones library. Implementation contracts are set once at
///      construction and stored as immutable to save gas on reads.
contract CommuniGateFactory is AccessControl, Pausable {
    using Clones for address;

    // ─── Immutable Implementation Addresses ───────────────────────────────────
    /// @notice The CommunitySBT logic contract (never changes after deploy).
    address public immutable sbtImplementation;

    /// @notice The EventBadge logic contract (never changes after deploy).
    address public immutable badgeImplementation;

    /// @notice The CommuniGate platform's super admin address.
    address public immutable superAdmin;

    // ─── State ────────────────────────────────────────────────────────────────
    /// @notice The ETH fee required to deploy a new community. Adjustable by SuperAdmin.
    uint256 public deployFee;

    /// @notice Maps community admin address => their deployed SBT proxy.
    mapping(address => address) public communitySBT;

    /// @notice Maps community admin address => their deployed Badge proxy.
    mapping(address => address) public communityBadge;

    // ─── Custom Errors ────────────────────────────────────────────────────────
    error InsufficientFee(uint256 required, uint256 provided);
    error AlreadyDeployed();
    error WithdrawFailed();
    error ZeroAddress();

    // ─── Events ───────────────────────────────────────────────────────────────
    event CommunityDeployed(
        address indexed admin,
        address indexed sbtProxy,
        address indexed badgeProxy,
        string communityName
    );
    event DeployFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @notice Deploys the factory and sets the implementation contracts.
    /// @param _sbtImplementation   Address of the deployed CommunitySBT logic contract.
    /// @param _badgeImplementation Address of the deployed EventBadge logic contract.
    /// @param _initialDeployFee    Initial ETH fee to deploy a community (e.g., 0.01 ether).
    /// @param _superAdmin          Address granted DEFAULT_ADMIN_ROLE (CommuniGate owner).
    constructor(
        address _sbtImplementation,
        address _badgeImplementation,
        uint256 _initialDeployFee,
        address _superAdmin
    ) {
        if (_sbtImplementation == address(0)) revert ZeroAddress();
        if (_badgeImplementation == address(0)) revert ZeroAddress();
        if (_superAdmin == address(0)) revert ZeroAddress();

        sbtImplementation = _sbtImplementation;
        badgeImplementation = _badgeImplementation;
        deployFee = _initialDeployFee;
        superAdmin = _superAdmin;

        _grantRole(DEFAULT_ADMIN_ROLE, _superAdmin);
    }

    // ─── Core: Community Deployment ───────────────────────────────────────────

    /// @notice Deploys a new community by cloning both implementation contracts.
    ///         The deployer (msg.sender) becomes the COMMUNITY_ADMIN of both contracts.
    /// @dev    Must send at least `deployFee` ETH. Fee is sent to the contract for later
    ///         withdrawal by the SuperAdmin via `withdrawFees()`.
    /// @param communityName Human-readable name for the SBT token (e.g., "TechClub").
    /// @param symbol        ERC-721 symbol for the SBT (e.g., "TCID").
    /// @param baseURI       Initial IPFS base URI for SBT metadata.
    /// @return sbtProxy     Address of the deployed CommunitySBT clone.
    /// @return badgeProxy   Address of the deployed EventBadge clone.
    function deployCommunity(
        string calldata communityName,
        string calldata symbol,
        string calldata baseURI
    ) external payable whenNotPaused returns (address sbtProxy, address badgeProxy) {
        // Validate fee
        if (msg.value < deployFee) {
            revert InsufficientFee(deployFee, msg.value);
        }

        // Prevent duplicate deployment per admin
        if (communitySBT[msg.sender] != address(0)) revert AlreadyDeployed();

        // 1. Clone the SBT implementation (EIP-1167 minimal proxy)
        sbtProxy = sbtImplementation.clone();
        CommunitySBT(sbtProxy).initialize(
            communityName,
            symbol,
            baseURI,
            msg.sender,  // communityAdmin
            superAdmin   // superAdmin (platform-level DEFAULT_ADMIN)
        );

        // 2. Clone the Badge implementation
        badgeProxy = badgeImplementation.clone();
        EventBadge(badgeProxy).initialize(
            msg.sender,  // communityAdmin
            superAdmin,  // superAdmin
            sbtProxy     // link to this community's SBT contract
        );

        // 3. Register in mappings
        communitySBT[msg.sender] = sbtProxy;
        communityBadge[msg.sender] = badgeProxy;

        emit CommunityDeployed(msg.sender, sbtProxy, badgeProxy, communityName);
    }

    // ─── Admin Functions ──────────────────────────────────────────────────────

    /// @notice Update the ETH fee required to deploy a new community.
    /// @param newFee The new fee in wei.
    function setDeployFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 oldFee = deployFee;
        deployFee = newFee;
        emit DeployFeeUpdated(oldFee, newFee);
    }

    /// @notice Withdraw all accumulated ETH fees to a specified address.
    /// @param to The recipient address.
    function withdrawFees(address to) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (to == address(0)) revert ZeroAddress();
        uint256 amount = address(this).balance;

        (bool success, ) = to.call{value: amount}("");
        if (!success) revert WithdrawFailed();

        emit FeesWithdrawn(to, amount);
    }

    /// @notice Pause the factory — prevents new community deployments.
    /// @dev Used in case of a critical vulnerability discovery.
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpause the factory to resume community deployments.
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /// @notice Returns both proxy contract addresses for a community admin.
    function getCommunityContracts(address admin)
        external
        view
        returns (address sbt, address badge)
    {
        return (communitySBT[admin], communityBadge[admin]);
    }

    /// @notice Predict the address of the SBT clone before deployment (for UX).
    function predictSBTAddress(address admin) external view returns (address) {
        return sbtImplementation.predictDeterministicAddress(
            keccak256(abi.encodePacked(admin, "sbt")),
            address(this)
        );
    }
}
