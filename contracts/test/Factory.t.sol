// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "../src/CommunitySBT.sol";
import "../src/EventBadge.sol";
import "../src/CommuniGateFactory.sol";

/// @title CommuniGateFactory Tests
contract FactoryTest is Test {
    CommuniGateFactory factory;
    CommunitySBT sbtImpl;
    EventBadge badgeImpl;

    address superAdmin = makeAddr("superAdmin");
    address communityAdmin = makeAddr("communityAdmin");
    address alice = makeAddr("alice");

    uint256 constant DEPLOY_FEE = 0.01 ether;

    function setUp() public {
        // Deploy implementation contracts
        sbtImpl = new CommunitySBT();
        badgeImpl = new EventBadge();

        // Deploy factory
        factory = new CommuniGateFactory(
            address(sbtImpl),
            address(badgeImpl),
            DEPLOY_FEE,
            superAdmin
        );
    }

    // ─── Deployment Tests ─────────────────────────────────────────────────────

    function test_FactoryInitialState() public view {
        assertEq(factory.sbtImplementation(), address(sbtImpl));
        assertEq(factory.badgeImplementation(), address(badgeImpl));
        assertEq(factory.deployFee(), DEPLOY_FEE);
        assertEq(factory.superAdmin(), superAdmin);
        assertTrue(factory.hasRole(factory.DEFAULT_ADMIN_ROLE(), superAdmin));
    }

    function test_DeployCommunity() public {
        vm.deal(communityAdmin, 1 ether);
        vm.prank(communityAdmin);

        (address sbtProxy, address badgeProxy) = factory.deployCommunity{value: DEPLOY_FEE}(
            "TechClub",
            "TCID",
            "ipfs://QmBaseURI/"
        );

        assertTrue(sbtProxy != address(0));
        assertTrue(badgeProxy != address(0));
        assertEq(factory.communitySBT(communityAdmin), sbtProxy);
        assertEq(factory.communityBadge(communityAdmin), badgeProxy);
    }

    function test_DeployCommunity_AccumulatesFees() public {
        vm.deal(communityAdmin, 1 ether);
        vm.prank(communityAdmin);
        factory.deployCommunity{value: DEPLOY_FEE}("TechClub", "TCID", "ipfs://...");

        assertEq(address(factory).balance, DEPLOY_FEE);
    }

    function test_DeployCommunity_RevertsIfInsufficientFee() public {
        vm.deal(communityAdmin, 1 ether);
        vm.prank(communityAdmin);

        vm.expectRevert(
            abi.encodeWithSelector(CommuniGateFactory.InsufficientFee.selector, DEPLOY_FEE, 0)
        );
        factory.deployCommunity{value: 0}("TechClub", "TCID", "ipfs://...");
    }

    function test_DeployCommunity_RevertsIfAlreadyDeployed() public {
        vm.deal(communityAdmin, 1 ether);
        vm.startPrank(communityAdmin);
        factory.deployCommunity{value: DEPLOY_FEE}("TechClub", "TCID", "ipfs://...");

        vm.expectRevert(CommuniGateFactory.AlreadyDeployed.selector);
        factory.deployCommunity{value: DEPLOY_FEE}("TechClub2", "TC2", "ipfs://...");
        vm.stopPrank();
    }

    // ─── Admin Tests ──────────────────────────────────────────────────────────

    function test_SetDeployFee() public {
        vm.prank(superAdmin);
        factory.setDeployFee(0.05 ether);
        assertEq(factory.deployFee(), 0.05 ether);
    }

    function test_SetDeployFee_RevertsIfNotAdmin() public {
        vm.prank(alice);
        vm.expectRevert();
        factory.setDeployFee(0.05 ether);
    }

    function test_WithdrawFees() public {
        vm.deal(communityAdmin, 1 ether);
        vm.prank(communityAdmin);
        factory.deployCommunity{value: DEPLOY_FEE}("TechClub", "TCID", "ipfs://...");

        uint256 balanceBefore = superAdmin.balance;
        vm.prank(superAdmin);
        factory.withdrawFees(superAdmin);

        assertEq(superAdmin.balance, balanceBefore + DEPLOY_FEE);
        assertEq(address(factory).balance, 0);
    }

    function test_Pause_PreventsDeployment() public {
        vm.prank(superAdmin);
        factory.pause();

        vm.deal(communityAdmin, 1 ether);
        vm.prank(communityAdmin);
        vm.expectRevert();
        factory.deployCommunity{value: DEPLOY_FEE}("TechClub", "TCID", "ipfs://...");
    }
}
