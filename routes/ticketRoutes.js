const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Trip = require('../models/Trip');

// Bilet oluştur
router.post('/', async (req, res) => {
  try {
    // userId kontrolü
    if (!req.body.userId) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID zorunludur'
      });
    }

    const ticket = await Ticket.create(req.body);
    
    // Trip ile populate et
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('trip', 'from to date departureTime');

    res.status(201).json({
      success: true,
      data: populatedTicket
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Tüm biletleri getir (admin için)
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('trip', 'from to date departureTime')
      .select('-paymentInfo.cardNumber -paymentInfo.cardHolder');
    
    // Sadece geçerli trip'lere bağlı biletleri filtrele
    const validTickets = tickets.filter(ticket => ticket.trip != null);
    
    res.json({
      success: true,
      data: validTickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Kullanıcının biletlerini getir
router.get('/my-tickets', async (req, res) => {
  try {
    const userId = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimliği bulunamadı'
      });
    }

    const tickets = await Ticket.find({ userId })
      .populate('trip', 'from to date departureTime')
      .select('-paymentInfo.cardNumber -paymentInfo.cardHolder')
      .sort('-createdAt');
    
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Belirli bir bileti getir
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('trip', 'from to date departureTime')
      .select('-paymentInfo.cardNumber -paymentInfo.cardHolder');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Bilet bulunamadı'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Bileti iptal et
router.patch('/:id/cancel', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Bilet bulunamadı'
      });
    }

    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Bu bilet zaten iptal edilmiş'
      });
    }

    // Sefer bilgilerini güncelle
    const trip = await Trip.findById(ticket.trip);
    if (trip) {
      trip.availableSeats += 1;
      trip.occupiedSeats = trip.occupiedSeats.filter(seat => seat !== ticket.seatNumber);
      await trip.save();
    }

    // Bileti iptal et ve sil
    await Ticket.findByIdAndDelete(ticket._id);

    res.json({
      success: true,
      message: 'Bilet başarıyla iptal edildi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Bilet iptal edilirken bir hata oluştu'
    });
  }
});

// Geçersiz biletleri temizle (admin için)
router.delete('/cleanup', async (req, res) => {
  try {
    // Trip'i olmayan veya iptal edilmiş biletleri sil
    await Ticket.deleteMany({
      $or: [
        { trip: null },
        { status: 'cancelled' }
      ]
    });
    
    res.json({
      success: true,
      message: 'Geçersiz ve iptal edilmiş biletler temizlendi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Biletler temizlenirken bir hata oluştu'
    });
  }
});

module.exports = router; 