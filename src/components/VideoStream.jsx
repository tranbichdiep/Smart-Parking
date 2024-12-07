import React, { useEffect, useRef, forwardRef } from 'react';
import JSMpeg from '@cycjimmy/jsmpeg-player';
import html2canvas from 'html2canvas';

const VideoStream = forwardRef(({ onCapture }, ref) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  const captureFrame = async (callback) => {
    if (containerRef.current) {
      try {
        const canvas = await html2canvas(containerRef.current, {
          useCORS: true,
          logging: false,
          backgroundColor: null,
          scale: 2 // Tăng chất lượng ảnh
        });
        
        const imageUrl = canvas.toDataURL('image/jpeg', 1.0);
        if (callback) {
          callback(imageUrl);
        }
        if (onCapture) {
          onCapture(imageUrl);
        }
      } catch (error) {
        console.error('Error capturing frame:', error);
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
          console.error('Error initializing video player:', error);
        }
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
    };
  }, []);

  React.useImperativeHandle(ref, () => ({
    captureFrame
  }));

  return (
    <div className="video-container" ref={containerRef}>
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