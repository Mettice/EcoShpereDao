import React from 'react';
import { Link } from 'react-router-dom';

function Header({ account, connectWallet }) {
  return (
    <header style={styles.header}>
      <h1 style={styles.title}>EcoSphere DAO</h1>
      <nav style={styles.nav}>
        <Link to="/" style={styles.link}>Dashboard</Link>
        <Link to="/proposals" style={styles.link}>Proposals</Link>
        <Link to="/marketplace" style={styles.link}>Carbon Marketplace</Link>
      </nav>
      {account ? (
        <p style={styles.account}>Connected: {account.substring(0, 6)}...{account.substring(38)}</p>
      ) : (
        <button onClick={connectWallet} style={styles.button}>Connect Wallet</button>
      )}
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#1B5E20',
    color: 'white',
  },
  title: {
    margin: 0,
    fontSize: '24px',
  },
  nav: {
    display: 'flex',
    gap: '20px',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
  },
  account: {
    margin: 0,
    fontSize: '14px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default Header;