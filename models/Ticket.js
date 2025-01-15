const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: [true, 'Sefer bilgisi zorunludur']
  },
  seatNumber: {
    type: Number,
    required: [true, 'Koltuk numarası zorunludur']
  },
  passenger: {
    name: {
      type: String,
      required: [true, 'Yolcu adı zorunludur']
    },
    surname: {
      type: String,
      required: [true, 'Yolcu soyadı zorunludur']
    },
    tcNo: {
      type: String,
      required: [true, 'T.C. Kimlik numarası zorunludur'],
      match: [/^[0-9]{11}$/, 'Geçerli bir T.C. Kimlik numarası giriniz']
    },
    phone: {
      type: String,
      required: [true, 'Telefon numarası zorunludur'],
      match: [/^[0-9]{10,11}$/, 'Geçerli bir telefon numarası giriniz']
    },
    email: {
      type: String,
      required: [true, 'E-posta adresi zorunludur'],
      match: [/^\S+@\S+\.\S+$/, 'Geçerli bir e-posta adresi giriniz']
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: [true, 'Cinsiyet bilgisi zorunludur']
    }
  },
  paymentInfo: {
    amount: {
      type: Number,
      required: [true, 'Ödeme tutarı zorunludur']
    },
    cardNumber: {
      type: String,
      required: [true, 'Kart numarası zorunludur'],
      select: false
    },
    cardHolder: {
      type: String,
      required: [true, 'Kart sahibi adı zorunludur'],
      select: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  userId: {
    type: String,
    required: [true, 'Kullanıcı ID zorunludur']
  }
}, {
  timestamps: true
});

// Bilet oluşturulduğunda seferdeki müsait koltuk sayısını güncelle
ticketSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Trip = mongoose.model('Trip');
      const trip = await Trip.findById(this.trip);
      
      if (!trip) {
        throw new Error('Sefer bulunamadı');
      }

      if (trip.availableSeats <= 0) {
        throw new Error('Bu seferde boş koltuk kalmamıştır');
      }

      if (trip.occupiedSeats.includes(this.seatNumber)) {
        throw new Error('Seçilen koltuk dolu');
      }

      trip.availableSeats -= 1;
      trip.occupiedSeats.push(this.seatNumber);
      await trip.save();
    } catch (error) {
      next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema); 