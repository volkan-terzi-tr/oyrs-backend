const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('MongoDB Atlas bağlantısı başlatılıyor...');
    console.log('Bağlantı URI:', process.env.MONGO_URI);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('MongoDB Atlas Bağlantısı Başarılı:');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);

    // Veritabanı ve koleksiyon kontrolü
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Mevcut koleksiyonlar:', collections.map(c => c.name));

  } catch (error) {
    console.error('MongoDB Atlas Bağlantı Hatası:');
    console.error('Hata Mesajı:', error.message);
    console.error('Tam Hata:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 