const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
    slotNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },
    isOccupied: {
        type: Boolean,
        default: false
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);