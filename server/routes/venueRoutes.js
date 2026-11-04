const express = require('express');
const router = express.Router();
const {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue
} = require('../controllers/venueController');
const protect = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getAllVenues);
router.get('/:id', getVenueById);

// Protected routes - Only organizers can create, update, delete venues
router.post('/', protect, authorizeRole('organizer'), createVenue);
router.put('/:id', protect, authorizeRole('organizer'), updateVenue);
router.delete('/:id', protect, authorizeRole('organizer'), deleteVenue);

module.exports = router;
