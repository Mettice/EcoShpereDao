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
  const [stakingPower, setStakingPower] = useState(ethers.BigNumber.from(0));
  const [networkError, setNetworkError] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
          await provider.send("eth_requestAccounts", []);
          const signer = provider.getSigner();
          
          console.log("Connected to network:", await provider.getNetwork());
          console.log("Signer address:", await signer.getAddress());
    
          const daoAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
          const tokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
          const esgAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
    
          console.log("DAO Contract address:", daoAddress);
          console.log("Token Contract address:", tokenAddress);
          console.log("ESG Contract address:", esgAddress);
    
          const daoContract = new ethers.Contract(daoAddress, DAOGovernance.abi, signer);
          const tokenContract = new ethers.Contract(tokenAddress, EcoToken.abi, signer);
          const esgContract = new ethers.Contract(esgAddress, ESGCredits.abi, signer);
    
          setProvider(provider);
          setSigner(signer);
          setDaoContract(daoContract);
          setTokenContract(tokenContract);
          setESGContract(esgContract);
    
          const address = await signer.getAddress();
          setAccount(address);
    
          console.log("Attempting to get quorum percentage...");
          const quorumPercentage = await daoContract.quorumPercentage();
          console.log("Quorum Percentage:", quorumPercentage.toString());
    
          const totalSupply = await tokenContract.totalSupply();
          console.log("Total Supply:", totalSupply.toString());
    
          const quorumVotes = totalSupply.mul(quorumPercentage).div(100);
          setQuorumVotes(quorumVotes);
    
          // Fetching staking power (voting power)
          const stakingPower = await tokenContract.balanceOf(address);
          setStakingPower(stakingPower);
    
          // Set up a listener for network changes
          provider.on("network", (newNetwork, oldNetwork) => {
            console.log("Network changed:", newNetwork.chainId);
            if (oldNetwork) {
              window.location.reload();
            }
          });
    
        } catch (error) {
          console.error("Initialization error:", error);
          console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
          setNetworkError(`Failed to connect to the Ethereum network: ${error.message}`);
        }
      } else {
        setNetworkError("No Ethereum wallet detected. Please install MetaMask or another Web3 wallet.");
      }
    };

    init();
  }, [refreshTrigger]);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = await signer.getAddress();
        setAccount(address);
      } catch (error) {
        setNetworkError("Failed to connect wallet. Please try again.");
      }
    } else {
      setNetworkError("No Ethereum wallet detected. Please install MetaMask or another Web3 wallet.");
    }
  };

  const verifyProject = async (projectId) => {
    if (!esgContract) {
      console.error("ESG contract not initialized");
      return;
    }

    try {
      const tx = await esgContract.verifyProject(projectId);
      await tx.wait();
      console.log(`Project ${projectId} verified successfully`);
      refreshData();
    } catch (error) {
      console.error("Error verifying project:", error);
      if (error.message.includes("OwnableUnauthorizedAccount")) {
        alert("You are not authorized to verify projects. Please connect with the contract owner's account.");
      } else {
        alert(`Failed to verify project: ${error.message}`);
      }
    }
  };

  const mintESGCredits = async (to, projectId, amount, options = {}) => {
    if (!esgContract) {
      console.error("ESG contract not initialized");
      return;
    }

    try {
      const isVerified = await esgContract.verifiedProjects(projectId);
      if (!isVerified) {
        alert("This project is not verified. Please verify it first.");
        return;
      }

      const tx = await esgContract.mint(to, projectId, amount, "0x", options);
      await tx.wait();
      console.log(`Minted ${amount} credits for project ${projectId} to ${to}`);
      refreshData();
    } catch (error) {
      console.error("Error minting ESG credits:", error);
      if (error.message.includes("OwnableUnauthorizedAccount")) {
        alert("You are not authorized to mint credits. Please connect with the contract owner's account.");
      } else {
        alert(`Failed to mint ESG credits: ${error.message}`);
      }
    }
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
                stakingPower={stakingPower}
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
                verifyProject={verifyProject}
                mintESGCredits={mintESGCredits}
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