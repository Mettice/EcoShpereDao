import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function ProposalList({ daoContract, refreshTrigger, quorumVotes }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProposals = async () => {
    if (!daoContract) return;

    setLoading(true);
    setError(null);
    try {
      const proposalCount = await daoContract.proposalCount();
      const fetchedProposals = [];
      for (let i = 0; i < proposalCount; i++) {
        const proposal = await daoContract.getProposal(i);
        fetchedProposals.push({
          id: i,
          description: proposal.description,
          proposer: proposal.proposer,
          voteCount: proposal.voteCount,
          executed: proposal.executed
        });
      }
      setProposals(fetchedProposals);
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
      setError("Failed to load proposals. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [daoContract, refreshTrigger]);

  const handleVote = async (proposalId) => {
    if (!daoContract) return;

    try {
      const tx = await daoContract.vote(proposalId);
      await tx.wait();
      alert('Vote cast successfully!');
      await fetchProposals();
    } catch (error) {
      console.error('Error casting vote:', error);
      alert('Failed to cast vote. See console for details.');
    }
  };

  const handleExecute = async (proposalId) => {
    if (!daoContract) return;

    try {
      const tx = await daoContract.executeProposal(proposalId);
      await tx.wait();
      alert('Proposal executed successfully!');
      await fetchProposals();
    } catch (error) {
      console.error('Error executing proposal:', error);
      alert('Failed to execute proposal. See console for details.');
    }
  };

  if (loading) return <p>Loading proposals...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Proposals</h2>
      {proposals.length === 0 ? (
        <p>No proposals found.</p>
      ) : (
        <ul style={styles.list}>
          {proposals.map((proposal) => (
            <li key={proposal.id} style={styles.listItem}>
              <h3 style={styles.proposalTitle}>{proposal.description}</h3>
              <p>Proposer: {proposal.proposer}</p>
              <p>Vote Count: {ethers.utils.formatEther(proposal.voteCount)} ECO</p>
              <p>Status: {proposal.executed ? 'Executed' : 'Pending'}</p>
              {!proposal.executed && (
                <button onClick={() => handleVote(proposal.id)} style={styles.button}>
                  Vote
                </button>
              )}
              {!proposal.executed && proposal.voteCount.gte(quorumVotes) && (
                <button onClick={() => handleExecute(proposal.id)} style={styles.button}>
                  Execute
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    color: '#2c3e50',
    fontSize: '1.8em',
    marginBottom: '20px',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    backgroundColor: '#ffffff',
    margin: '10px 0',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  proposalTitle: {
    color: '#34495e',
    marginBottom: '10px',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '10px',
    transition: 'background-color 0.3s ease',
  },
};

export default ProposalList;