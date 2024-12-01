import React, { useState } from 'react';

function RightPanel() {
  const [capturedImage, setCapturedImage] = useState(null);

  // Hàm giả lập load ảnh
  const loadCapturedImage = () => {
    setCapturedImage('https://via.placeholder.com/150'); // Link ảnh giả lập
  };

  return (
    <div className="right-panel">
      <div className="captured-image">
        <h3>Ảnh chụp được (biển số xe)</h3>
        {capturedImage ? (
          <img src={capturedImage} alt="Biển số xe" />
        ) : (
          <div className="image-placeholder" onClick={loadCapturedImage}>
            Nhấn để tải ảnh
          </div>
        )}
      </div>
      <div className="live-cam">
        <h3>Live cam (view ảnh động)</h3>
        <div className="video-placeholder">Live Video (Chưa kết nối)</div>
      </div>
    </div>
  );
}

export default RightPanel;
