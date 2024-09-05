// contracts/DAOGovernance.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DAOGovernance {
    IERC20 public ecoToken;
    uint256 public proposalCount;
    uint256 public quorumPercentage = 10;  // 10% of total supply needed to pass a proposal

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 voteCount;
        bool executed;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public votes;

    constructor(address _ecoTokenAddress) {
        ecoToken = IERC20(_ecoTokenAddress);
    }

    function submitProposal(string memory description) public {
        require(ecoToken.balanceOf(msg.sender) >= 1000 * 10**18, "Insufficient ECO tokens to submit a proposal");
        proposals[proposalCount] = Proposal(proposalCount, msg.sender, description, 0, false);
        proposalCount++;
    }

    function vote(uint256 proposalId) public {
        require(ecoToken.balanceOf(msg.sender) > 0, "You need EcoTokens to vote");
        require(!votes[proposalId][msg.sender], "Already voted");

        proposals[proposalId].voteCount += ecoToken.balanceOf(msg.sender);
        votes[proposalId][msg.sender] = true;
    }

    function executeProposal(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.voteCount >= (totalSupply() * quorumPercentage) / 100, "Quorum not reached");
        require(!proposal.executed, "Already executed");

        // Execute the proposal
        proposal.executed = true;
    }

    function totalSupply() internal view returns (uint256) {
        return ecoToken.totalSupply();
    }
}
