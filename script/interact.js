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

        EcoToken ecoToken = EcoToken(0x5FbDB2315678afecb367f032d93F642f64180aa3);
        DAOGovernance daoGovernance = DAOGovernance(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512);
        ESGCredits esgCredits = ESGCredits(0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0);
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