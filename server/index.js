const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/FormData'); // Modeli import edin

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/user', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Kullanıcı kaydı
app.post('/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).send(newUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Port dinleme
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});
