import React from 'react';

const ButtonGroup = ({ handleConfirm, handleCancel }) => {
  const styles = {
    buttons: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '20px',
    },
    button: {
      flex: 1,
      padding: '15px 30px',
      fontSize: '16px',
      cursor: 'pointer',
      borderRadius: '10px',
      transition: 'background-color 0.3s, transform 0.2s, boxShadow 0.2s',
      fontWeight: 'bold',
      border: 'none',
    },
    confirmBtn: {
      backgroundColor: '#28a745',
      color: 'white',
    },
    confirmBtnHover: {
      backgroundColor: '#218838',
    },
    cancelBtn: {
      backgroundColor: '#dc3545',
      color: 'white',
    },
    cancelBtnHover: {
      backgroundColor: '#c82333',
    },
  };

  return (
    <div style={styles.buttons}>
      <button
        style={{ ...styles.button, ...styles.confirmBtn }}
        onClick={handleConfirm}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#218838')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#28a745')}
      >
        Xác nhận
      </button>
      <button
        style={{ ...styles.button, ...styles.cancelBtn }}
        onClick={handleCancel}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#c82333')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#dc3545')}
      >
        Hủy
      </button>
    </div>
  );
};

export default ButtonGroup;
