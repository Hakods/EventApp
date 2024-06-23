const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/UserModel');
const Event = require('./models/EventModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const sendEmail = require('../src/components/sendEmail'); // E-posta gönderme fonksiyonu

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
    req.userId = decodedToken.userId; // decodedToken içinden kullanıcı ID'sini al
    next();
  });
};

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
    const events = await Event.find().populate('participants', 'username').populate('createdBy', 'username');
    res.status(200).json(events);
  } catch (error) {
    console.error('Etkinlikleri getirirken bir hata oluştu:', error);
    res.status(500).json({ message: 'Etkinlikleri getirirken bir hata oluştu' });
  }
});

// Etkinlik oluşturma
app.post('/home', authMiddleware, async (req, res) => {
  const { eventName, eventDate, eventLocation, eventDescription, maxParticipants } = req.body;

  try {
    const newEvent = new Event({
      eventName,
      eventDate,
      eventLocation,
      eventDescription,
      maxParticipants,
      participants: [],
      createdBy: req.userId
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
app.post('/events/:eventId/join', authMiddleware, async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.userId; // authMiddleware'den gelen userId
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }

    // Etkinliği oluşturan kişi kontrolü
    if (event.createdBy.toString() === req.userId.toString()) {
      return res.status(400).json({ message: 'Etkinliği oluşturan kişi etkinliğe katılamaz' });
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

// Etkinlikten katılımı kaldırma
app.post('/events/:eventId/leave', authMiddleware, async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.userId;

  try {
    // Etkinliği bul
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }

    // Kullanıcının etkinlikte olup olmadığını kontrol et
    const participantIndex = event.participants.indexOf(userId);
    if (participantIndex === -1) {
      return res.status(400).json({ message: 'Kullanıcı etkinlikte bulunmamaktadır' });
    }

    // Kullanıcıyı etkinlikten çıkar
    event.participants.splice(participantIndex, 1);
    await event.save();

    // Güncellenmiş etkinlik bilgilerini döndür
    const updatedEvent = await Event.findById(eventId).populate('participants', 'username').populate('createdBy', 'username');
    res.status(200).json({ message: 'Etkinlikten başarıyla çıkarıldı', event: updatedEvent });
  } catch (error) {
    console.error('Etkinlikten çıkarma işleminde bir hata oluştu:', error);
    res.status(500).json({ message: 'Etkinlikten çıkarma işlemi başarısız oldu' });
  }
});


// Katılımcıyı etkinlikten çıkarma
app.post('/events/:eventId/remove-participant/:userId', authMiddleware, async (req, res) => {
  const eventId = req.params.eventId;
  const userIdToRemove = req.params.userId;
  const { reason } = req.body;

  try {
    // Etkinliği bul
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }

    // Etkinliği oluşturan kişi kontrolü
    if (event.createdBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Sadece etkinlik sahibi katılımcıyı çıkarabilir' });
    }

    // Kullanıcının etkinlikte olup olmadığını kontrol et
    const participantIndex = event.participants.indexOf(userIdToRemove);
    if (participantIndex === -1) {
      return res.status(400).json({ message: 'Kullanıcı etkinlikte bulunmamaktadır' });
    }

    // Kullanıcıyı etkinlikten çıkar
    event.participants.splice(participantIndex, 1);
    await event.save();

    // Çıkarılan kullanıcıya e-posta gönderme işlemi
    const removedUser = await User.findById(userIdToRemove);
    if (removedUser) {
      const emailSubject = 'Etkinlikten çıkarıldınız';
      const emailBody = `Merhaba ${removedUser.username},\n\n ${event.eventName} etkinliğinden çıkarıldınız.\nNeden: ${reason}\n\nSaygılarımızla,\nEtkinlik Yönetimi`;
      sendEmail(removedUser.email, emailSubject, emailBody); // E-posta gönderme fonksiyonu
      console.log('E-posta gönderildi:', emailBody);
    }

    res.status(200).json({ message: 'Kullanıcı etkinlikten başarıyla çıkarıldı' });
  } catch (error) {
    console.error('Kullanıcıyı etkinlikten çıkarma işleminde bir hata oluştu:', error);
    res.status(500).json({ message: 'Kullanıcıyı etkinlikten çıkarma işlemi başarısız oldu' });
  }
});
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
    console.log('Güncellenen kullanıcı verileri:', updatedUserData); // Debug için eklenen log

    // Veritabanı güncelleme işlemi
    const user = await User.findByIdAndUpdate(req.userId, updatedUserData, { new: true }).select('-password'); // Şifreyi döndürmemek için

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    res.json({ message: 'Kullanıcı bilgileri başarıyla güncellendi.', user });
  } catch (error) {
    console.error('Kullanıcı bilgilerini güncellerken bir hata oluştu:', error.message); // Daha ayrıntılı hata mesajı
    console.error(error); // Hatanın tamamını loglayın
    res.status(500).json({ error: 'Sunucu hatası: Kullanıcı bilgileri güncellenemedi.' });
  }
});


// Etkinlik detaylarını getirme
app.get('/events/:eventId', async (req, res) => {
  const eventId = req.params.eventId;

  try {
    const event = await Event.findById(eventId).populate('participants', 'username').populate('createdBy', 'username');
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('Etkinlik detaylarını getirirken bir hata oluştu:', error);
    res.status(500).json({ message: 'Etkinlik detaylarını getirirken bir hata oluştu' });
  }
});



// Port dinleme
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server başlatıldı, http://localhost:${PORT}`);
});