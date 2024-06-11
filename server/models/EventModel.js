const mongoose = require('mongoose');

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
  maxParticipants: {
    type: Number,
    required: true
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bannedParticipants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

module.exports = mongoose.model('Event', eventSchema);
