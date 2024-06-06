const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const authMiddleware = require('../middleware/authMiddleware');

// Kullanıcı profili getirme
router.get('/user-profile', authMiddleware, async (req, res) => {
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

// Kullanıcıyı güncelleme
router.put('/user-profile', authMiddleware, async (req, res) => {
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

module.exports = router;
