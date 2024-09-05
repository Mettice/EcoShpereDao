async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
  
    const EcoToken = await ethers.getContractFactory("EcoToken");
    const ecoToken = await EcoToken.deploy(ethers.utils.parseEther("1000000")); // 1 million tokens
  
    console.log("EcoToken deployed to:", ecoToken.address);
  
    const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
    const daoGovernance = await DAOGovernance.deploy(ecoToken.address);
  
    console.log("DAO Governance deployed to:", daoGovernance.address);
  
    const ESGCredits = await ethers.getContractFactory("ESGCredits");
    const esgCredits = await ESGCredits.deploy();
  
    console.log("ESG Credits deployed to:", esgCredits.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
  