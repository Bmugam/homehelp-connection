const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in hours
    required: true
  },
  image: {
    type: String,
    default: null
  },
  active: {
    type: Boolean,
    default: true
  },
  providers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);