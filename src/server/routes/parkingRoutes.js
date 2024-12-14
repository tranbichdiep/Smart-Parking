const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

router.post('/records', parkingController.createParkingRecord);
router.get('/records', parkingController.getParkingRecords);

module.exports = router;