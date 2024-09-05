import web3 from './web3';
import EcoToken from './abis/EcoToken.json';
import DAOGovernance from './abis/DAOGovernance.json';

const ecoToken = new web3.eth.Contract(
  EcoToken.abi,
  'YOUR_ECOTOKEN_CONTRACT_ADDRESS'
);

const daoGovernance = new web3.eth.Contract(
  DAOGovernance.abi,
  'YOUR_DAOGOVERNANCE_CONTRACT_ADDRESS'
);

export const getBalance = async (address) => {
  const balance = await ecoToken.methods.balanceOf(address).call();
  return web3.utils.fromWei(balance, 'ether');
};

export const submitProposal = async (description, account) => {
  await daoGovernance.methods.submitProposal(description).send({ from: account });
};
