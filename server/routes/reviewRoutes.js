// server/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getUserReviews,
  getReviewStats
} = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/stats/:type/:id', getReviewStats); // Get review statistics
router.get('/user/my-reviews', authMiddleware, getUserReviews); // Get user's reviews
router.post('/:reviewId/helpful', authMiddleware, markHelpful); // Mark review as helpful

// Protected routes (require authentication)
router.get('/:type/:id', getReviews); // Get reviews for event/venue
router.post('/:type/:id', authMiddleware, createReview); // Create review
router.put('/:reviewId', authMiddleware, updateReview); // Update review
router.delete('/:reviewId', authMiddleware, deleteReview); // Delete review

module.exports = router;
