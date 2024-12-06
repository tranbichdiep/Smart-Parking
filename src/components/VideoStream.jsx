import React, { useEffect, useRef } from 'react';
import JSMpeg from '@cycjimmy/jsmpeg-player';

const VideoStream = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

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
      if (player) {
        try {
          player.destroy();
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
      playerRef.current = null;
    };
  }, []);

  return (
    <div className="video-container" style={{ width: '100%', height: '100%' }}>
      <canvas
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000'
        }}
      />
    </div>
  );
};

export default VideoStream; 