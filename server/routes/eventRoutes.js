const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/roleMiddleware");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

// Public routes
router.get("/", getEvents);
router.get("/:id", getEventById);

// Protected routes (organizer only)
router.post("/", protect, authorizeRole("organizer"), createEvent);
router.put("/:id", protect, authorizeRole("organizer"), updateEvent);
router.delete("/:id", protect, authorizeRole("organizer"), deleteEvent);

module.exports = router;
