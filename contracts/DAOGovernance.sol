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

    event ProposalSubmitted(uint256 id, address proposer, string description);
    event Voted(uint256 proposalId, address voter, uint256 voteCount);
    event ProposalExecuted(uint256 proposalId);

    constructor(address _ecoTokenAddress) {
        ecoToken = IERC20(_ecoTokenAddress);
    }

    // Submit a proposal to the DAO
    function submitProposal(string memory description) public {
        require(ecoToken.balanceOf(msg.sender) >= 1000 * 10**18, "Insufficient ECO tokens to submit a proposal");

        proposals[proposalCount] = Proposal(proposalCount, msg.sender, description, 0, false);
        emit ProposalSubmitted(proposalCount, msg.sender, description);

        proposalCount++;
    }

    // Vote on a proposal using EcoToken balance
    function vote(uint256 proposalId) public {
        require(proposalId < proposalCount, "Invalid proposal ID");
        require(ecoToken.balanceOf(msg.sender) > 0, "You need EcoTokens to vote");
        require(!votes[proposalId][msg.sender], "Already voted");

        uint256 voterTokens = ecoToken.balanceOf(msg.sender);
        proposals[proposalId].voteCount += voterTokens;
        votes[proposalId][msg.sender] = true;

        emit Voted(proposalId, msg.sender, voterTokens);
    }

    // Execute the proposal if the quorum is met
    function executeProposal(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposalId < proposalCount, "Invalid proposal ID");
        require(proposal.voteCount >= (totalSupply() * quorumPercentage) / 100, "Quorum not reached");
        require(!proposal.executed, "Proposal already executed");

        // Execute the proposal logic (this would be specific to your DAO)
        proposal.executed = true;

        emit ProposalExecuted(proposalId);
    }

    // Helper function to get the total supply of the token
    function totalSupply() internal view returns (uint256) {
        return ecoToken.totalSupply();
    }
}
