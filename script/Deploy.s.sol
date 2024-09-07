// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/EcoToken.sol";
import "../src/DAOGovernance.sol";
import "../src/ESGCredits.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address deployer = tx.origin; // Capture the deployer address

        // Deploy EcoToken
        EcoToken ecoToken = new EcoToken(1000000 * 10 ** 18); // 1 million tokens
        console.log("EcoToken deployed to:", address(ecoToken));

        // Deploy DAOGovernance
        DAOGovernance daoGovernance = new DAOGovernance(address(ecoToken));
        console.log("DAO Governance deployed to:", address(daoGovernance));

        // Deploy ESGCredits
        ESGCredits esgCredits = new ESGCredits();
        console.log("ESG Credits deployed to:", address(esgCredits));

        // Setup initial state
        console.log("Setting up initial state...");

        // Verify a project (if required by the logic of your EcoToken contract)
        ecoToken.verifyProject(1);
        console.log("Verified project with ID 1");

        // Mint some EcoTokens to the deployer (ensure the deployer has tokens before the proposal)
        ecoToken.mint(deployer, 10000 * 10 ** 18, 1); // Mint 10,000 tokens for project ID 1
        console.log("Minted 10,000 EcoTokens to deployer");

        // Submit an initial proposal
        daoGovernance.submitProposal("Initial proposal for testing");
        console.log("Submitted initial proposal");

        // Mint some ESG Credits (ensure this logic is compatible with your contract)
        esgCredits.mint(1, 1000, "0x");
        console.log("Minted 1000 ESG Credits of type 1");

        // Log the quorum percentage
        uint256 quorumPercentage = daoGovernance.quorumPercentage();
        console.log("Quorum percentage set to:", quorumPercentage);

        // Calculate and log the current quorum
        uint256 totalSupply = ecoToken.totalSupply();
        uint256 currentQuorum = (totalSupply * quorumPercentage) / 100;
        console.log("Current quorum (in tokens):", currentQuorum);

        console.log("Deployment and initial setup complete!");

        vm.stopBroadcast();
    }
}
