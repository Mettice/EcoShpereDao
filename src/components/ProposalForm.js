import React, { useState } from 'react';

function ProposalForm({ daoContract, onProposalCreated }) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!daoContract || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const tx = await daoContract.submitProposal(description);
      await tx.wait();
      alert('Proposal submitted successfully!');
      setDescription('');
      if (onProposalCreated) onProposalCreated();
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('Failed to submit proposal. See console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.header}>Create New Proposal</h2>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter proposal description"
        required
        style={styles.textarea}
      />
      <button type="submit" style={styles.button} disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '500px',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    color: '#2c3e50',
    marginBottom: '15px',
  },
  textarea: {
    height: '100px',
    marginBottom: '15px',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
};

export default ProposalForm;