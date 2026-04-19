// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "../src/CommunitySBT.sol";
import "../src/EventBadge.sol";
import "../src/CommuniGateFactory.sol";

/// @title CommunitySBT Tests — Identity Passport Soulbound Token
contract CommunitySBTTest is Test {
    CommuniGateFactory factory;
    CommunitySBT sbtImpl;
    EventBadge badgeImpl;

    CommunitySBT sbt; // the cloned proxy

    address superAdmin = makeAddr("superAdmin");
    address communityAdmin = makeAddr("communityAdmin");
    address affair;
    uint256 affairPrivKey;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    uint256 constant DEPLOY_FEE = 0.01 ether;

    function setUp() public {
        // Generate a keypair for the affair account (needed for signing)
        (affair, affairPrivKey) = makeAddrAndKey("affair");

        // Deploy implementation contracts + factory
        sbtImpl = new CommunitySBT();
        badgeImpl = new EventBadge();
        factory = new CommuniGateFactory(
            address(sbtImpl),
            address(badgeImpl),
            DEPLOY_FEE,
            superAdmin
        );

        // Deploy community
        vm.deal(communityAdmin, 1 ether);
        vm.prank(communityAdmin);
        (address sbtProxy,) = factory.deployCommunity{value: DEPLOY_FEE}(
            "TechClub",
            "TCID",
            "ipfs://QmBaseURI/"
        );
        sbt = CommunitySBT(sbtProxy);

        // Grant AFFAIR role
        vm.prank(communityAdmin);
        sbt.addAffair(affair);
    }

    // ─── Helper: generate EIP-712 identity claim signature ────────────────────

    function _signIdentityClaim(address user) internal view returns (bytes memory) {
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
        return abi.encodePacked(r, s, v);
    }

    // ─── Claim Tests ──────────────────────────────────────────────────────────

    function test_ClaimIdentity_Success() public {
        bytes memory sig = _signIdentityClaim(alice);

        vm.prank(alice);
        sbt.claimIdentity(sig);

        assertTrue(sbt.isMember(alice));
        assertEq(sbt.balanceOf(alice), 1);
        assertEq(sbt.nonce(alice), 1);
    }

    function test_ClaimIdentity_IncreasesNonce() public {
        bytes memory sig = _signIdentityClaim(alice);
        vm.prank(alice);
        sbt.claimIdentity(sig);

        assertEq(sbt.nonce(alice), 1);
    }

    function test_ClaimIdentity_ReplayAttackFails() public {
        bytes memory sig = _signIdentityClaim(alice);
        vm.prank(alice);
        sbt.claimIdentity(sig);

        // Alice tries to re-use the same signature (nonce mismatch → invalid sig)
        vm.prank(alice);
        // First revert: already has SBT
        vm.expectRevert(CommunitySBT.AlreadyHasSBT.selector);
        sbt.claimIdentity(sig);
    }

    function test_ClaimIdentity_RevertsIfNotSignedByAffair() public {
        // Sign with a random key (not AFFAIR)
        (, uint256 randomKey) = makeAddrAndKey("random");
        bytes32 domainSep = sbt.DOMAIN_SEPARATOR();
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("IdentityClaim(address userAddress,uint256 nonce)"),
                alice,
                sbt.nonce(alice)
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSep, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(randomKey, digest);
        bytes memory badSig = abi.encodePacked(r, s, v);

        vm.prank(alice);
        vm.expectRevert(CommunitySBT.InvalidSignature.selector);
        sbt.claimIdentity(badSig);
    }

    function test_ClaimIdentity_RevertsIfAlreadyHasSBT() public {
        bytes memory sig = _signIdentityClaim(alice);
        vm.prank(alice);
        sbt.claimIdentity(sig);

        vm.prank(alice);
        vm.expectRevert(CommunitySBT.AlreadyHasSBT.selector);
        sbt.claimIdentity(sig);
    }

    // ─── Soulbound Tests ──────────────────────────────────────────────────────

    function test_TransferReverts_Soulbound() public {
        bytes memory sig = _signIdentityClaim(alice);
        vm.prank(alice);
        sbt.claimIdentity(sig);

        uint256 tokenId = sbt.tokenOfOwner(alice);

        vm.prank(alice);
        vm.expectRevert(CommunitySBT.Soulbound.selector);
        sbt.transferFrom(alice, bob, tokenId);
    }

    function test_SafeTransferReverts_Soulbound() public {
        bytes memory sig = _signIdentityClaim(alice);
        vm.prank(alice);
        sbt.claimIdentity(sig);

        uint256 tokenId = sbt.tokenOfOwner(alice);

        vm.prank(alice);
        vm.expectRevert(CommunitySBT.Soulbound.selector);
        sbt.safeTransferFrom(alice, bob, tokenId);
    }

    // ─── Revoke Tests ─────────────────────────────────────────────────────────

    function test_RevokeIdentity_Burns() public {
        bytes memory sig = _signIdentityClaim(alice);
        vm.prank(alice);
        sbt.claimIdentity(sig);

        assertTrue(sbt.isMember(alice));

        vm.prank(affair);
        sbt.revokeIdentity(alice);

        assertFalse(sbt.isMember(alice));
        assertEq(sbt.balanceOf(alice), 0);
    }

    function test_RevokeIdentity_RevertsIfNotMember() public {
        vm.prank(affair);
        vm.expectRevert(CommunitySBT.NotAMember.selector);
        sbt.revokeIdentity(alice);
    }

    function test_RevokeIdentity_RevertsIfNotAffair() public {
        bytes memory sig = _signIdentityClaim(alice);
        vm.prank(alice);
        sbt.claimIdentity(sig);

        vm.prank(bob);
        vm.expectRevert();
        sbt.revokeIdentity(alice);
    }

    // ─── Admin Tests ──────────────────────────────────────────────────────────

    function test_UpdateBaseURI() public {
        vm.prank(communityAdmin);
        sbt.updateBaseURI("ipfs://QmNewBaseURI/");

        // tokenURI will include the new base
        bytes memory sig = _signIdentityClaim(alice);
        vm.prank(alice);
        sbt.claimIdentity(sig);

        assertEq(sbt.tokenURI(sbt.tokenOfOwner(alice)), "ipfs://QmNewBaseURI/1");
    }

    function test_AddAffair_And_RemoveAffair() public {
        address newAffair = makeAddr("newAffair");

        vm.prank(communityAdmin);
        sbt.addAffair(newAffair);
        assertTrue(sbt.hasRole(sbt.COMMUNITY_AFFAIR_ROLE(), newAffair));

        vm.prank(communityAdmin);
        sbt.removeAffair(newAffair);
        assertFalse(sbt.hasRole(sbt.COMMUNITY_AFFAIR_ROLE(), newAffair));
    }

    function test_RemovedAffair_SignatureInvalid() public {
        // Grant and then immediately revoke affair
        address tempAffair;
        uint256 tempKey;
        (tempAffair, tempKey) = makeAddrAndKey("tempAffair");

        vm.prank(communityAdmin);
        sbt.addAffair(tempAffair);

        // Sign a claim for alice using tempAffair
        bytes32 domainSep = sbt.DOMAIN_SEPARATOR();
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("IdentityClaim(address userAddress,uint256 nonce)"),
                alice,
                sbt.nonce(alice)
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSep, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(tempKey, digest);
        bytes memory sig = abi.encodePacked(r, s, v);

        // Revoke affair BEFORE alice claims
        vm.prank(communityAdmin);
        sbt.removeAffair(tempAffair);

        // Alice's claim should fail — sig is now invalid
        vm.prank(alice);
        vm.expectRevert(CommunitySBT.InvalidSignature.selector);
        sbt.claimIdentity(sig);
    }
}
