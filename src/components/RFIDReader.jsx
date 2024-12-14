import React, { useEffect, useState, useRef, useCallback } from 'react';

const RFIDReader = ({ onCardRead, onCaptureImage }) => {
  const [status, setStatus] = useState('Đang kết nối...');
  const [error, setError] = useState(null);
  const [lastCardId, setLastCardId] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const maxRetries = 5;
  const retryDelay = 3000;
  const [retryCount, setRetryCount] = useState(0);

  const connectWebSocket = useCallback(() => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      const ws = new WebSocket('ws://192.168.33.110:9999');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Đã kết nối tới ESP32 RFID Reader");
        setStatus('Đã kết nối - Đang đợi thẻ RFID...');
        setError(null);
        setRetryCount(0);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.cardId) {
            console.log(`Đã quét thẻ RFID - ID: ${data.cardId}`);
            setLastCardId(data.cardId);
            onCardRead(data.cardId);
            setStatus(`Đã đọc thẻ: ${data.cardId}`);
            setTimeout(onCaptureImage, 100);
          } else if (data.type === 'parking' && data.changes) {
            fetch('http://localhost:3001/api/slots', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                changes: data.changes
              })
            })
              .then(response => response.json())
              .then(result => {
                if (!result.success) {
                  console.error('Failed to update parking slots:', result.error);
                }
              })
              .catch(error => {
                console.error('Error updating parking slots:', error);
              });
          }
        } catch (err) {
          console.error('Lỗi xử lý dữ liệu:', err);
          setError('Lỗi khi đọc dữ liệu JSON');
        }
      };

      ws.onerror = (error) => {
        console.error('Lỗi WebSocket:', error);
        setError('Lỗi kết nối WebSocket');
        setStatus('Lỗi kết nối');
      };

      ws.onclose = () => {
        console.log('Mất kết nối với ESP32');
        setStatus('Mất kết nối - Đang thử kết nối lại...');

        if (retryCount < maxRetries) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            setRetryCount(prev => prev + 1);
            connectWebSocket();
          }, retryDelay);
        } else {
          setStatus('Không thể kết nối - Vui lòng kiểm tra lại thiết bị');
          setError('Đã vượt quá số lần thử kết nối lại');
        }
      };

    } catch (err) {
      console.error('Lỗi khởi tạo kết nối:', err);
      setError(`Lỗi: ${err.message}`);
    }
  }, [onCardRead, onCaptureImage, retryCount, maxRetries, retryDelay]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '20px' }}>
      <div style={{ marginBottom: '10px' }}>
        <strong>Trạng thái:</strong>
        <span style={{ color: error ? 'red' : 'green' }}>{status}</span>
      </div>
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          <strong>Lỗi:</strong> {error}
        </div>
      )}
      {lastCardId && (
        <div>
          <strong>ID thẻ cuối cùng:</strong> {lastCardId}
        </div>
      )}
    </div>
  );
};

export default RFIDReader; 