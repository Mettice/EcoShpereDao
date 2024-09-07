import web3 from './web3';
import EcoToken from './abis/EcoToken.json';
import DAOGovernance from './abis/DAOGovernance.json';
import ESGCredits from './abis/ESGCredits.json';

const ecoToken = new web3.eth.Contract(
  EcoToken.abi,
  'YOUR_ECOTOKEN_CONTRACT_ADDRESS'
);

const daoGovernance = new web3.eth.Contract(
  DAOGovernance.abi,
  'YOUR_DAOGOVERNANCE_CONTRACT_ADDRESS'
);

const esgCredits = new web3.eth.Contract(
  ESGCredits.abi,
  'YOUR_ESGCREDITS_CONTRACT_ADDRESS'
);

export const getBalance = async (address) => {
  const balance = await ecoToken.methods.balanceOf(address).call();
  return web3.utils.fromWei(balance, 'ether');
};

export const submitProposal = async (description, account) => {
  await daoGovernance.methods.submitProposal(description).send({ from: account });
};

export const getProposals = async () => {
  const proposalCount = await daoGovernance.methods.proposalCount().call();
  const proposals = [];
  for (let i = 0; i < proposalCount; i++) {
    const proposal = await daoGovernance.methods.proposals(i).call();
    proposals.push(proposal);
  }
  return proposals;
};

export const vote = async (proposalId, account) => {
  await daoGovernance.methods.vote(proposalId).send({ from: account });
};

export const getESGTokenBalance = async (address, tokenId) => {
  const balance = await esgCredits.methods.balanceOf(address, tokenId).call();
  return balance;
};

export const mintESGToken = async (tokenId, amount, account) => {
  await esgCredits.methods.mint(tokenId, amount, '0x').send({ from: account });
};

export const initiateCrossChainTransfer = async (to, amount, destinationChainId, account) => {
  const amountWei = web3.utils.toWei(amount.toString(), 'ether');
  await ecoToken.methods.initiateCrossChainTransfer(to, amountWei, destinationChainId).send({ from: account });
};

export const verifyProject = async (projectId, account) => {
  await ecoToken.methods.verifyProject(projectId).send({ from: account });
};