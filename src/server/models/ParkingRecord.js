const mongoose = require('mongoose');

const parkingRecordSchema = new mongoose.Schema({
    cardId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('ParkingRecord', parkingRecordSchema);