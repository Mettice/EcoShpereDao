import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function Dashboard({ account, tokenContract, carbonContract }) {
  const [ecoBalance, setEcoBalance] = useState('0');
  const [carbonBalance, setCarbonBalance] = useState('0');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalances = async () => {
      if (tokenContract && carbonContract && account) {
        try {
          console.log("Fetching EcoToken balance...");
          const eco = await tokenContract.balanceOf(account);
          setEcoBalance(ethers.utils.formatEther(eco));
          console.log("EcoToken balance fetched successfully");

          console.log("Fetching Carbon Credit balance...");
          const carbon = await carbonContract.balanceOf(account);
          setCarbonBalance(ethers.utils.formatEther(carbon));
          console.log("Carbon Credit balance fetched successfully");
        } catch (error) {
          console.error("Error fetching balances:", error);
          setError("Failed to fetch balances. Please check the console for details.");
        }
      }
    };

    fetchBalances();
  }, [account, tokenContract, carbonContract]);

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
          <h3>Carbon Credit Balance</h3>
          <p>{carbonBalance} CC</p>
        </div>
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
  heading: {
    color: '#1B5E20',
    marginBottom: '20px',
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
  activity: {
    backgroundColor: '#E8F5E9',
    padding: '20px',
    borderRadius: '5px',
  },
  activityList: {
    listStyleType: 'none',
    padding: 0,
  },
  activityItem: {
    marginBottom: '10px',
    fontSize: '14px',
  },
};

export default Dashboard;