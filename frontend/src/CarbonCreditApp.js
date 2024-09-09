import React, { useState, useEffect } from 'react';
import web3 from './web3';
import * as contractInteractions from './contractInteractions';

const CarbonCreditApp = () => {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [proposals, setProposals] = useState([]);
  const [newProposal, setNewProposal] = useState('');
  const [esgTokens, setESGTokens] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [destinationChainId, setDestinationChainId] = useState('');

  useEffect(() => {
    const init = async () => {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      updateBalance(accounts[0]);
      updateProposals();
      updateESGTokens(accounts[0]);
    };
    init();
  }, []);

  const updateBalance = async (address) => {
    const balance = await contractInteractions.getBalance(address);
    setBalance(balance);
  };


  const updateProposals = async () => {
    const fetchedProposals = await contractInteractions.getProposals();
    setProposals(fetchedProposals);
  };

  const updateESGTokens = async (address) => {
    // For simplicity, we're checking balances for token IDs 1, 2, and 3
    const tokens = await Promise.all([1, 2, 3].map(async (id) => {
      const balance = await contractInteractions.getESGTokenBalance(address, id);
      return { id, balance };
    }));
    setESGTokens(tokens);
  };

  const handleSubmitProposal = async () => {
    try {
      await contractInteractions.submitProposal(newProposal, account);
      setNewProposal('');
      updateProposals();
    } catch (error) {
      console.error('Error submitting proposal:', error);
    }
  };

  const handleVote = async (proposalId) => {
    try {
      await contractInteractions.vote(proposalId, account);
      updateProposals();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const owner = await esgContract.getOwner();
  if (account !== owner) {
    alert("You are not authorized to perform this action.");
    return;
  }

  const handleVerifyProject = async () => {
    try {
      await contractInteractions.verifyProject(projectId, account);
      alert('Project verified successfully!');
    } catch (error) {
      console.error('Error verifying project:', error);
    }
  };

  const handleCrossChainTransfer = async () => {
    try {
      await contractInteractions.initiateCrossChainTransfer(transferTo, transferAmount, destinationChainId, account);
      alert('Cross-chain transfer initiated successfully!');
      updateBalance(account);
    } catch (error) {
      console.error('Error initiating cross-chain transfer:', error);
    }


  };

  return (
    <div>
      <h1>Carbon Credit Platform</h1>
      <p>Account: {account}</p>
      <p>EcoToken Balance: {balance} ECO</p>
      
      <h2>DAO Proposals</h2>
      <input 
        type="text" 
        value={newProposal} 
        onChange={(e) => setNewProposal(e.target.value)} 
        placeholder="New proposal description" 
      />
      <button onClick={handleSubmitProposal}>Submit Proposal</button>
      
      <ul>
        {proposals.map((proposal, index) => (
          <li key={index}>
            {proposal.description} - Votes: {proposal.voteCount}
            <button onClick={() => handleVote(proposal.id)}>Vote</button>
          </li>
        ))}
      </ul>

      <h2>ESG Tokens</h2>
      <ul>
        {esgTokens.map((token) => (
          <li key={token.id}>
            Token ID: {token.id} - Balance: {token.balance}
          </li>
        ))}
      </ul>

      <h2>Verify Project</h2>
      <input 
        type="number" 
        value={projectId} 
        onChange={(e) => setProjectId(e.target.value)} 
        placeholder="Project ID" 
      />
      <button onClick={handleVerifyProject}>Verify Project</button>

      <h2>Cross-Chain Transfer</h2>
      <input 
        type="text" 
        value={transferTo} 
        onChange={(e) => setTransferTo(e.target.value)} 
        placeholder="Recipient Address" 
      />
      <input 
        type="number" 
        value={transferAmount} 
        onChange={(e) => setTransferAmount(e.target.value)} 
        placeholder="Amount" 
      />
      <input 
        type="number" 
        value={destinationChainId} 
        onChange={(e) => setDestinationChainId(e.target.value)} 
        placeholder="Destination Chain ID" 
      />
      <button onClick={handleCrossChainTransfer}>Initiate Cross-Chain Transfer</button>
    </div>
  );
};

export default CarbonCreditApp;