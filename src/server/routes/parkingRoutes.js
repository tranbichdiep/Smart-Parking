const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');
const parkingSlotController = require('../controllers/parkingSlotController');

router.post('/records', parkingController.createParkingRecord);
router.get('/records', parkingController.getParkingRecords);
router.get('/records/check/:cardId', parkingController.checkCard);
router.delete('/records/delete/:cardId', parkingController.deleteRecord);
router.post('/slots', parkingSlotController.updateSlots);
router.get('/slots', parkingSlotController.getSlots);

module.exports = router;