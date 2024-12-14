const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const parkingRoutes = require('./routes/parkingRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect('mongodb+srv://thanhtungco14:M87Jvz4IK60BwlSa@cnweb.koujl.mongodb.net/smartParking?retryWrites=true&w=majority&appName=CNWeb')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', parkingRoutes);

require('./rtsp-server');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});