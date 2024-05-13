const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/UserModel'); // Modeli import edin
const Event = require('./models/EventModel');
const jwt = require('jsonwebtoken');



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



// Etkinlik oluşturma
app.post('/home', async (req, res) => {
  const { eventName, eventDate, eventLocation, eventDescription, maxParticipants } = req.body; // Maksimum katılımcı sayısını da al
  try {
    // Yeni bir Etkinlik belgesi oluştur
    const newEvent = new Event({
      eventName,
      eventDate,
      eventLocation,
      eventDescription,
      maxParticipants, // Maksimum katılımcı sayısını kaydet
      participants: [] // Başlangıçta katılımcı yok
    });

    // MongoDB'ye kaydet
    await newEvent.save()
      .then(savedEvent => {
        console.log('Etkinlik başarıyla kaydedildi:', savedEvent);
        res.status(201).json({ message: 'Etkinlik başarıyla oluşturuldu.' });
      })
      .catch(err => {
        console.error('Etkinlik kaydederken bir hata oluştu:', err);
        res.status(500).send('Sunucu hatası');
      });
  } catch (err) {
    console.error('Etkinlik kaydederken bir hata oluştu:', err);
    res.status(500).send('Sunucu hatası');
  }
});

// Etkinliğe katılma
app.post('/events/:eventId/join', async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }
    
    // Maksimum katılımcı sayısını kontrol et
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Etkinlik dolu' });
    }

    // Etkinliğe katılımı güncelle
    event.participants.push(req.userId); // Varsayılan olarak, kullanıcı kimliğini burada kullanıyoruz
    await event.save();
    res.status(200).json({ message: 'Etkinliğe katılım başarılı' });
  } catch (error) {
    console.error('Etkinliğe katılma işleminde bir hata oluştu:', error);
    res.status(500).json({ message: 'Etkinliğe katılım işlemi başarısız' });
  }
});

// Sunucu tarafında etkinlikleri getiren endpoint
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find(); // Tüm etkinlikleri al
    res.status(200).json(events); // Alınan etkinlikleri istemciye gönder
  } catch (error) {
    console.error('Etkinlikleri getirirken bir hata oluştu:', error);
    res.status(500).json({ message: 'Etkinlikleri getirirken bir hata oluştu' });
  }
});

// /user-profile endpoint'i
app.get('/user-profile', async (req, res) => {
  try {
    // Oturum açmış kullanıcının JWT'sini al
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (!token) {
      return res.status(401).json({ error: 'Yetkilendirme başarısız: Token bulunamadı.' });
    }
    // JWT'yi doğrula ve kullanıcı kimliğini al
    const decodedToken = jwt.verify(token, 'your_jwt_secret');
    const userId = decodedToken.userId;

    // Kullanıcıyı bul
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    // Kullanıcının bilgilerini döndür
    res.json(user);
  } catch (error) {
    console.error('Kullanıcı bilgilerini getirirken bir hata oluştu:', error);
    res.status(500).json({ error: 'Sunucu hatası: Kullanıcı bilgileri getirilemedi.' });
  }
});


// Kullanıcıyı güncelleme endpoint'i
app.put('/user-profile', async (req, res) => {
  try {
    // Oturum açmış kullanıcının JWT'sini al
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (!token) {
      return res.status(401).json({ error: 'Yetkilendirme başarısız: Token bulunamadı.' });
    }
    // JWT'yi doğrula ve kullanıcı kimliğini al
    const decodedToken = jwt.verify(token, 'your_jwt_secret');
    const userId = decodedToken.userId;

    // Güncellenecek kullanıcı bilgilerini al
    const updatedUserData = req.body;

    // Kullanıcıyı güncelle
    await User.findByIdAndUpdate(userId, updatedUserData);

    res.json({ message: 'Kullanıcı bilgileri başarıyla güncellendi.' });
  } catch (error) {
    console.error('Kullanıcı bilgilerini güncellerken bir hata oluştu:', error);
    res.status(500).json({ error: 'Sunucu hatası: Kullanıcı bilgileri güncellenemedi.' });
  }
});




// Port dinleme
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});
