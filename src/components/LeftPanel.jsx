import React from 'react';

const LeftPanel = ({ idCard, setIdCard, entryTime, setEntryTime }) => {
  const styles = {
    panel: {
      flex: 1,
      minWidth: '350px',
      display: 'flex',
      flexDirection: 'column',
      gap: '25px',
    },
    inputContainer: {
      display: 'flex',
      gap: '20px',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    inputGroup: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      maxWidth: 'calc(50% - 10px)',
    },
    label: {
      fontWeight: 'bold',
      color: '#333',
      fontSize: '15px',
    },
    input: {
      padding: '12px',
      fontSize: '16px',
      border: '1px solid #dcdcdc',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      transition: 'all 0.3s ease',
      color: '#333',
    },
  };

  return (
    <div style={styles.panel}>
      <div style={styles.inputContainer}>
        <div style={styles.inputGroup}>
          <label htmlFor="idCard" style={styles.label}>
            Số thẻ:
          </label>
          <input
            type="text"
            id="idCard"
            value={idCard}
            onChange={(e) => setIdCard(e.target.value)}
            placeholder="ID thẻ"
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="entryTime" style={styles.label}>
            Thời gian quẹt:
          </label>
          <input
            type="datetime-local"
            id="entryTime"
            value={entryTime}
            onChange={(e) => setEntryTime(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;
