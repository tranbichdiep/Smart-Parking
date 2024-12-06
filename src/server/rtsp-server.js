const Stream = require('node-rtsp-stream');

const startStream = () => {
  // Kiểm tra và đóng stream cũ nếu có
  if (global.streamInstance) {
    try {
      global.streamInstance.stop();
    } catch (e) {
      console.log('Error stopping previous stream:', e);
    }
  }

  const stream = new Stream({
    name: 'camera',
    streamUrl: 'rtsp://admin:diep@166.117.30.1:8554/live', // Đưa thông tin xác thực vào URL
    wsPort: 9999,
    ffmpegOptions: {
      '-rtsp_transport': 'tcp',
      '-rtsp_flags': 'prefer_tcp',
      '-stats': '',
      '-r': 30
    }
  });

  // Lưu instance stream để có thể đóng khi cần
  global.streamInstance = stream;

  stream.on('exitWithError', (error) => {
    console.error('Stream error:', error);
    // Thử kết nối lại sau 5 giây
    setTimeout(() => {
      startStream();
    }, 5000);
  });
};

// Đảm bảo tắt stream khi process kết thúc
process.on('SIGINT', () => {
  if (global.streamInstance) {
    global.streamInstance.stop();
  }
  process.exit();
});

// Khởi động stream
startStream(); 