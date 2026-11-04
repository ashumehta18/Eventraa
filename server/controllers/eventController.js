const Event = require("../models/Event");

// =======================
// Create Event
// =======================
const createEvent = async (req, res) => {
  try {
    const payload = req.body;

    // Default tickets if none provided
    if (!payload.tickets || payload.tickets.length === 0) {
      payload.tickets = [
        { type: "General", price: payload.price || 0, available: 100 },
      ];
    }

  // Attach organizer ID and createdBy for compatibility
  payload.organizer = req.user._id;
  payload.createdBy = req.user._id;

    const event = new Event(payload);
    await event.save();

    res.status(201).json(event);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =======================
// Get All Events (with filters)
// =======================
const getEvents = async (req, res) => {
  try {
    const { city, category, q } = req.query;
    const filter = {};

    if (city) filter["location.city"] = new RegExp(city, "i");
    if (category) filter.category = new RegExp(category, "i");
    if (q) {
      filter.$or = [
        { title: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
      ];
    }

    const events = await Event.find(filter)
      .populate("organizer", "name email")
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =======================
// Get Event by ID
// =======================
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json(event);
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =======================
// Update Event
// =======================
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Only organizer/creator can update
    const userId = req.user?._id?.toString();
    const ownerId = (event.createdBy || event.organizer || '').toString();
    if (userId !== ownerId) return res.status(403).json({ message: 'You are not allowed to update this event' });

    Object.assign(event, req.body);
    await event.save();
    res.json(event);
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =======================
// Delete Event
// =======================
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Only creator/organizer can delete
    const userId = req.user?._id?.toString();
    const ownerId = (event.createdBy || event.organizer || '').toString();
    if (userId !== ownerId) return res.status(403).json({ message: 'You are not allowed to delete this event' });

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Export functions
module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
