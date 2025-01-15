const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  from: {
    type: String,
    required: [true, 'Kalkış noktası zorunludur']
  },
  to: {
    type: String,
    required: [true, 'Varış noktası zorunludur']
  },
  date: {
    type: Date,
    required: [true, 'Sefer tarihi zorunludur']
  },
  departureTime: {
    type: String,
    required: [true, 'Kalkış saati zorunludur']
  },
  price: {
    type: Number,
    required: [true, 'Bilet fiyatı zorunludur']
  },
  totalSeats: {
    type: Number,
    default: 45
  },
  availableSeats: {
    type: Number,
    default: 45
  },
  occupiedSeats: {
    type: [Number],
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Sefer oluşturulurken boş koltuk sayısını ayarla
tripSchema.pre('save', function(next) {
  if (this.isNew) {
    this.availableSeats = this.totalSeats;
  }
  next();
});

module.exports = mongoose.model('Trip', tripSchema); 