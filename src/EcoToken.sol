// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EcoToken is ERC20, Ownable {
    mapping(address => uint256) public stakedBalances;
    mapping(address => uint256) public stakingStartTime;
    mapping(uint256 => bool) public verifiedProjects;
    mapping(uint256 => uint256) public projectSupply;

    uint256 public constant MAX_SUPPLY = 1000000000 * 10 ** 18; // 1 billion tokens
    uint256 public constant MAX_PROJECT_SUPPLY = 100000000 * 10 ** 18; // 100 million tokens per project
    uint256 public constant STAKING_DURATION = 30 days;

    event ProjectVerified(uint256 projectId);
    event CrossChainTransferInitiated(address indexed from, address indexed to, uint256 amount, uint256 destinationChainId);
    event TokensStaked(address indexed user, uint256 amount, uint256 time);
    event TokensUnstaked(address indexed user, uint256 amount, uint256 time);

    constructor(uint256 initialSupply) ERC20("EcoToken", "ECO") Ownable(msg.sender) {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds max supply");
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount, uint256 projectId) public onlyOwner {
        require(verifiedProjects[projectId], "Project must be verified");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        require(projectSupply[projectId] + amount <= MAX_PROJECT_SUPPLY, "Exceeds project supply limit");
        _mint(to, amount);
        projectSupply[projectId] += amount;
    }

    function verifyProject(uint256 projectId) external onlyOwner {
        verifiedProjects[projectId] = true;
        emit ProjectVerified(projectId);
    }

    function initiateCrossChainTransfer(address to, uint256 amount, uint256 destinationChainId) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance for cross-chain transfer");
        _burn(msg.sender, amount);
        emit CrossChainTransferInitiated(msg.sender, to, amount, destinationChainId);
    }

    function completeCrossChainTransfer(address to, uint256 amount, uint256 /* sourceChainId */ ) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    // Staking functionality
    function stakeTokens(uint256 amount) public {
        require(balanceOf(msg.sender) >= amount, "Not enough tokens to stake");
        require(stakedBalances[msg.sender] == 0, "Already staked");

        _transfer(msg.sender, address(this), amount);
        stakedBalances[msg.sender] = amount;
        stakingStartTime[msg.sender] = block.timestamp;

        emit TokensStaked(msg.sender, amount, block.timestamp);
    }

    function unstakeTokens() public {
        require(stakedBalances[msg.sender] > 0, "No tokens staked");
        require(block.timestamp >= stakingStartTime[msg.sender] + STAKING_DURATION, "Staking period not over");

        uint256 amount = stakedBalances[msg.sender];
        stakedBalances[msg.sender] = 0;

        _transfer(address(this), msg.sender, amount);

        emit TokensUnstaked(msg.sender, amount, block.timestamp);
    }

    function votingPower(address _account) external view returns (uint256) {
    return stakedBalances[_account];
}

}
