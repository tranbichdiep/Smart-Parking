const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
require('./server/rtsp-server');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 