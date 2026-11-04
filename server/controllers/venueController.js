const Venue = require('../models/Venue');
const mongoose = require('mongoose');

// Get all venues
const getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find({ isActive: true }).select(
      'name location capacity amenities images pricing'
    );
    res.json(venues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ message: 'Error fetching venues' });
  }
};

// Get venue by ID
const getVenueById = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid venue ID format' });
    }

    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.json(venue);
  } catch (error) {
    console.error('Error fetching venue:', error);
    res.status(500).json({ message: 'Error fetching venue' });
  }
};

// Create new venue
const createVenue = async (req, res) => {
  try {
    const venueData = {
      ...req.body,
      createdBy: req.user?.id || req.user?._id || 'system'
    };

    if (typeof venueData.images === 'string') {
      venueData.images = venueData.images.trim() ? [venueData.images.trim()] : [];
    }
    if (typeof venueData.amenities === 'string') {
      venueData.amenities = venueData.amenities
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    const venue = new Venue(venueData);
    await venue.save();

    res.status(201).json(venue);
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ message: 'Error creating venue' });
  }
};

// Update venue
const updateVenue = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid venue ID format' });
    }

    const updates = { ...req.body };
    if (typeof updates.images === 'string') {
      updates.images = updates.images.trim() ? [updates.images.trim()] : [];
    }
    if (typeof updates.amenities === 'string') {
      updates.amenities = updates.amenities
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    const venue = await Venue.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    res.json(venue);
  } catch (error) {
    console.error('Error updating venue:', error);
    res.status(500).json({ message: 'Error updating venue' });
  }
};

// Delete venue (soft delete)
const deleteVenue = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid venue ID format' });
    }

    const venue = await Venue.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('Error deleting venue:', error);
    res.status(500).json({ message: 'Error deleting venue' });
  }
};

module.exports = {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue
};
