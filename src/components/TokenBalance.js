import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function TokenBalance({ tokenContract, account }) {
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    const getBalance = async () => {
      if (tokenContract && account) {
        try {
          const balance = await tokenContract.balanceOf(account);
          setBalance(ethers.utils.formatEther(balance));
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }
    };

    getBalance();
  }, [tokenContract, account]);

  return (
    <div style={styles.balanceContainer}>
      <h3>Your Token Balance:</h3>
      <p>{balance} ECO</p>
    </div>
  );
}

const styles = {
  balanceContainer: {
    backgroundColor: '#f0f0f0',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
  }
};

export default TokenBalance;