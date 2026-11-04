// server/models/Event.js
const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  type: { type: String, default: 'General' },
  price: { type: Number, default: 0 },
  available: { type: Number, default: 0 }
});

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  image: { type: String, default: '' },         // image URL
  date: { type: Date, default: Date.now },
  location: {
    venue: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  tickets: { type: [TicketSchema], default: [] },
  price: { type: Number, default: 0 },           // fallback price
  tags: { type: [String], default: [] },
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.Mixed, default: 'system' }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
