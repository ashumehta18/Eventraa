const mongoose = require('mongoose');

// server/controllers/reviewController.js
const Review = require('../models/Review');
const Event = require('../models/Event');
const Venue = require('../models/Venue');

// Get reviews for an event or venue
const getReviews = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    
    if (!['event', 'venue'].includes(type)) {
      return res.status(400).json({ message: 'Invalid review type' });
    }
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    const query = {
      reviewType: type,
      status: 'approved',
      [type]: new mongoose.Types.ObjectId(id)

    };
    
    // Sorting options
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'highest':
        sortOption = { rating: -1 };
        break;
      case 'lowest':
        sortOption = { rating: 1 };
        break;
      case 'most_helpful':
        sortOption = { helpfulVotes: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const reviews = await Review.find(query)
      .populate('user', 'name photo')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Review.countDocuments(query);
    
    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: query },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      averageRating: avgRating[0]?.avgRating || 0,
      totalReviews: avgRating[0]?.count || 0
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

// Create a new review
const createReview = async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user._id;
    
    if (!['event', 'venue'].includes(type)) {
      return res.status(400).json({ message: 'Invalid review type' });
    }
    
    // Check if user already reviewed this item
    const existingReview = await Review.findOne({
      user: userId,
      reviewType: type,
      [type]: new mongoose.Types.ObjectId(id)

    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this item' });
    }
    
    // Verify the event/venue exists
    if (type === 'event') {
      const event = await Event.findById(new mongoose.Types.ObjectId(id));
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
    } else {
      const venue = await Venue.findById(new mongoose.Types.ObjectId(id));
      if (!venue) {
        return res.status(404).json({ message: 'Venue not found' });
      }
    }
    
    const reviewData = {
      ...req.body,
      user: userId,
      reviewType: type,
      [type]: new mongoose.Types.ObjectId(id)

    };
    
    const review = new Review(reviewData);
    await review.save();
    
    // Populate user data for response
    await review.populate('user', 'name photo');
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error creating review',
      error: error.message 
    });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    
    const review = await Review.findOne({
      _id: reviewId,
      user: userId
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }
    
    // Update allowed fields
    const allowedUpdates = ['rating', 'comment', 'eventRatings', 'venueRatings', 'images', 'attended'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'name photo');
    
    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Error updating review' });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    
    const review = await Review.findOne({
      _id: reviewId,
      user: userId
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }
    
    await Review.findByIdAndDelete(reviewId);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
};

// Mark review as helpful
const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user already marked this review as helpful
    const alreadyHelpful = review.helpfulUsers.includes(userId);
    
    if (alreadyHelpful) {
      // Remove helpful vote
      review.helpfulUsers.pull(userId);
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    } else {
      // Add helpful vote
      review.helpfulUsers.push(userId);
      review.helpfulVotes += 1;
    }
    
    await review.save();
    
    res.json({
      helpfulVotes: review.helpfulVotes,
      isHelpful: !alreadyHelpful
    });
  } catch (error) {
    console.error('Error marking review helpful:', error);
    res.status(500).json({ message: 'Error updating helpful vote' });
  }
};

// Get user's reviews
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    
    const reviews = await Review.find({ user: userId })
      .populate('event', 'title image date')
      .populate('venue', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Review.countDocuments({ user: userId });
    
    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Error fetching user reviews' });
  }
};

// Get review statistics for an event/venue
const getReviewStats = async (req, res) => {
  try {
    const { type, id } = req.params;
    
    if (!['event', 'venue'].includes(type)) {
      return res.status(400).json({ message: 'Invalid review type' });
    }
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    const query = {
      reviewType: type,
      status: 'approved',
      [type]: new mongoose.Types.ObjectId(id)

    };
    
    const stats = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);
    
    if (stats.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }
    
    const result = stats[0];
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    result.ratingDistribution.forEach(rating => {
      ratingDistribution[rating]++;
    });
    
    res.json({
      averageRating: Math.round(result.averageRating * 10) / 10,
      totalReviews: result.totalReviews,
      ratingDistribution
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ message: 'Error fetching review statistics' });
  }
};

module.exports = {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getUserReviews,
  getReviewStats
};
