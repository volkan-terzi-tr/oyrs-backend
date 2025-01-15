const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Kullanıcı Kaydı
router.post('/register', async (req, res) => {
  console.log('Kayıt isteği alındı:', req.body);
  
  try {
    const { name, surname, email, phone, password } = req.body;

    // E-posta kontrolü
    console.log('E-posta kontrolü yapılıyor...');
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('E-posta zaten kayıtlı:', email);
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı!' });
    }

    // Şifre hashleme
    console.log('Şifre hashleniyor...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Yeni kullanıcı oluşturma
    console.log('Yeni kullanıcı oluşturuluyor...');
    const user = new User({
      name,
      surname,
      email,
      phone,
      password: hashedPassword
    });

    // Kullanıcıyı kaydetme
    console.log('Kullanıcı kaydediliyor...');
    await user.save();
    console.log('Kullanıcı başarıyla kaydedildi:', user._id);

    res.status(201).json({
      message: 'Kayıt başarılı!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Bu e-posta adresi zaten kullanılıyor!',
        error: error.message 
      });
    }
    res.status(500).json({ 
      message: 'Sunucu hatası!', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Kullanıcı Girişi
router.post('/login', async (req, res) => {
  console.log('Giriş isteği alındı:', { email: req.body.email });
  
  try {
    const { email, password } = req.body;

    // Kullanıcı kontrolü
    console.log('Kullanıcı aranıyor...');
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Kullanıcı bulunamadı:', email);
      return res.status(400).json({ message: 'Kullanıcı bulunamadı!' });
    }

    // Şifre kontrolü
    console.log('Şifre kontrol ediliyor...');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Hatalı şifre:', email);
      return res.status(400).json({ message: 'Hatalı şifre!' });
    }

    console.log('Giriş başarılı:', user._id);
    res.json({
      message: 'Giriş başarılı!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ 
      message: 'Sunucu hatası!', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 