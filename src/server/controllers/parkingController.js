const ParkingRecord = require('../models/ParkingRecord');

exports.createParkingRecord = async (req, res) => {
    try {
        const { cardId, imageUrl, timestamp } = req.body;

        const parkingRecord = new ParkingRecord({
            cardId,
            imageUrl,
            timestamp
        });

        await parkingRecord.save();

        res.status(201).json({
            success: true,
            data: parkingRecord
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getParkingRecords = async (req, res) => {
    try {
        const records = await ParkingRecord.find().sort({ timestamp: -1 });
        res.status(200).json({
            success: true,
            data: records
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};