import React from 'react';

const RightPanel = ({ capturedImage, loadCapturedImage }) => {
  const styles = {
    panel: {
      flex: 1,
      minWidth: '500px',
      display: 'flex',
      flexDirection: 'column',
      gap: '25px',
    },
    imageContainer: {
      border: '1px solid #dcdcdc',
      padding: '25px',
      textAlign: 'center',
      backgroundColor: '#f9f9f9',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '250px',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: 'lightgray',
      borderRadius: '5px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'black',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.panel}>
      <div style={styles.imageContainer}>
        {capturedImage ? (
          <img 
            src={capturedImage} 
            alt="Captured frame" 
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'contain'
            }} 
          />
        ) : (
          <div style={styles.imagePlaceholder} onClick={loadCapturedImage}>
            Nhấn để tải ảnh
          </div>
        )}
      </div>
      <div style={styles.imageContainer}>
        <div style={styles.imagePlaceholder}>Live Video (Chưa kết nối)</div>
      </div>
    </div>
  );
};

export default RightPanel;
