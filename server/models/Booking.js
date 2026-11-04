// server/models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  ticketType: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  unitPrice: {
    type: Number,
    min: 0,
  },
  qrCode: {
    type: String, // we'll store the GoQR image URL
  },
  status: {
    type: String,
    default: "Pending",
  },
  paymentDetails: {
    paymentId: { type: String, default: "" },
    paymentLinkId: { type: String, default: "" },
    status: { type: String, default: "" },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
