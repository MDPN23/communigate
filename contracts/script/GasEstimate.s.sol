// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/CommunitySBT.sol";
import "../src/EventBadge.sol";
import "../src/CommuniGateFactory.sol";

/// @title GasEstimate -- Simulates all major operations and logs exact gas used in ETH
/// @dev Run with: forge script script/GasEstimate.s.sol -vvv
///      Formula: ETH cost = gas * gasPrice(gwei) / 1e9
contract GasEstimate is Script {

    address deployer = makeAddr("deployer");
    address affair;
    uint256 affairKey;
    address alice = makeAddr("alice");

    CommunitySBT  sbt;
    EventBadge    badge;
    CommuniGateFactory factory;

    uint256 constant DEPLOY_FEE = 0.01 ether;

    // ----------------------------------------------------------------
    // ENTRY POINT
    // ----------------------------------------------------------------
    function run() external {
        (affair, affairKey) = makeAddrAndKey("affair");
        vm.deal(deployer, 100 ether);
        vm.deal(alice, 10 ether);

        _deployPlatform();
        _setupCommunity();
        _memberActions();
    }

    // ----------------------------------------------------------------
    // Phase 1: Platform deployment (paid by CommuniGate once)
    // ----------------------------------------------------------------
    function _deployPlatform() internal {
        vm.startPrank(deployer);

        uint256 g;

        g = gasleft();
        CommunitySBT sbtImpl = new CommunitySBT();
        _log("[1] CommunitySBT impl deploy  ", g - gasleft());

        g = gasleft();
        EventBadge badgeImpl = new EventBadge();
        _log("[2] EventBadge impl deploy    ", g - gasleft());

        g = gasleft();
        factory = new CommuniGateFactory(
            address(sbtImpl), address(badgeImpl), DEPLOY_FEE, deployer
        );
        _log("[3] CommuniGateFactory deploy ", g - gasleft());

        vm.stopPrank();
    }

    // ----------------------------------------------------------------
    // Phase 2: Community setup + event lifecycle (paid by admin/affair)
    // ----------------------------------------------------------------
    function _setupCommunity() internal {
        vm.startPrank(deployer);

        uint256 g;

        g = gasleft();
        (address sbtProxy, address badgeProxy) = factory.deployCommunity{value: DEPLOY_FEE}(
            "TechClub", "TCID", "ipfs://QmBaseURI/"
        );
        _log("[4] deployCommunity() clone   ", g - gasleft());

        sbt   = CommunitySBT(sbtProxy);
        badge = EventBadge(badgeProxy);

        g = gasleft();
        sbt.addAffair(affair);
        _log("[5] addAffair() on SBT        ", g - gasleft());

        g = gasleft();
        badge.addAffair(affair);
        _log("[6] addAffair() on Badge      ", g - gasleft());

        vm.stopPrank();

        vm.startPrank(affair);

        g = gasleft();
        uint256 eid = badge.createEvent("Hackathon 2026", 100);
        _log("[7] createEvent()             ", g - gasleft());

        g = gasleft();
        badge.setClaimList(eid, "ipfs://QmClaimListHash123456789ABC");
        _log("[8] setClaimList() / activate ", g - gasleft());

        g = gasleft();
        badge.closeEvent(eid);
        _log("[9] closeEvent()              ", g - gasleft());

        // Fresh event for member tests
        uint256 eid2 = badge.createEvent("Workshop 2026", 50);
        badge.setClaimList(eid2, "ipfs://QmClaimListHash987654321DEF");

        vm.stopPrank();

        _memberActions_inner(eid2);
    }

    // ----------------------------------------------------------------
    // Phase 3: Per-member actions (paid by member)
    // ----------------------------------------------------------------
    function _memberActions() internal pure {
        // intentionally empty -- called via _setupCommunity flow
    }

    function _memberActions_inner(uint256 eid2) internal {
        uint256 g;

        // SBT claim
        bytes memory sbtSig = _signIdentity(alice, affairKey);
        vm.prank(alice);
        g = gasleft();
        sbt.claimIdentity(sbtSig);
        _log("[10] claimIdentity() SBT mint ", g - gasleft());

        // Badge claim
        bytes memory badgeSig = _signBadge(alice, eid2, affairKey);
        vm.prank(alice);
        g = gasleft();
        badge.claimBadge(eid2, badgeSig);
        _log("[11] claimBadge() badge mint  ", g - gasleft());

        // Revoke SBT
        vm.prank(affair);
        g = gasleft();
        sbt.revokeIdentity(alice);
        _log("[12] revokeIdentity() burn    ", g - gasleft());

        // Withdraw fees
        vm.prank(deployer);
        g = gasleft();
        factory.withdrawFees(deployer);
        _log("[13] withdrawFees()           ", g - gasleft());
    }

    // ----------------------------------------------------------------
    // Pretty-printer: gas units + ETH at 1, 5, 20 gwei
    // ----------------------------------------------------------------
    function _log(string memory label, uint256 gas) internal pure {
        // ETH = gas * gwei / 1e9  (expressed as fixed-point string)
        console.log("---------------------------------------------------");
        console.log(string.concat(label, ": ", vm.toString(gas), " gas"));
        console.log(string.concat("   @  1 gwei  => ", _toEthStr(gas,  1)));
        console.log(string.concat("   @  5 gwei  => ", _toEthStr(gas,  5)));
        console.log(string.concat("   @ 20 gwei  => ", _toEthStr(gas, 20)));
    }

    /// @dev Returns ETH cost as a human-readable string like "0.000123456 ETH"
    function _toEthStr(uint256 gas, uint256 gwei_price) internal pure returns (string memory) {
        // total wei = gas * gwei_price * 1e9
        uint256 totalWei = gas * gwei_price * 1e9;

        // integer ETH part
        uint256 ethPart  = totalWei / 1e18;

        // decimal part: take the remainder, show 9 significant digits (gwei precision)
        uint256 remainder = totalWei % 1e18;
        // pad to 9 digits (nanoETH = gwei resolution)
        string memory decimals = _padLeft(vm.toString(remainder / 1e9), 9);

        return string.concat(
            vm.toString(ethPart),
            ".",
            decimals,
            " ETH"
        );
    }

    /// @dev Left-pad a number string with zeros to `width` digits
    function _padLeft(string memory s, uint256 width) internal pure returns (string memory) {
        bytes memory b = bytes(s);
        if (b.length >= width) return s;
        bytes memory padded = new bytes(width);
        uint256 pad = width - b.length;
        for (uint256 i = 0; i < pad; i++) padded[i] = "0";
        for (uint256 i = 0; i < b.length; i++) padded[pad + i] = b[i];
        return string(padded);
    }

    // ----------------------------------------------------------------
    // EIP-712 signing helpers
    // ----------------------------------------------------------------
    function _signIdentity(address user, uint256 key) internal view returns (bytes memory) {
        bytes32 digest = keccak256(abi.encodePacked(
            "\x19\x01",
            sbt.DOMAIN_SEPARATOR(),
            keccak256(abi.encode(
                keccak256("IdentityClaim(address userAddress,uint256 nonce)"),
                user,
                sbt.nonce(user)
            ))
        ));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, digest);
        return abi.encodePacked(r, s, v);
    }

    function _signBadge(address user, uint256 eid, uint256 key) internal view returns (bytes memory) {
        bytes32 digest = keccak256(abi.encodePacked(
            "\x19\x01",
            badge.DOMAIN_SEPARATOR(),
            keccak256(abi.encode(
                keccak256("BadgeClaim(address userAddress,uint256 eventId,uint256 nonce)"),
                user,
                eid,
                badge.nonce(user)
            ))
        ));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, digest);
        return abi.encodePacked(r, s, v);
    }
}
