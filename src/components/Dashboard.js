import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function Dashboard({ account, tokenContract, esgContract, stakingPower }) {
  const [ecoBalance, setEcoBalance] = useState('0');
  const [esgBalance, setESGBalance] = useState('0');
  const [votingPower, setVotingPower] = useState('0');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalances = async () => {
      if (tokenContract && esgContract && account) {
        try {
          console.log("Fetching EcoToken balance...");
          const eco = await tokenContract.balanceOf(account);
          setEcoBalance(ethers.utils.formatEther(eco));
          console.log("EcoToken balance fetched successfully");

          console.log("Fetching ESG Credit balance...");
          const esg = await esgContract.balanceOf(account, 1); // Assuming ESG Credit has ID 1
          setESGBalance(esg.toString()); // ESG Credits might not use 18 decimals
          console.log("ESG Credit balance fetched successfully");

          // Use stakingPower prop directly
          setVotingPower(ethers.utils.formatEther(stakingPower));
        } catch (error) {
          console.error("Error fetching balances:", error);
          setError("Failed to fetch balances. Please check the console for details.");
        }
      }
    };

    fetchBalances();
  }, [account, tokenContract, esgContract, stakingPower]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={styles.dashboard}>
      <h2>Your Dashboard</h2>
      <div style={styles.balances}>
        <div style={styles.balance}>
          <h3>ECO Token Balance</h3>
          <p>{ecoBalance} ECO</p>
        </div>
        <div style={styles.balance}>
          <h3>ESG Credit Balance</h3>
          <p>{esgBalance} ESG</p>
        </div>
      </div>

      <div style={styles.votingPower}>
        <h3>Voting Power</h3>
        <p>{votingPower} ECO</p>
      </div>
    </div>
  );
}

const styles = {
  dashboard: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  balances: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '30px',
  },
  balance: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#C8E6C9',
    borderRadius: '5px',
    width: '45%',
  },
  votingPower: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#FFEB3B',
    borderRadius: '5px',
    marginTop: '20px',
  },
};

export default Dashboard;