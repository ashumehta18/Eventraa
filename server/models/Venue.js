// server/models/Venue.js
const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  location: { 
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  capacity: { 
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  amenities: [{ type: String }],
  images: [{ type: String }],
  contactInfo: {
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  pricing: {
    basePrice: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
  availability: {
    isAvailable: { type: Boolean, default: true },
    availableDates: [{ type: Date }]
  },
  createdBy: { type: String, default: 'system' }, // organizer id
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Venue', VenueSchema);
