// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EcoToken is ERC20, Ownable {
    mapping(uint256 => bool) public verifiedProjects;
    mapping(uint256 => uint256) public projectSupply;
    uint256 public constant MAX_SUPPLY = 1000000000 * 10 ** 18; // 1 billion tokens
    uint256 public constant MAX_PROJECT_SUPPLY = 100000000 * 10 ** 18; // 100 million tokens per project

    event ProjectVerified(uint256 projectId);
    event CrossChainTransferInitiated(
        address indexed from, address indexed to, uint256 amount, uint256 destinationChainId
    );

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
}
