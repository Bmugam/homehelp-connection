const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;