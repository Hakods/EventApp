const express = require('express');
const router = express.Router();
const Event = require('../models/EventModel');
const authMiddleware = require('../middleware/authMiddleware');

// Etkinlik oluşturma
router.post('/home', authMiddleware, async (req, res) => {
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
router.post('/events/:eventId/join', authMiddleware, async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.userId;
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }

    // Etkinliği oluşturan kişi kontrolü
    if (event.createdBy.toString() === userId.toString()) {
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

module.exports = router;
