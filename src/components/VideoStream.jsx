import React, { useEffect, useRef, forwardRef } from 'react';
import JSMpeg from '@cycjimmy/jsmpeg-player';

const VideoStream = forwardRef(({ onCapture }, ref) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const canvasRef = useRef(null);

  const captureFrame = async (callback) => {
    if (playerRef.current && videoRef.current) {
      try {
        // Tạo canvas tạm thời để vẽ frame
        const tempCanvas = document.createElement('canvas');
        const context = tempCanvas.getContext('2d');
        
        // Lấy kích thước thực của video
        const videoWidth = videoRef.current.clientWidth;
        const videoHeight = videoRef.current.clientHeight;
        
        // Đặt kích thước canvas bằng với kích thước video
        tempCanvas.width = videoWidth;
        tempCanvas.height = videoHeight;
        
        // Vẽ frame hiện tại từ video lên canvas
        context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
        
        // Chuyển đổi canvas thành URL ảnh
        const imageUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
        
        if (callback) {
          callback(imageUrl);
        }
        if (onCapture) {
          onCapture(imageUrl);
        }
      } catch (error) {
        console.error('Lỗi khi chụp frame:', error);
      }
    }
  };

  useEffect(() => {
    let player = null;
    
    const initPlayer = () => {
      if (videoRef.current && !playerRef.current) {
        try {
          player = new JSMpeg.Player('ws://localhost:9999', {
            canvas: videoRef.current,
            autoplay: true,
            audio: false,
            loop: true,
            videoBufferSize: 1024*1024*2,
            maxAudioLag: 0.5,
            videoQuality: 1,
            preserveDrawingBuffer: true,
            onDestroy: () => {
              playerRef.current = null;
            }
          });
          playerRef.current = player;
        } catch (error) {
          console.error('Lỗi khởi tạo player:', error);
        }
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Lỗi khi hủy player:', error);
        }
      }
    };
  }, []);

  React.useImperativeHandle(ref, () => ({
    captureFrame
  }));

  return (
    <div className="video-container">
      <canvas
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
    </div>
  );
});

export default VideoStream; 