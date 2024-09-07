// contracts/ESGCredits.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract ESGCredits is ERC1155 {
    constructor() ERC1155("https://example.com/api/item/{id}.json") {}

    function mint(uint256 id, uint256 amount, bytes memory data) public {
        _mint(msg.sender, id, amount, data);
    }
}
