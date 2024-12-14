const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

router.post('/records', parkingController.createParkingRecord);
router.get('/records', parkingController.getParkingRecords);
router.get('/records/check/:cardId', parkingController.checkCard);
router.delete('/records/delete/:cardId', parkingController.deleteRecord);

module.exports = router;