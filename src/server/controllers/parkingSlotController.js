const ParkingSlot = require('../models/ParkingSlot');

exports.updateSlots = async (req, res) => {
    try {
        const { changes } = req.body; // changes là object: { "1": true, "3": false }

        // Tạo mảng promises chỉ cho những slot thay đổi
        const updatePromises = Object.entries(changes).map(([slotNumber, isOccupied]) => {
            return ParkingSlot.findOneAndUpdate({ slotNumber: parseInt(slotNumber) }, {
                isOccupied,
                lastUpdated: new Date()
            }, { upsert: true, new: true });
        });

        await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            message: 'Updated changed parking slots successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getSlots = async (req, res) => {
    try {
        const slots = await ParkingSlot.find().sort('slotNumber');
        res.status(200).json({
            success: true,
            data: slots
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};