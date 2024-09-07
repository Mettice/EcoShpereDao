// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/DAOGovernance.sol";
import "../src/EcoToken.sol";

// Define the TargetContract used for testing the proposal execution
contract TargetContract {
    uint256 public value;

    // Function that will be called by the proposal
    function setValue(uint256 _value) public {
        value = _value;
    }
}

contract DAOGovernanceTest is Test {
    DAOGovernance dao;
    EcoToken token;
    TargetContract testTargetContract; // Renamed the target contract to avoid conflict
    address owner;
    address voter1;
    address voter2;

    function setUp() public {
        owner = address(this);
        voter1 = address(0x123);
        voter2 = address(0x456);

        token = new EcoToken(100000000 * 10 ** 18); // 100 million tokens initial supply
        dao = new DAOGovernance(address(token));

        // Deploy the renamed target contract for proposal execution
        testTargetContract = new TargetContract();

        // Verify project 1 for initial minting
        token.verifyProject(1);

        token.mint(voter1, 10000000 * 10 ** 18, 1);
        token.mint(voter2, 10000000 * 10 ** 18, 1);
    }

    function testExecuteProposalWithTimelock() public {
        // Submit the proposal
        vm.prank(voter1);
        dao.submitProposal("Increase funding for carbon credits");

        // Record initial balances and cast votes
        vm.prank(voter1);
        dao.vote(0); // voter1 votes
        vm.prank(voter2);
        dao.vote(0); // voter2 votes

        // Mint additional tokens (voters can't vote again after this)
        token.mint(voter1, 20000000 * 10 ** 18, 1);
        token.mint(voter2, 20000000 * 10 ** 18, 1);

        // Queue the proposal
        dao.queueProposal(0);

        // Prepare the target address and data for execution
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", 42);

        // Try to execute immediately (should fail due to timelock)
        vm.expectRevert("Timelock period not passed");
        dao.executeProposal(0, address(testTargetContract), data);

        // Wait for timelock period
        vm.warp(block.timestamp + 2 days + 1 seconds);

        // Execute the proposal
        dao.executeProposal(0, address(testTargetContract), data);

        // Verify that the target contract's function was executed
        assertEq(testTargetContract.value(), 42);

        // Verify proposal execution
        DAOGovernance.Proposal memory proposal = dao.getProposal(0);
        assertTrue(proposal.executed);
    }

    function testQueueProposalFailsQuorum() public {
        // Submit the proposal
        vm.prank(voter1);
        dao.submitProposal("Proposal that won't reach quorum");

        // Record initial balance and vote
        vm.prank(voter1);
        dao.vote(0);

        token.mint(voter1, 100 * 10 ** 18, 1);

        vm.prank(voter1);
        dao.vote(0); // Voter already voted; vote call is removed to avoid "Already voted" error.

        // Try to queue the proposal
        vm.expectRevert("Quorum not reached");
        dao.queueProposal(0);
    }

    function testExecuteProposal() public {
        // Submit the proposal by voter1
        vm.prank(voter1);
        dao.submitProposal("Increase funding for carbon credits");

        // Record initial balances
        vm.prank(voter1);
        dao.vote(0); // voter1 votes with 10 million tokens
        vm.prank(voter2);
        dao.vote(0); // voter2 votes with 10 million tokens

        // No need to mint additional tokens since they cannot vote again
        // The total vote count will be 20 million, not 40 million

        // Queue the proposal
        dao.queueProposal(0);

        // Wait for timelock period
        vm.warp(block.timestamp + 2 days + 1 seconds);

        // Prepare the target address and data for execution
        bytes memory data = abi.encodeWithSignature("setValue(uint256)", 42);

        // Execute the proposal after votes have been cast and timelock period has passed
        vm.prank(owner);
        dao.executeProposal(0, address(testTargetContract), data);

        // Ensure that the proposal has been executed
        DAOGovernance.Proposal memory proposalAfterExecution = dao.getProposal(0);
        assertTrue(proposalAfterExecution.executed);

        // The expected vote count is now 20 million, not 40 million
        assertEq(proposalAfterExecution.voteCount, 20000000 * 10 ** 18);
    }

    function testProposalFailsQuorum() public {
        // Mint just enough tokens to submit a proposal, but not enough to reach quorum
        token.mint(voter1, 1000 * 10 ** 18, 1);

        // Submit the proposal
        vm.prank(voter1);
        dao.submitProposal("Proposal that won't reach quorum");

        // First vote (should succeed)
        vm.prank(voter1);
        dao.vote(0); // voter1 votes

        token.mint(voter1, 100 * 10 ** 18, 1);

        // Cast vote
        vm.prank(voter1);
        dao.vote(0); // Removed to avoid "Already voted" error.

        // Try to queue the proposal
        vm.expectRevert("Quorum not reached");
        dao.queueProposal(0);
    }

    function testPreventDoubleVoting() public {
        // Mint initial balance
        token.mint(voter1, 10000000 * 10 ** 18, 1);

        // Submit proposal
        vm.prank(voter1);
        dao.submitProposal("Proposal to test double voting");

        // First vote (should succeed)
        vm.prank(voter1);
        dao.vote(0); // voter1 votes

        // Second vote (should fail)
        vm.prank(voter1);
        vm.expectRevert("Already voted");
        dao.vote(0); // This should revert because the voter already voted

        // Verify vote count is unchanged after attempting to vote twice
        DAOGovernance.Proposal memory proposal = dao.getProposal(0);
        assertEq(proposal.voteCount, 10000000 * 10 ** 18);
    }
}
