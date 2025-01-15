const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Kayıt ol
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, surname, phone } = req.body;

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor'
      });
    }

    // Yeni kullanıcı oluştur
    const user = new User({
      email,
      password,
      name,
      surname,
      phone,
      role: 'user' // Varsayılan olarak normal kullanıcı
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      data: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kayıt sırasında bir hata oluştu',
      error: error.message
    });
  }
});

// Giriş yap
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı'
      });
    }

    // Şifreyi kontrol et
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı'
      });
    }

    res.json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu',
      error: error.message
    });
  }
});

// Admin kullanıcısı oluştur (sadece bir kere çalıştırılmalı)
router.post('/create-admin', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin kullanıcısı zaten mevcut'
      });
    }

    const admin = new User({
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin',
      surname: 'User',
      role: 'admin'
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin kullanıcısı oluşturuldu',
      data: {
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Admin kullanıcısı oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
});

module.exports = router; 