// server/models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  // User who wrote the review
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // What is being reviewed (either Event or Venue)
  reviewType: {
    type: String,
    enum: ['event', 'venue'],
    required: true
  },
  
  // Reference to the event or venue being reviewed
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: function() { return this.reviewType === 'event'; }
  },
  
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: function() { return this.reviewType === 'venue'; }
  },
  
  // Rating (1-5 stars)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Review text
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Additional rating categories for events
  eventRatings: {
    organization: { type: Number, min: 0, max: 5 },
    value: { type: Number, min: 0, max: 5 },
    atmosphere: { type: Number, min: 0, max: 5 }
  },
  
  // Additional rating categories for venues
  venueRatings: {
    cleanliness: { type: Number, min: 0, max: 5 },
    location: { type: Number, min: 0, max: 5 },
    amenities: { type: Number, min: 0, max: 5 },
    staff: { type: Number, min: 0, max: 5 }
  },
  
  // Review status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  
  // Helpful votes
  helpfulVotes: {
    type: Number,
    default: 0
  },
  
  // Users who found this review helpful
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Images attached to review
  images: [{
    type: String // URLs to images
  }],
  
  // Whether user attended the event (for event reviews)
  attended: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
ReviewSchema.index({ event: 1, user: 1 });
ReviewSchema.index({ venue: 1, user: 1 });
ReviewSchema.index({ reviewType: 1, status: 1 });

// Virtual for getting the reviewed item
ReviewSchema.virtual('reviewedItem', {
  ref: function() {
    return this.reviewType === 'event' ? 'Event' : 'Venue';
  },
  localField: function() {
    return this.reviewType === 'event' ? 'event' : 'venue';
  },
  foreignField: '_id',
  justOne: true
});

// Ensure one review per user per event/venue
ReviewSchema.index({ user: 1, event: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ user: 1, venue: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', ReviewSchema);
