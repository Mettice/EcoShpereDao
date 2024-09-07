import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ethers } from 'ethers';
import DAOGovernance from './contracts/DAOGovernance.json';
import EcoToken from './contracts/EcoToken.json';
import ESGCredits from './contracts/ESGCredits.json';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProposalList from './components/ProposalList';
import ProposalForm from './components/ProposalForm';
import ProposalDetails from './components/ProposalDetails';
import ESGMarketplace from './components/ESGMarketplace';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [daoContract, setDaoContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [esgContract, setESGContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [quorumVotes, setQuorumVotes] = useState(ethers.BigNumber.from(0));
  const [networkError, setNetworkError] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
          console.log("Provider created");
          
          await provider.send("eth_requestAccounts", []);
          console.log("Accounts requested");
          
          const signer = provider.getSigner();  // Declaration here
          console.log("Signer obtained");
  
          const network = await provider.getNetwork();
          console.log("Connected to network:", network);
  
          const blockNumber = await provider.getBlockNumber();
          console.log("Current block number:", blockNumber);
    
          // Check if connected to the correct network
          if (network.chainId !== 31337) {
            throw new Error("Please connect to the Anvil network (Chain ID: 31337)");
          }
    
          // Removed redeclaration of `signer` here
          console.log("Signer obtained");
          
          setProvider(provider);
          setSigner(signer);
    
          const daoAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
          const tokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
          const esgAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
    
          console.log("Creating contract instances...");
          const daoContract = new ethers.Contract(daoAddress, DAOGovernance.abi, signer);
          const tokenContract = new ethers.Contract(tokenAddress, EcoToken.abi, signer);
          const esgContract = new ethers.Contract(esgAddress, ESGCredits.abi, signer);
          console.log("Contract instances created");
    
          setDaoContract(daoContract);
          setTokenContract(tokenContract);
          setESGContract(esgContract);
    
          const address = await signer.getAddress();
          console.log("Connected account:", address);
          setAccount(address);
    
          // Fetch quorum percentage and calculate quorum votes
          console.log("Fetching quorum percentage...");
          const quorumPercentage = await daoContract.quorumPercentage();
          console.log("Quorum percentage:", quorumPercentage.toString());
    
          console.log("Fetching total supply...");
          const totalSupply = await tokenContract.totalSupply();
          console.log("Total supply:", totalSupply.toString());
    
          const quorumVotes = totalSupply.mul(quorumPercentage).div(100);
          console.log("Calculated quorum votes:", quorumVotes.toString());
          setQuorumVotes(quorumVotes);
    
          provider.on("network", (newNetwork, oldNetwork) => {
            if (oldNetwork) {
              console.log("Network changed, reloading...");
              window.location.reload();
            }
          });
    
        } catch (error) {
          console.error("Detailed error:", error);
          if (error.error && error.error.message) {
            console.error("Error message:", error.error.message);
          }
          setNetworkError(`Failed to connect to the Ethereum network: ${error.message}`);
        }
      } else {
        setNetworkError("No Ethereum wallet detected. Please install MetaMask or another Web3 wallet.");
      }
    };
  
    init();
  }, []);


  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = await signer.getAddress();
        setAccount(address);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        setNetworkError("Failed to connect wallet. Please try again.");
      }
    } else {
      setNetworkError("No Ethereum wallet detected. Please install MetaMask or another Web3 wallet.");
    }
  };

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (networkError) {
    return (
      <div style={styles.error}>
        <h2>Network Error</h2>
        <p>{networkError}</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App" style={styles.app}>
        <Header account={account} connectWallet={connectWallet} />
        {account ? (
          <Routes>
            <Route path="/" element={
              <Dashboard 
                account={account}
                tokenContract={tokenContract}
                esgContract={esgContract}
              />
            } />
            <Route path="/proposals" element={
              <>
                <ProposalForm 
                  daoContract={daoContract} 
                  onProposalCreated={refreshData}
                />
                <ProposalList 
                  daoContract={daoContract}
                  refreshTrigger={refreshTrigger}
                  quorumVotes={quorumVotes}
                />
              </>
            } />
            <Route path="/proposals/:id" element={
              <ProposalDetails 
                daoContract={daoContract}
                account={account}
                refreshData={refreshData}
              />
            } />
            <Route path="/marketplace" element={
              <ESGMarketplace 
                esgContract={esgContract}
                account={account}
              />
            } />
          </Routes>
        ) : (
          <div style={styles.connectPrompt}>
            <h2>Welcome to EcoSphere DAO</h2>
            <p>Connect your wallet to get started</p>
            <button onClick={connectWallet} style={styles.button}>Connect Wallet</button>
          </div>
        )}
      </div>
    </Router>
  );
}

const styles = {
  app: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#e8f5e9',
    minHeight: '100vh',
    padding: '20px',
  },
  connectPrompt: {
    textAlign: 'center',
    marginTop: '50px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  error: {
    textAlign: 'center',
    marginTop: '50px',
    color: 'red',
  },
};

export default App;