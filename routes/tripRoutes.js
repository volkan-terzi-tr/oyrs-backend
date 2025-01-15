const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const Ticket = require('../models/Ticket');

// Sefer arama endpoint'i
router.get('/search', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    
    // Tarih formatını düzenle
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const query = {
      from,
      to,
      date: {
        $gte: searchDate,
        $lt: nextDay
      },
      status: 'active',
      availableSeats: { $gt: 0 }
    };
    
    const trips = await Trip.find(query).sort('departureTime');
    
    res.json({
      success: true,
      data: trips
    });
  } catch (error) {
    console.error('Sefer arama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Seferler aranırken bir hata oluştu'
    });
  }
});

// Tüm seferleri getir
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find().sort('-date departureTime');
    res.json({
      success: true,
      data: trips
    });
  } catch (error) {
    console.error('Seferleri getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Seferler getirilirken bir hata oluştu'
    });
  }
});

// Tüm seferleri aktif yap
router.post('/activate-all', async (req, res) => {
  try {
    await Trip.updateMany({}, { status: 'active' });
    res.json({
      success: true,
      message: 'Tüm seferler aktif olarak işaretlendi'
    });
  } catch (error) {
    console.error('Sefer aktivasyon hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Seferler aktifleştirilirken bir hata oluştu'
    });
  }
});

// Yeni sefer ekle
router.post('/', async (req, res) => {
  try {
    const trip = new Trip({
      ...req.body,
      status: 'active' // Yeni seferlerin varsayılan olarak aktif olmasını sağla
    });
    await trip.save();
    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('Sefer ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sefer eklenirken bir hata oluştu'
    });
  }
});

// Seferi güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Sefer bulunamadı'
      });
    }
    
    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('Sefer güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sefer güncellenirken bir hata oluştu'
    });
  }
});

// Seferi sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Sefer bulunamadı'
      });
    }

    // İlgili biletleri bul ve iptal et
    await Ticket.updateMany(
      { trip: id, status: 'active' },
      { status: 'cancelled' }
    );
    
    // Seferi sil
    await Trip.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Sefer ve ilgili biletler başarıyla iptal edildi'
    });
  } catch (error) {
    console.error('Sefer silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sefer silinirken bir hata oluştu'
    });
  }
});

module.exports = router; 