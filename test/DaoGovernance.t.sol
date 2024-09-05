// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../contracts/DAOGovernance.sol";
import "../contracts/EcoToken.sol";

contract DAOGovernanceTest is Test {
    DAOGovernance dao;
    EcoToken token;
    address owner;
    address voter1;
    address voter2;

    function setUp() public {
        owner = address(this);
        voter1 = address(0x123);
        voter2 = address(0x456);

        token = new EcoToken(1000000); // 1 million initial supply
        dao = new DAOGovernance(address(token));

        token.mint(voter1, 10000 * 10**18);
        token.mint(voter2, 10000 * 10**18);
    }

    function testSubmitProposal() public {
        // Voter 1 submits a proposal
        vm.prank(voter1);
        dao.submitProposal("Increase funding for carbon credits");
        Proposal memory proposal = dao.proposals(0);

        assertEq(proposal.id, 0);
        assertEq(proposal.description, "Increase funding for carbon credits");
    }

    function testVoteOnProposal() public {
        // Voter 1 submits a proposal
        vm.prank(voter1);
        dao.submitProposal("Increase funding for carbon credits");

        // Voter 1 votes
        vm.prank(voter1);
        dao.vote(0);

        Proposal memory proposal = dao.proposals(0);
        assertEq(proposal.voteCount, token.balanceOf(voter1));
    }

    function testExecuteProposal() public {
        // Voter 1 submits a proposal
        vm.prank(voter1);
        dao.submitProposal("Increase funding for carbon credits");

        // Voter 1 and Voter 2 vote
        vm.prank(voter1);
        dao.vote(0);

        vm.prank(voter2);
        dao.vote(0);

        // Execute the proposal
        vm.prank(owner);
        dao.executeProposal(0);

        Proposal memory proposal = dao.proposals(0);
        assertEq(proposal.executed, true);
    }
}
