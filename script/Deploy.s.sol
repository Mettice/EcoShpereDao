// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/EcoToken.sol";
import "../src/DAOGovernance.sol";
import "../src/ESGCredits.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy EcoToken with 1 million initial supply
        EcoToken ecoToken = new EcoToken(1000000 * 10 ** 18);
        console.log("EcoToken deployed to:", address(ecoToken));

        // Deploy DAOGovernance with EcoToken contract address
        DAOGovernance daoGovernance = new DAOGovernance(address(ecoToken));
        console.log("DAO Governance deployed to:", address(daoGovernance));

        // Deploy ESGCredits contract with deployer as owner
        ESGCredits esgCredits = new ESGCredits(deployerAddress);
        console.log("ESG Credits deployed to:", address(esgCredits));

        // Verify a project (for EcoToken contract)
        ecoToken.verifyProject(1);
        console.log("Verified project with ID 1 in EcoToken");

        // Verify the project in ESGCredits contract
        esgCredits.verifyProject(1);
        console.log("Verified project with ID 1 in ESGCredits");

        // Mint some EcoTokens to the deployer
        ecoToken.mint(deployerAddress, 10000 * 10 ** 18, 1);
        console.log("Minted 10,000 EcoTokens to deployer");

        // Submit an initial proposal to DAO Governance
        daoGovernance.submitProposal("Initial proposal for testing");
        console.log("Submitted initial proposal");

        // Mint 1000 ESG Credits to deployer for the project
        esgCredits.mint(deployerAddress, 1, 1000, "0x");
        console.log("Minted 1000 ESG Credits of type 1");

        // Get and log the quorum percentage
        uint256 quorumPercentage = daoGovernance.quorumPercentage();
        console.log("Quorum percentage set to:", quorumPercentage);

        vm.stopBroadcast();
    }
}