// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DAOGovernance {
    IERC20 public ecoToken;
    uint256 public proposalCount;
    uint256 public quorumPercentage = 10; // 10% of total supply needed to pass a proposal
    uint256 public constant TIMELOCK_DURATION = 2 days;

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 voteCount;
        bool executed;
        uint256 queuingTime;
        bool queued;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public votes;
    mapping(uint256 => mapping(address => uint256)) public initialBalances; // Track balances per proposal

    event ProposalSubmitted(uint256 id, address proposer, string description);
    event Voted(uint256 proposalId, address voter, uint256 voteCount);
    event ProposalQueued(uint256 proposalId, uint256 executionTime);
    event ProposalExecuted(uint256 indexed proposalId);




    constructor(address _ecoTokenAddress) {
        ecoToken = IERC20(_ecoTokenAddress);

    }

    function submitProposal(string memory description) public {
        require(ecoToken.balanceOf(msg.sender) >= 1000 * 10 ** 18, "Insufficient ECO tokens to submit a proposal");

        proposals[proposalCount] = Proposal(proposalCount, msg.sender, description, 0, false, 0, false);
        emit ProposalSubmitted(proposalCount, msg.sender, description);

        proposalCount++;
    }

    function vote(uint256 proposalId) public {
        require(proposalId < proposalCount, "Invalid proposal ID");
        require(ecoToken.balanceOf(msg.sender) > 0, "You need EcoTokens to vote");
        require(!votes[proposalId][msg.sender], "Already voted");

        uint256 currentBalance = ecoToken.balanceOf(msg.sender);
        uint256 initialBalance = initialBalances[proposalId][msg.sender];

        if (initialBalance == 0) {
            // First-time voter, record the balance and allow them to vote
            initialBalances[proposalId][msg.sender] = currentBalance;
            proposals[proposalId].voteCount += currentBalance; // Allow them to vote with their full balance
        } else {
            // Calculate the vote power based on the balance increase
            uint256 votePower = currentBalance - initialBalance;
            require(votePower > 0, "No new tokens to vote with");

            proposals[proposalId].voteCount += votePower;
        }

        votes[proposalId][msg.sender] = true;

        emit Voted(proposalId, msg.sender, currentBalance);
    }

    function queueProposal(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        uint256 currentTotalSupply = ecoToken.totalSupply();
        uint256 quorum = (currentTotalSupply * quorumPercentage) / 100;

        require(proposal.voteCount >= quorum, "Quorum not reached");
        require(!proposal.queued, "Already queued");
        require(!proposal.executed, "Already executed");

        proposal.queuingTime = block.timestamp;
        proposal.queued = true;

        emit ProposalQueued(proposalId, block.timestamp + TIMELOCK_DURATION);
    }

    function executeProposal(uint256 proposalId, address target, bytes memory data) public {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.queued, "Proposal not queued");
        require(!proposal.executed, "Already executed");
        require(block.timestamp >= proposal.queuingTime + TIMELOCK_DURATION, "Timelock period not passed");

        uint256 currentTotalSupply = ecoToken.totalSupply();
        uint256 quorum = (currentTotalSupply * quorumPercentage) / 100;
        require(proposal.voteCount >= quorum, "Quorum not reached");

        // Execute the proposal by making an external call
        (bool success,) = target.call(data);
        require(success, "Proposal execution failed");

        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }

    function getProposal(uint256 proposalId) public view returns (Proposal memory) {
        require(proposalId < proposalCount, "Invalid proposal ID");
        return proposals[proposalId];
    }

    function getTotalSupply() public view returns (uint256) {
        return ecoToken.totalSupply();
    }
}
