// EventModel.js

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventLocation: { type: String, required: true },
  eventDescription: { type: String, required: true },
  maxParticipants: { type: Number, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // User modeline referans
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
