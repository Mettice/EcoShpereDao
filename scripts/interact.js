async function main() {
    const [deployer] = await ethers.getSigners();
    const EcoToken = await ethers.getContractFactory("EcoToken");
    const ecoToken = await EcoToken.attach("YOUR_ECOTOKEN_ADDRESS");
  
    const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
    const daoGovernance = await DAOGovernance.attach("YOUR_DAOGOVERNANCE_ADDRESS");
  
    console.log("Minting 1000 EcoTokens...");
    await ecoToken.mint(deployer.address, ethers.utils.parseEther("1000"));
    console.log("Minting complete!");
  
    console.log("Submitting a new proposal...");
    await daoGovernance.submitProposal("Proposal 1 description");
    console.log("Proposal submitted!");
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
  