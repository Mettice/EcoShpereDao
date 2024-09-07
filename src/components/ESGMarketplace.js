import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function ESGMarketplace({ esgContract, account }) {
  const [availableCredits, setAvailableCredits] = useState([]);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');

  useEffect(() => {
    const fetchAvailableCredits = async () => {
      if (esgContract) {
        // This is a placeholder. In a real application, you'd fetch this data from your contract
        setAvailableCredits([
          { id: 1, name: 'Environmental Project A', available: 1000, price: 25 },
          { id: 2, name: 'Social Initiative B', available: 500, price: 30 },
          { id: 3, name: 'Governance Program C', available: 750, price: 28 },
        ]);
      }
    };

    fetchAvailableCredits();
  }, [esgContract]);

  const handleBuy = async (creditId) => {
    if (!esgContract || !account) return;
    try {
      const credit = availableCredits.find(c => c.id === creditId);
      const value = ethers.utils.parseEther((credit.price * buyAmount).toString());
      const tx = await esgContract.mint(creditId, buyAmount, "0x", { value });
      await tx.wait();
      alert('Purchase successful!');
      setBuyAmount('');
      // Refresh available credits
    } catch (error) {
      console.error('Error buying ESG credits:', error);
      alert('Failed to buy ESG credits. See console for details.');
    }
  };

  const handleSell = async () => {
    if (!esgContract || !account) return;
    try {
      const tx = await esgContract.burn(1, sellAmount, "0x"); // Assuming 1 is the token ID
      await tx.wait();
      alert('Sale successful!');
      setSellAmount('');
      // Refresh available credits
    } catch (error) {
      console.error('Error selling ESG credits:', error);
      alert('Failed to sell ESG credits. See console for details.');
    }
  };

  return (
    <div style={styles.marketplace}>
      <h2 style={styles.heading}>ESG Credit Marketplace</h2>
      <div style={styles.section}>
        <h3>Available ESG Credits</h3>
        <ul style={styles.creditList}>
          {availableCredits.map((credit) => (
            <li key={credit.id} style={styles.creditItem}>
              <strong>{credit.name}</strong>
              <p>Available: {credit.available} | Price: {credit.price} ECO</p>
              <input
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="Amount to buy"
                style={styles.input}
              />
              <button onClick={() => handleBuy(credit.id)} style={styles.button}>Buy</button>
            </li>
          ))}
        </ul>
      </div>
      <div style={styles.section}>
        <h3>Sell Your ESG Credits</h3>
        <input
          type="number"
          value={sellAmount}
          onChange={(e) => setSellAmount(e.target.value)}
          placeholder="Amount to sell"
          style={styles.input}
        />
        <button onClick={handleSell} style={styles.button}>Sell</button>
      </div>
    </div>
  );
}


const styles = {
  marketplace: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  heading: {
    color: '#1B5E20',
    marginBottom: '20px',
  },
  section: {
    marginBottom: '30px',
  },
  creditList: {
    listStyleType: 'none',
    padding: 0,
  },
  creditItem: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#E8F5E9',
    borderRadius: '5px',
  },
  input: {
    padding: '10px',
    marginRight: '10px',
    borderRadius: '5px',
    border: '1px solid #4CAF50',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default ESGMarketplace;