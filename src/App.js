import React, { useState } from 'react';
import './App.css'; // Thêm CSS để làm đẹp giao diện

function App() {
  // State quản lý dữ liệu
  const [idCard, setIdCard] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);

  // Xử lý khi nhấn nút "Xác nhận"
  const handleConfirm = () => {
    if (!idCard || !entryTime) {
      alert('Vui lòng nhập đầy đủ thông tin ID thẻ và thời gian vào!');
      return;
    }

    // Cập nhật tổng xe vào
    setTotalIn(totalIn + 1);
    alert(`Xác nhận thành công! ID thẻ: ${idCard}, Thời gian: ${entryTime}`);

    // Reset input
    setIdCard('');
    setEntryTime('');
  };

  // Xử lý khi nhấn nút "Hủy"
  const handleCancel = () => {
    setIdCard('');
    setEntryTime('');
    alert('Đã hủy thông tin.');
  };

  // Giả lập tải ảnh biển số
  const loadCapturedImage = () => {
    setCapturedImage('https://via.placeholder.com/150'); // Link ảnh giả lập
  };

  return (
    <div className="container">
      {/* Bảng điều khiển bên trái */}
      <div className="left-panel">
        <div className="input-group">
          <label htmlFor="idCard">ID thẻ quẹt:</label>
          <input
            type="text"
            id="idCard"
            value={idCard}
            onChange={(e) => setIdCard(e.target.value)}
            placeholder="Nhập ID thẻ"
          />
        </div>
        <div className="input-group">
          <label htmlFor="entryTime">Thời gian vào:</label>
          <input
            type="text"
            id="entryTime"
            value={entryTime}
            onChange={(e) => setEntryTime(e.target.value)}
            placeholder="Nhập thời gian vào"
          />
        </div>
        <div className="stats">
          <div className="stat">
            <h3>Tổng vào</h3>
            <p>{totalIn}</p>
          </div>
          <div className="stat">
            <h3>Tổng ra</h3>
            <p>{totalOut}</p>
          </div>
        </div>
        <div className="buttons">
          <button className="confirm-btn" onClick={handleConfirm}>
            Xác nhận
          </button>
          <button className="cancel-btn" onClick={handleCancel}>
            Hủy
          </button>
        </div>
      </div>

      {/* Bảng điều khiển bên phải */}
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
    </div>
  );
}

export default App;
