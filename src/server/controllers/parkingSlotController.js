const ParkingSlot = require('../models/ParkingSlot');

exports.updateSlots = async (req, res) => {
    try {
        const { slots } = req.body; // slots là mảng boolean [true, false, true, false]

        // Cập nhật từng slot
        const updatePromises = slots.map((isOccupied, index) => {
            return ParkingSlot.findOneAndUpdate({ slotNumber: index + 1 }, {
                isOccupied,
                lastUpdated: new Date()
            }, { upsert: true, new: true });
        });

        await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            message: 'Updated parking slots successfully'
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