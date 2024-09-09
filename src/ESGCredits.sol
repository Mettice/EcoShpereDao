// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ESGCredits is ERC1155, Ownable {
    mapping(uint256 => bool) public verifiedProjects;
    mapping(uint256 => uint256) public projectSupply;
    uint256 public constant MAX_PROJECT_SUPPLY = 100000000 * 10 ** 18; // 100 million tokens per project

    event ProjectVerified(uint256 projectId);
    event CreditsMinted(address indexed to, uint256 projectId, uint256 amount);

    // Pass the owner's address to Ownable
    constructor(address initialOwner) ERC1155("https://example.com/api/item/{id}.json") Ownable(initialOwner) {}

    // Verify a project before allowing minting
    function verifyProject(uint256 projectId) external onlyOwner {
        verifiedProjects[projectId] = true;
        emit ProjectVerified(projectId);
    }

    // Mint ESG credits, only for verified projects
    function mint(address to, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
        require(verifiedProjects[id], "Project must be verified");
        require(projectSupply[id] + amount <= MAX_PROJECT_SUPPLY, "Exceeds project supply limit");

        _mint(to, id, amount, data);
        projectSupply[id] += amount;

        emit CreditsMinted(to, id, amount);
    }

    // Batch mint ESG credits
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner {
        for (uint256 i = 0; i < ids.length; i++) {
            require(verifiedProjects[ids[i]], "All projects must be verified");
            require(projectSupply[ids[i]] + amounts[i] <= MAX_PROJECT_SUPPLY, "Exceeds project supply limit");
            projectSupply[ids[i]] += amounts[i];
        }

        _mintBatch(to, ids, amounts, data);
    }

    // Burn ESG credits if needed
    function burn(address from, uint256 id, uint256 amount) public onlyOwner {
        _burn(from, id, amount);
    }

    // Batch burn ESG credits
    function burnBatch(address from, uint256[] memory ids, uint256[] memory amounts) public onlyOwner {
        _burnBatch(from, ids, amounts);
    }

    function getOwner() public view returns (address) {
    return owner();
}
}
