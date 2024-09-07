import React, { useState, useEffect } from 'react';

function ProposalList({ daoContract }) {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    const fetchProposals = async () => {
      if (daoContract) {
        try {
          const proposalCount = await daoContract.proposalCount();
          const fetchedProposals = [];
          for (let i = 0; i < proposalCount; i++) {
            const proposal = await daoContract.getProposal(i);
            fetchedProposals.push(proposal);
          }
          setProposals(fetchedProposals);
        } catch (error) {
          console.error("Failed to fetch proposals:", error);
        }
      }
    };

    fetchProposals();
  }, [daoContract]);

  return (
    <div>
      <h2>Proposals</h2>
      {proposals.length === 0 ? (
        <p>No proposals found.</p>
      ) : (
        <ul>
          {proposals.map((proposal, index) => (
            <li key={index}>
              <h3>{proposal.description}</h3>
              <p>Proposer: {proposal.proposer}</p>
              <p>Vote Count: {proposal.voteCount.toString()}</p>
              <p>Executed: {proposal.executed ? 'Yes' : 'No'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProposalList;