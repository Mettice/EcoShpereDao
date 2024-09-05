// contracts/EcoToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EcoToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("EcoToken", "ECO") {
        _mint(msg.sender, initialSupply);
    }
}
