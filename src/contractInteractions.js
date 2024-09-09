import web3 from './web3';
import EcoToken from './contracts/EcoToken.json';
import DAOGovernance from './contracts/DAOGovernance.json';
import ESGCredits from './contracts/ESGCredits.json';

const ecoToken = new web3.eth.Contract(
  EcoToken.abi,
  '0x5FbDB2315678afecb367f032d93F642f64180aa3' // Your deployed contract address
);

const daoGovernance = new web3.eth.Contract(
  DAOGovernance.abi,
  '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
);

const esgCredits = new web3.eth.Contract(
  ESGCredits.abi,
  '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
);

// Fetches the balance of the user
export const getBalance = async (address) => {
  const balance = await ecoToken.methods.balanceOf(address).call();
  return web3.utils.fromWei(balance, 'ether');
};

export const submitProposal = async (description, account) => {
  await ecoToken.methods.submitProposal(description).send({ from: account });
};

// Update other functions similarly...
// Fetches the voting power of the user
export const getVotingPower = async (address) => {
  try {
    const votingPower = await ecoToken.methods.balanceOf(address).call();
    return votingPower;
  } catch (error) {
    console.error("Error fetching voting power:", error);
    return '0';
  }
};

// Fetches the list of proposals from the DAO governance contract
export const getProposals = async () => {
  const proposalCount = await daoGovernance.methods.proposalCount().call();
  const proposals = [];
  for (let i = 0; i < proposalCount; i++) {
    const proposal = await daoGovernance.methods.proposals(i).call();
    proposals.push(proposal);
  }
  return proposals;
};

// Votes on a specific proposal
export const vote = async (proposalId, account) => {
  await daoGovernance.methods.vote(proposalId).send({ from: account });
};

// Fetches the ESG token balance for a user and a specific tokenId
export const getESGTokenBalance = async (address, tokenId) => {
  const balance = await esgCredits.methods.balanceOf(address, tokenId).call();
  return balance;
};

// Mints a new ESG token
export const mintESGToken = async (tokenId, amount, account) => {
  await esgCredits.methods.mint(tokenId, amount, '0x').send({ from: account });
};

// Initiates a cross-chain transfer of EcoToken
export const initiateCrossChainTransfer = async (to, amount, destinationChainId, account) => {
  const amountWei = web3.utils.toWei(amount.toString(), 'ether');
  await ecoToken.methods.initiateCrossChainTransfer(to, amountWei, destinationChainId).send({ from: account });
};

// Verifies a specific project in the EcoToken contract
export const verifyProject = async (projectId, account) => {
  await ecoToken.methods.verifyProject(projectId).send({ from: account });
};

// Function to display voting power
export const displayVotingPower = async (account) => {
  const votingPower = await getVotingPower(account);
  document.getElementById('votingPower').innerText = `Voting Power: ${votingPower}`;
};

// Function to connect wallet and fetch voting power
export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      await displayVotingPower(account);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  } else {
    console.log("Please install MetaMask!");
  }
};

export { ecoToken, daoGovernance, esgCredits };