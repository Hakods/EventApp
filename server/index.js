const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/UserModel'); // Modeli import edin
const Event = require('./models/EventModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const app = express();

// .env dosyasındaki değişkenleri yükleyin
dotenv.config();

const secret = process.env.ACCESS_TOKEN_SECRET;

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

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni bir User belgesi oluştur
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
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
    // Kullanıcıyı e-posta ile bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'E-posta adresi veya şifre hatalı.' });
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'E-posta adresi veya şifre hatalı.' });
    }

    // JWT oluştur
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });
    res.json({ success: true, token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu hatası');
  }
});

// Etkinliklerin listelenmesi
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error('Etkinlikleri getirirken bir hata oluştu:', error);
    res.status(500).json({ message: 'Etkinlikleri getirirken bir hata oluştu' });
  }
});

// Etkinlik oluşturma
app.post('/home', async (req, res) => {
  const { eventName, eventDate, eventLocation, eventDescription, maxParticipants } = req.body;

  try {
    const newEvent = new Event({
      eventName,
      eventDate,
      eventLocation,
      eventDescription,
      maxParticipants,
      participants: []
    });

    const savedEvent = await newEvent.save();
    console.log('Etkinlik başarıyla kaydedildi:', savedEvent);
    res.status(201).json({ message: 'Etkinlik başarıyla oluşturuldu.', event: savedEvent });
  } catch (err) {
    console.error('Etkinlik kaydederken bir hata oluştu:', err);
    res.status(500).json({ message: 'Sunucu hatası: Etkinlik kaydedilemedi.' });
  }
});

// Etkinliğe katılma
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) return res.sendStatus(403);
    req.user = decodedToken;
    next();
  });
};

app.post('/events/:eventId/join', authenticateToken, async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.user.userId; // Authenticate middleware'den kullanıcı ID'sini alın
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }
    
    // Maksimum katılımcı sayısını kontrol et
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Etkinlik dolu' });
    }

    // Kullanıcının zaten katılımcı olup olmadığını kontrol et
    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: 'Kullanıcı zaten etkinliğe katılmış' });
    }

    // Etkinliğe katılımı güncelle
    event.participants.push(userId);
    await event.save();
    res.status(200).json({ message: 'Etkinliğe katılım başarılı', participants: event.participants });
  } catch (error) {
    console.error('Etkinliğe katılma işleminde bir hata oluştu:', error);
    res.status(500).json({ message: 'Etkinliğe katılım işlemi başarısız' });
  }
});

// Middleware: JWT Doğrulama
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
  if (!token) {
    return res.status(401).json({ error: 'Yetkilendirme başarısız: Token bulunamadı.' });
  }

  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ error: 'Yetkilendirme başarısız: Geçersiz token.' });
    }
    req.userId = decodedToken.userId;
    next();
  });
};

// Kullanıcı profili getirme endpoint'i
app.get('/user-profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password'); // Şifreyi döndürmemek için
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Kullanıcı bilgilerini getirirken bir hata oluştu:', error);
    res.status(500).json({ error: 'Sunucu hatası: Kullanıcı bilgileri getirilemedi.' });
  }
});

// Kullanıcıyı güncelleme endpoint'i
app.put('/user-profile', authMiddleware, async (req, res) => {
  try {
    const updatedUserData = req.body;
    const user = await User.findByIdAndUpdate(req.userId, updatedUserData, { new: true }).select('-password'); // Şifreyi döndürmemek için
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    res.json({ message: 'Kullanıcı bilgileri başarıyla güncellendi.', user });
  } catch (error) {
    console.error('Kullanıcı bilgilerini güncellerken bir hata oluştu:', error);
    res.status(500).json({ error: 'Sunucu hatası: Kullanıcı bilgileri güncellenemedi.' });
  }
});

// Port dinleme
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server başlatıldı, http://localhost:${PORT}`);
});
