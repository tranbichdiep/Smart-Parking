import React from 'react';

const Stats = ({ totalIn, totalOut }) => {
  const styles = {
    stats: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '20px',
      width: '100%',
    },
    stat: {
      flex: 1,
      textAlign: 'center',
      border: '1px solid #dcdcdc',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      fontSize: '16px',
      color: '#333',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.stats}>
      <div style={styles.stat}>
        <h3>Tổng vào</h3>
        <p>{totalIn}</p>
      </div>
      <div style={styles.stat}>
        <h3>Tổng ra</h3>
        <p>{totalOut}</p>
      </div>
    </div>
  );
};

export default Stats;
