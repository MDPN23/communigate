// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "../src/CommunitySBT.sol";
import "../src/EventBadge.sol";
import "../src/CommuniGateFactory.sol";

/// @title EventBadge Tests — ERC-1155 Event Attendance Badges
contract EventBadgeTest is Test {
    CommuniGateFactory factory;
    CommunitySBT sbtImpl;
    EventBadge badgeImpl;

    CommunitySBT sbt;
    EventBadge badge;

    address superAdmin = makeAddr("superAdmin");
    address communityAdmin = makeAddr("communityAdmin");
    address affair;
    uint256 affairPrivKey;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    uint256 constant DEPLOY_FEE = 0.01 ether;

    function setUp() public {
        (affair, affairPrivKey) = makeAddrAndKey("affair");

        sbtImpl = new CommunitySBT();
        badgeImpl = new EventBadge();
        factory = new CommuniGateFactory(
            address(sbtImpl),
            address(badgeImpl),
            DEPLOY_FEE,
            superAdmin
        );

        vm.deal(communityAdmin, 1 ether);
        vm.prank(communityAdmin);
        (address sbtProxy, address badgeProxy) = factory.deployCommunity{value: DEPLOY_FEE}(
            "TechClub",
            "TCID",
            "ipfs://QmBaseURI/"
        );
        sbt = CommunitySBT(sbtProxy);
        badge = EventBadge(badgeProxy);

        // Setup roles
        vm.startPrank(communityAdmin);
        sbt.addAffair(affair);
        badge.addAffair(affair);
        vm.stopPrank();

        // Give alice her SBT (she is a verified member)
        _claimSBT(alice);
    }

    // ─── Helper: SBT claim ────────────────────────────────────────────────────

    function _claimSBT(address user) internal {
        bytes32 domainSep = sbt.DOMAIN_SEPARATOR();
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("IdentityClaim(address userAddress,uint256 nonce)"),
                user,
                sbt.nonce(user)
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSep, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(affairPrivKey, digest);
        bytes memory sig = abi.encodePacked(r, s, v);
        vm.prank(user);
        sbt.claimIdentity(sig);
    }

    // ─── Helper: Badge claim signature ────────────────────────────────────────

    function _signBadgeClaim(address user, uint256 eventId) internal view returns (bytes memory) {
        bytes32 domainSep = badge.DOMAIN_SEPARATOR();
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("BadgeClaim(address userAddress,uint256 eventId,uint256 nonce)"),
                user,
                eventId,
                badge.nonce(user)
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSep, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(affairPrivKey, digest);
        return abi.encodePacked(r, s, v);
    }

    // ─── Event Lifecycle Tests ────────────────────────────────────────────────

    function test_CreateEvent_StartsAsDraft() public {
        vm.prank(affair);
        uint256 eventId = badge.createEvent("Hackathon 2026", 100);

        EventBadge.Event memory ev = badge.getEvent(eventId);
        assertEq(ev.name, "Hackathon 2026");
        assertEq(ev.maxCapacity, 100);
        assertEq(ev.currentMinted, 0);
        assertEq(uint8(ev.status), uint8(EventBadge.EventStatus.Draft));
    }

    function test_SetClaimList_ActivatesEvent() public {
        vm.prank(affair);
        uint256 eventId = badge.createEvent("Hackathon 2026", 100);

        vm.prank(affair);
        badge.setClaimList(eventId, "ipfs://QmClaimList123/");

        EventBadge.Event memory ev = badge.getEvent(eventId);
        assertEq(uint8(ev.status), uint8(EventBadge.EventStatus.Active));
        assertEq(ev.claimListCID, "ipfs://QmClaimList123/");
    }

    function test_ClaimBadge_ActiveEvent_WithSBT() public {
        vm.prank(affair);
        uint256 eventId = badge.createEvent("Hackathon 2026", 100);

        vm.prank(affair);
        badge.setClaimList(eventId, "ipfs://QmClaimList123/");

        bytes memory sig = _signBadgeClaim(alice, eventId);
        vm.prank(alice);
        badge.claimBadge(eventId, sig);

        assertTrue(badge.hasBadge(alice, eventId));
        assertEq(badge.balanceOf(alice, eventId), 1);
        assertEq(badge.nonce(alice), 1);
    }

    function test_ClaimBadge_DraftEvent_Reverts() public {
        vm.prank(affair);
        uint256 eventId = badge.createEvent("Hackathon 2026", 100);
        // Event is still Draft — no claim list set

        bytes memory sig = _signBadgeClaim(alice, eventId);
        vm.prank(alice);
        vm.expectRevert(EventBadge.EventNotActive.selector);
        badge.claimBadge(eventId, sig);
    }

    function test_ClaimBadge_WithoutSBT_Reverts() public {
        vm.prank(affair);
        uint256 eventId = badge.createEvent("Hackathon 2026", 100);

        vm.prank(affair);
        badge.setClaimList(eventId, "ipfs://QmClaimList123/");

        // Bob has no SBT
        bytes memory sig = _signBadgeClaim(bob, eventId);
        vm.prank(bob);
        vm.expectRevert(EventBadge.NotAMember.selector);
        badge.claimBadge(eventId, sig);
    }

    function test_ClaimBadge_DoubleClaim_Reverts() public {
        vm.prank(affair);
        uint256 eventId = badge.createEvent("Hackathon 2026", 100);

        vm.prank(affair);
        badge.setClaimList(eventId, "ipfs://QmClaimList123/");

        bytes memory sig = _signBadgeClaim(alice, eventId);
        vm.prank(alice);
        badge.claimBadge(eventId, sig);

        // Second claim with fresh signature (different nonce) should still fail:
        // balanceOf > 0 is checked first
        bytes memory sig2 = _signBadgeClaim(alice, eventId);
        vm.prank(alice);
        vm.expectRevert(EventBadge.AlreadyClaimedBadge.selector);
        badge.claimBadge(eventId, sig2);
    }

    function test_ClaimBadge_ReplayAttack_Fails() public {
        vm.prank(affair);
        uint256 eventId = badge.createEvent("Hackathon 2026", 100);

        vm.prank(affair);
        badge.setClaimList(eventId, "ipfs://QmClaimList123/");

        bytes memory sig = _signBadgeClaim(alice, eventId);
        vm.prank(alice);
        badge.claimBadge(eventId, sig);

        // Alice's nonce is now 1. The original sig (nonce=0) should not work on event 2.
        vm.prank(affair);
        uint256 eventId2 = badge.createEvent("Workshop 2026", 50);
        vm.prank(affair);
        badge.setClaimList(eventId2, "ipfs://QmClaimList456/");

        vm.prank(alice);
        vm.expectRevert(EventBadge.InvalidSignature.selector);
        badge.claimBadge(eventId2, sig); // old sig, wrong nonce + wrong eventId
    }

    function test_ClaimBadge_AutoClosesAtCapacity() public {
        vm.prank(affair);
        uint256 eventId = badge.createEvent("Small Event", 1); // max 1

        vm.prank(affair);
        badge.setClaimList(eventId, "ipfs://QmClaimList123/");

        bytes memory sig = _signBadgeClaim(alice, eventId);
        vm.prank(alice);
        badge.claimBadge(eventId, sig);

        // Event should auto-close
        EventBadge.Event memory ev = badge.getEvent(eventId);
        assertEq(uint8(ev.status), uint8(EventBadge.EventStatus.Closed));
    }

    function test_CloseEvent_ManualClose() public {
        vm.prank(affair);
        uint256 eventId = badge.createEvent("Hackathon 2026", 100);

        vm.prank(affair);
        badge.setClaimList(eventId, "ipfs://QmClaimList123/");

        vm.prank(affair);
        badge.closeEvent(eventId);

        // Claiming should now fail
        bytes memory sig = _signBadgeClaim(alice, eventId);
        vm.prank(alice);
        vm.expectRevert(EventBadge.EventNotActive.selector);
        badge.claimBadge(eventId, sig);
    }

    function test_ArchiveEvent() public {
        vm.prank(affair);
        uint256 eventId = badge.createEvent("Old Event", 10);

        vm.prank(affair);
        badge.archiveEvent(eventId);

        EventBadge.Event memory ev = badge.getEvent(eventId);
        assertEq(uint8(ev.status), uint8(EventBadge.EventStatus.Archived));
    }

    function test_GetClaimListCID() public {
        vm.prank(affair);
        uint256 eventId = badge.createEvent("Hackathon 2026", 100);

        vm.prank(affair);
        badge.setClaimList(eventId, "ipfs://QmClaimList123/");

        assertEq(badge.getClaimListCID(eventId), "ipfs://QmClaimList123/");
    }

    function test_GetEvent_RevertsIfDoesNotExist() public {
        vm.expectRevert(EventBadge.EventDoesNotExist.selector);
        badge.getEvent(999);
    }
}
