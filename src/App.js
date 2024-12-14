import React, { useState, useRef } from "react";
import "./App.css"; // Thêm CSS để làm đẹp giao diện
import VideoStream from "./components/VideoStream";
import RFIDReader from "./components/RFIDReader";

function App() {
  // State quản lý dữ liệu
  const [idCard, setIdCard] = useState("");
  const [entryTime, setEntryTime] = useState("");
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoStreamRef = useRef(null);

  // Xử lý khi nhấn nút "Xác nhận"
  const handleConfirm = async () => {
    if (!idCard || !entryTime) {
      alert("⚠️Vui lòng nhập đầy đủ thông tin ID thẻ và thời gian vào!");
      return;
    }

    try {
      // Kiểm tra xem có phải xe ra không
      const exitTimeValue = document.getElementById('entryTimeOut').value;
      if (exitTimeValue) {
        // Xe ra - xóa record và cập nhật counter
        const deleteResponse = await fetch(`http://localhost:3001/api/records/delete/${idCard}`, {
          method: 'DELETE'
        });
        
        const deleteData = await deleteResponse.json();
        if (deleteData.success) {
          setTotalOut(prev => prev + 1);
          alert(`✅Xác nhận xe ra thành công! ID thẻ: ${idCard}`);
        } else {
          throw new Error('Không thể xóa record');
        }
      } else {
        // Xe vào - tạo record mới
        const response = await fetch('http://localhost:3001/api/records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cardId: idCard,
            imageUrl: capturedImage,
            timestamp: entryTime
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setTotalIn(prev => prev + 1);
          alert(`✅Xác nhận xe vào thành công! ID thẻ: ${idCard}`);
        }
      }

      handleCancel(); // Reset form sau khi xác nhận
    } catch (error) {
      console.error('Error handling confirmation:', error);
      alert('❌Có lỗi xảy ra khi xử lý yêu cầu');
    }
  };

  // Xử lý khi nhấn nút "Hủy"
  const handleCancel = () => {
    setIdCard("");
    setEntryTime("");
    setCapturedImage(null);
    // Reset các trường input
    document.getElementById('idCardOut').value = "";
    document.getElementById('entryTimeOut').value = "";
    alert("Đã hủy thông tin.");
  };

  // Giả lập tải ảnh biển số
  const loadCapturedImage = () => {
    setCapturedImage("https://via.placeholder.com/150"); // Link ảnh giả lập
  };

  const handleCardRead = async (cardId) => {
    try {
      // Kiểm tra thẻ trong database
      const checkResponse = await fetch(`http://localhost:3001/api/records/check/${cardId}`);
      const checkData = await checkResponse.json();
      
      if (checkData.success) {
        // Thẻ đã tồn tại - Xe ra
        const record = checkData.data;
        setIdCard(record.cardId);
        setEntryTime(new Date(record.timestamp).toISOString().slice(0, 16));
        setCapturedImage(record.imageUrl);
        
        // Cập nhật giao diện cho xe ra
        const exitTime = new Date().toISOString().slice(0, 16);
        document.getElementById('idCardOut').value = record.cardId;
        document.getElementById('entryTimeOut').value = exitTime;
      } else {
        // Thẻ mới - Xe vào
        const now = new Date().toISOString().slice(0, 16);
        setIdCard(cardId);
        setEntryTime(now);
        
        if (videoStreamRef.current) {
          videoStreamRef.current.captureFrame((imageUrl) => {
            setCapturedImage(imageUrl);
          });
        }
      }
    } catch (error) {
      console.error('Error checking card:', error);
    }
  };

  const handleCaptureImage = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.captureFrame((imageUrl) => {
        setCapturedImage(imageUrl);
      });
    }
  };

  return (
    <div className="container">
      <RFIDReader 
        onCardRead={handleCardRead}
        onCaptureImage={handleCaptureImage}
      />
      {/* Bảng điều khiển bên trái */}
      <div className="left-panel">
        <div className="input-container">
          {/* Thẻ vào */}
          <div className="input-group">
            <label htmlFor="idCardIn">ID thẻ vào:</label>
            <input
              type="text"
              id="idCardIn"
              value={idCard}
              onChange={(e) => setIdCard(e.target.value)}
              placeholder="ID thẻ vào"
            />
          </div>
          {/* Thời gian vào */}
          <div className="input-group">
            <label htmlFor="entryTimeIn">Thời gian vào:</label>
            <input
              type="datetime-local"
              id="entryTimeIn"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
            />
          </div>
        </div>

        <div className="input-container">
          {/* Thẻ ra */}
          <div className="input-group">
            <label htmlFor="idCardOut">ID thẻ ra:</label>
            <input
              type="text"
              id="idCardOut"
              value={idCard}
              onChange={(e) => setIdCard(e.target.value)}
              placeholder="ID thẻ ra"
            />
          </div>
          {/* Thời gian ra */}
          <div className="input-group">
            <label htmlFor="entryTimeOut">Thời gian ra:</label>
            <input
              type="datetime-local"
              id="entryTimeOut"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
            />
          </div>
        </div>

        <div className="parking-fee">
          <label>Phí gửi xe:</label>
          <div className="fee-amount">5000 VNĐ</div>
        </div>

        <div className="stats">
          <div className="stat">
            <h3>Tổng vào</h3>
            <p>{totalIn}</p>
          </div>
          <div className="stat">
            <h3>Tổng ra</h3>
            <p >{totalOut}</p>
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
          {capturedImage ? (
            <img src={capturedImage} alt="Biển số xe" />
          ) : (
            <div className="image-placeholder" onClick={loadCapturedImage}>
              Nhấn để tải ảnh
            </div>
          )}
        </div>
        <div className="live-cam">
          <VideoStream ref={videoStreamRef} />
        </div>
      </div>
    </div>
  );
}

export default App;
