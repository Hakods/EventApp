const mongoose = require('mongoose');

// Etkinlik şeması
const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventLocation: {
    type: String,
    required: true
  },
  eventDescription: {
    type: String,
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

// Etkinlik modeli
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
