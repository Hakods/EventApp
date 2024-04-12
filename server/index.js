const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/UserModel'); // Modeli import edin


const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/user', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Kullanıcı kaydı
app.post('/register', async (req, res) => {
  const { username, email, password, gender } = req.body;
  try {
    // E-posta adresinin veritabanında daha önce kaydedilip kaydedilmediğini kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // E-posta adresi zaten kullanılıyor
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor.' });
    }

    // Yeni bir User belgesi oluştur
    const newUser = new User({
      username,
      email,
      password,
      gender
    });

    // MongoDB'ye kaydet
    await newUser.save();
    console.log('Kullanıcı başarıyla kaydedildi');
    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu hatası');
  }
});


// Kullanıcı girişi
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // E-posta adresi ve şifreyle kullanıcıyı bul
    const user = await User.findOne({ email, password });
    if (user) {
      // Kullanıcı bulundu, başarılı giriş
      return res.status(200).json({ success: true, message: 'Başarıyla giriş yapıldı.' });
    } else {
      // Kullanıcı bulunamadı, hatalı giriş
      return res.status(401).json({ success: false, message: 'E-posta adresi veya şifre hatalı.' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu hatası');
  }
});






// Port dinleme
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});
