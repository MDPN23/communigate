// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./CommunitySBT.sol";

/// @title EventBadge — ERC-1155 Event Attendance Badge with EIP-712 Claim Flow
/// @notice Issues non-fungible event attendance badges to verified community members.
///         Each event gets a unique token ID. Members must hold a valid SBT to claim.
/// @dev Compatible with EIP-1167 minimal proxy. Uses EIP-712 signature verification.
contract EventBadge is
    Initializable,
    ERC1155Upgradeable,
    AccessControlUpgradeable,
    EIP712Upgradeable
{
    using ECDSA for bytes32;

    // ─── Roles ────────────────────────────────────────────────────────────────
    bytes32 public constant COMMUNITY_ADMIN_ROLE = keccak256("COMMUNITY_ADMIN_ROLE");
    bytes32 public constant COMMUNITY_AFFAIR_ROLE = keccak256("COMMUNITY_AFFAIR_ROLE");

    // ─── EIP-712 Type Hash ────────────────────────────────────────────────────
    bytes32 private constant BADGE_CLAIM_TYPEHASH =
        keccak256("BadgeClaim(address userAddress,uint256 eventId,uint256 nonce)");

    // ─── Event Status State Machine ───────────────────────────────────────────
    enum EventStatus {
        Draft,    // Created, metadata can be changed, no minting
        Active,   // claimListCID is set, members can claim
        Closed,   // No more minting (manual or capacity reached)
        Archived  // Soft-deleted, hidden from UI
    }

    // ─── Storage-packed Event Struct ──────────────────────────────────────────
    // name + claimListCID → dynamic strings (own slots)
    // maxCapacity (uint32) + currentMinted (uint32) + status (uint8) → packed in 1 slot
    struct Event {
        string name;          // slot n
        string claimListCID;  // slot n+1 (IPFS CID of the claim list JSON)
        uint32 maxCapacity;   // }
        uint32 currentMinted; // } packed together in one 256-bit slot
        EventStatus status;   // }
    }

    // ─── State ────────────────────────────────────────────────────────────────
    CommunitySBT public sbtContract;
    uint256 public nextEventId;

    /// @notice Tracks each user's nonce to prevent badge signature replay.
    mapping(address => uint256) public nonce;

    /// @notice eventId => Event struct
    mapping(uint256 => Event) public events;

    // ─── Custom Errors ────────────────────────────────────────────────────────
    error EventDoesNotExist();
    error EventNotActive();
    error EventAtCapacity();
    error InvalidSignature();
    error NotAMember();
    error AlreadyClaimedBadge();
    error CIDRequired();
    error InvalidStatusTransition();

    // ─── Events (Solidity) ────────────────────────────────────────────────────
    event EventCreated(uint256 indexed eventId, string name, uint32 maxCapacity);
    event ClaimListUpdated(uint256 indexed eventId, string cid);
    event BadgeClaimed(address indexed user, uint256 indexed eventId);
    event EventStatusChanged(uint256 indexed eventId, EventStatus newStatus);

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @dev Prevents direct initialization of the implementation contract.
    constructor() {
        _disableInitializers();
    }

    // ─── Initializer ─────────────────────────────────────────────────────────

    /// @notice Initializes the cloned proxy for a community's event badge system.
    /// @param communityAdmin Address granted COMMUNITY_ADMIN_ROLE.
    /// @param superAdmin     Address granted DEFAULT_ADMIN_ROLE (CommuniGate platform).
    /// @param sbtAddress     Address of the paired CommunitySBT clone for this community.
    function initialize(
        address communityAdmin,
        address superAdmin,
        address sbtAddress
    ) external initializer {
        __ERC1155_init("");
        __AccessControl_init();
        __EIP712_init("CommuniGate", "1");

        sbtContract = CommunitySBT(sbtAddress);
        nextEventId = 1;

        _grantRole(DEFAULT_ADMIN_ROLE, superAdmin);
        _grantRole(COMMUNITY_ADMIN_ROLE, communityAdmin);
    }

    // ─── Affair Functions ─────────────────────────────────────────────────────

    /// @notice Creates a new event in Draft status.
    /// @param name        Human-readable event name.
    /// @param maxCapacity Maximum number of badges that can be minted (0 = unlimited).
    /// @return eventId The ID of the newly created event.
    function createEvent(
        string calldata name,
        uint32 maxCapacity
    ) external onlyRole(COMMUNITY_AFFAIR_ROLE) returns (uint256 eventId) {
        eventId = nextEventId++;

        Event storage newEvent = events[eventId];
        newEvent.name = name;
        newEvent.maxCapacity = maxCapacity;
        newEvent.status = EventStatus.Draft;

        emit EventCreated(eventId, name, maxCapacity);
    }

    /// @notice Sets the IPFS CID for a claim list and activates the event.
    /// @dev The CID must point to a JSON mapping { "0xAddress": "0xSignature" }.
    ///      Can only be called when event is in Draft or Active status.
    /// @param eventId The event to update.
    /// @param cid     The IPFS CID string (e.g., "ipfs://Qm...").
    function setClaimList(
        uint256 eventId,
        string calldata cid
    ) external onlyRole(COMMUNITY_AFFAIR_ROLE) {
        Event storage ev = _getEvent(eventId);

        if (ev.status == EventStatus.Closed || ev.status == EventStatus.Archived) {
            revert InvalidStatusTransition();
        }
        if (bytes(cid).length == 0) revert CIDRequired();

        ev.claimListCID = cid;

        if (ev.status == EventStatus.Draft) {
            ev.status = EventStatus.Active;
            emit EventStatusChanged(eventId, EventStatus.Active);
        }

        emit ClaimListUpdated(eventId, cid);
    }

    /// @notice Manually close an event (no more minting).
    function closeEvent(uint256 eventId) external onlyRole(COMMUNITY_AFFAIR_ROLE) {
        Event storage ev = _getEvent(eventId);
        if (ev.status != EventStatus.Active) revert InvalidStatusTransition();

        ev.status = EventStatus.Closed;
        emit EventStatusChanged(eventId, EventStatus.Closed);
    }

    /// @notice Soft-delete an event (hide from UI, badges remain in wallets).
    function archiveEvent(uint256 eventId) external onlyRole(COMMUNITY_AFFAIR_ROLE) {
        Event storage ev = _getEvent(eventId);
        if (ev.status == EventStatus.Archived) revert InvalidStatusTransition();

        ev.status = EventStatus.Archived;
        emit EventStatusChanged(eventId, EventStatus.Archived);
    }

    // ─── Admin Functions ──────────────────────────────────────────────────────

    /// @notice Grant COMMUNITY_AFFAIR_ROLE to an event committee member.
    function addAffair(address account) external onlyRole(COMMUNITY_ADMIN_ROLE) {
        _grantRole(COMMUNITY_AFFAIR_ROLE, account);
    }

    /// @notice Revoke COMMUNITY_AFFAIR_ROLE — instantly invalidates all their pending sigs.
    function removeAffair(address account) external onlyRole(COMMUNITY_ADMIN_ROLE) {
        _revokeRole(COMMUNITY_AFFAIR_ROLE, account);
    }

    // ─── Member Functions ─────────────────────────────────────────────────────

    /// @notice Member claims an event badge using an off-chain EIP-712 signature.
    /// @dev    Requirements:
    ///         - Caller must hold a valid SBT from the paired CommunitySBT contract.
    ///         - Event must be Active.
    ///         - Signature must be from an account with COMMUNITY_AFFAIR_ROLE.
    ///         - Caller must not already hold a badge for this event.
    /// @param eventId   The ID of the event to claim a badge for.
    /// @param signature The EIP-712 signature from a Community Affair.
    function claimBadge(uint256 eventId, bytes calldata signature) external {
        address user = msg.sender;

        // 1. Must be a community member (hold SBT)
        if (!sbtContract.isMember(user)) revert NotAMember();

        // 2. Event must be active
        Event storage ev = _getEvent(eventId);
        if (ev.status != EventStatus.Active) revert EventNotActive();

        // 3. Check capacity (0 = unlimited)
        if (ev.maxCapacity > 0 && ev.currentMinted >= ev.maxCapacity) {
            revert EventAtCapacity();
        }

        // 4. One badge per user per event
        if (balanceOf(user, eventId) > 0) revert AlreadyClaimedBadge();

        // 5. Verify EIP-712 signature
        bytes32 digest = _hashTypedDataV4(
            keccak256(abi.encode(BADGE_CLAIM_TYPEHASH, user, eventId, nonce[user]))
        );
        address signer = digest.recover(signature);
        if (!hasRole(COMMUNITY_AFFAIR_ROLE, signer)) revert InvalidSignature();

        // 6. Anti-replay: increment nonce BEFORE minting
        nonce[user]++;

        // 7. Increment minted count and auto-close if at capacity
        ev.currentMinted++;
        if (ev.maxCapacity > 0 && ev.currentMinted >= ev.maxCapacity) {
            ev.status = EventStatus.Closed;
            emit EventStatusChanged(eventId, EventStatus.Closed);
        }

        // 8. Mint the badge (ERC-1155, amount = 1)
        _mint(user, eventId, 1, "");

        emit BadgeClaimed(user, eventId);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /// @notice Returns the full Event struct for a given event ID.
    function getEvent(uint256 eventId) external view returns (Event memory) {
        return _getEvent(eventId);
    }

    /// @notice Returns the IPFS CID for a given event's claim list.
    function getClaimListCID(uint256 eventId) external view returns (string memory) {
        return _getEvent(eventId).claimListCID;
    }

    /// @notice Returns whether a user holds a badge for a given event.
    function hasBadge(address user, uint256 eventId) external view returns (bool) {
        return balanceOf(user, eventId) > 0;
    }

    /// @notice Returns the EIP-712 domain separator for this contract.
    /// @dev Used by frontends and tests to construct digests for signature verification.
    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    function _getEvent(uint256 eventId) internal view returns (Event storage ev) {
        if (eventId == 0 || eventId >= nextEventId) revert EventDoesNotExist();
        return events[eventId];
    }

    // ─── Required Overrides ───────────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
