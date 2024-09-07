// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../contracts/EcoToken.sol";
import "../contracts/DAOGovernance.sol";
import "../contracts/ESGCredits.sol";

contract InteractionScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        EcoToken ecoToken = EcoToken(YOUR_ECOTOKEN_ADDRESS);
        DAOGovernance daoGovernance = DAOGovernance(YOUR_DAOGOVERNANCE_ADDRESS);
        ESGCredits esgCredits = ESGCredits(YOUR_ESGCREDITS_ADDRESS);

        // EcoToken interactions
        ecoToken.mint(msg.sender, 1000 * 10**18); // Mint 1000 tokens
        uint256 balance = ecoToken.balanceOf(msg.sender);
        console.log("EcoToken balance:", balance);

        // DAOGovernance interactions
        daoGovernance.submitProposal("Test proposal");
        daoGovernance.vote(0); // Vote on first proposal

        // ESGCredits interactions
        esgCredits.mint(1, 100, "");
        uint256 esgBalance = esgCredits.balanceOf(msg.sender, 1);
        console.log("ESG Credit balance:", esgBalance);

        vm.stopBroadcast();
    }
}