const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const Event = require("../models/Event");
const Booking = require("../models/Booking");

// dynamic import for node-fetch (fix ESM issue)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

/**
 * POST /api/bookings/:eventId
 * Book a ticket for an event
 * Private (Users only)
 */
router.post("/:eventId", protect, async (req, res) => {
  let booking;
  let reservedTicketType;
  let reservedQuantity = 0;

  try {
    const eventId = req.params.eventId;
    const userId = req.user._id;
    const { ticketType, quantity = 1 } = req.body;
    const requestedQuantity = Number(quantity);

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      return res.status(400).json({ message: "Quantity must be a positive whole number" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const ticket = ticketType
      ? event.tickets.find(t => t.type === ticketType)
      : event.tickets[0];

    if (!ticket) {
      return res.status(400).json({ message: "Ticket type not found!" });
    }

    const paidBooking = await Booking.findOne({
      user: userId,
      event: eventId,
      $or: [{ status: "Confirmed" }, { "paymentDetails.status": "Paid" }],
    });
    if (paidBooking) {
      return res.status(400).json({ message: "You already booked this event!" });
    }

    const pendingBooking = await Booking.findOne({
      user: userId,
      event: eventId,
      status: "Pending",
    });
    if (pendingBooking) {
      if (pendingBooking.ticketType !== ticket.type || pendingBooking.quantity !== requestedQuantity) {
        return res.status(409).json({
          message: `You have a pending booking for ${pendingBooking.quantity} ${pendingBooking.ticketType} ticket(s). Select the same ticket and quantity to continue payment.`,
        });
      }
      return res.json({ booking: pendingBooking });
    }

    const reservedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        tickets: {
          $elemMatch: {
            type: ticket.type,
            available: { $gte: requestedQuantity },
          },
        },
      },
      { $inc: { "tickets.$.available": -requestedQuantity } },
      { new: true }
    );
    if (!reservedEvent) {
      return res.status(400).json({
        message: `Not enough tickets available for ${ticket.type}. Please refresh and try again.`,
      });
    }
    reservedTicketType = ticket.type;
    reservedQuantity = requestedQuantity;

    booking = new Booking({
      user: userId,
      event: eventId,
      ticketType: ticket.type,
      quantity: requestedQuantity,
      unitPrice: ticket.price || 0,
    });
    await booking.save();

    await booking.populate('event');
    await booking.populate('user');

    const serverUrl = (process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const verificationUrl = `${serverUrl}/api/bookings/verify/${booking._id}`;

    const qrResponse = await fetch(
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`
    );
    if (!qrResponse.ok) {
      throw new Error(`QR code service failed with status ${qrResponse.status}`);
    }
    const qrBuffer = await qrResponse.arrayBuffer();
    const qrBase64 = `data:image/png;base64,${Buffer.from(qrBuffer).toString("base64")}`;

    booking.qrCode = qrBase64;
    await booking.save();

    res.json({ booking });
  } catch (err) {
    if (booking?._id) {
      await Booking.deleteOne({ _id: booking._id, status: "Pending" });
    }
    if (reservedTicketType && reservedQuantity) {
      await Event.updateOne(
        { _id: req.params.eventId, "tickets.type": reservedTicketType },
        { $inc: { "tickets.$.available": reservedQuantity } }
      );
    }
    console.error("Booking error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 *  GET /api/bookings/my
 *  Get logged-in user's bookings
 *  Private
 */
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
      $or: [{ status: "Confirmed" }, { "paymentDetails.status": "Paid" }],
    })
      .populate("event", "title date location image");
    res.json(bookings);
  } catch (err) {
    console.error("Fetch bookings error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/bookings/verify/:bookingId
 * Public endpoint to verify and display booking details from QR scan
 * No authentication required (public verification)
 * MUST be before /event/:eventId to avoid route conflicts
 */
router.get("/verify/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('event')
      .populate('user', 'name email');
    
    if (!booking) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #e74c3c; text-align: center; }
            h1 { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Booking Not Found</h1>
            <p class="error">This booking does not exist or has been cancelled.</p>
          </div>
        </body>
        </html>
      `);
    }

    if (booking.status !== "Confirmed" && booking.paymentDetails?.status !== "Paid") {
      return res.status(402).send(`
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Payment Required</title></head>
        <body style="font-family: Arial, sans-serif; padding: 24px; text-align: center;">
          <h1>Payment not confirmed</h1>
          <p>This booking is not a valid ticket because payment has not been verified.</p>
        </body>
        </html>
      `);
    }

    // Display booking details in a nicely formatted HTML page
    const eventDate = booking.event?.date ? new Date(booking.event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Date TBD';

    const eventTime = booking.event?.date ? new Date(booking.event.date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }) : '';

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Verification</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            margin: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .status {
            background: #2ecc71;
            color: white;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            font-size: 18px;
          }
          .content {
            padding: 30px;
          }
          .detail-row {
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .label {
            font-size: 12px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          .value {
            font-size: 18px;
            color: #333;
            font-weight: 600;
          }
          .booking-id {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #666;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          .icon {
            font-size: 50px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">🎟️</div>
            <h1>Booking Verified</h1>
          </div>
          
          <div class="status">
            ✓ VALID TICKET
          </div>
          
          <div class="content">
            <div class="detail-row">
              <div class="label">Event Name</div>
              <div class="value">${booking.event?.title || 'N/A'}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Attendee Name</div>
              <div class="value">${booking.user?.name || 'Guest'}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Email</div>
              <div class="value">${booking.user?.email || 'N/A'}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Ticket Type</div>
              <div class="value">${booking.ticketType}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Quantity</div>
              <div class="value">${booking.quantity || 1} ticket(s)</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Event Date & Time</div>
              <div class="value">${eventDate}<br>${eventTime}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Venue</div>
              <div class="value">${booking.event?.location?.venue || 'N/A'}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">City</div>
              <div class="value">${booking.event?.location?.city || 'N/A'}</div>
            </div>
            
            <div class="booking-id">
              <strong>Booking ID:</strong><br>
              ${booking._id}
            </div>
          </div>
          
          <div class="footer">
            Scanned at ${new Date().toLocaleString()}<br>
            Powered by Eventra
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Verify booking error:", err.message);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { color: #e74c3c; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ Error</h1>
          <p class="error">Unable to verify booking. Please try again later.</p>
        </div>
      </body>
      </html>
    `);
  }
});

/**
 * GET /api/bookings/event/:eventId
 *    Organizer can see attendees list
 *  Private
 */
router.get("/event/:eventId", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({
      event: req.params.eventId,
      $or: [{ status: "Confirmed" }, { "paymentDetails.status": "Paid" }],
    })
      .populate("user", "name email");
    res.json(bookings);
  } catch (err) {
    console.error("Fetch attendees error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/bookings/scan-verify
 * Public endpoint to display booking details from scanned QR JSON data
 * Used when QR scanner apps return the embedded JSON data
 */
router.post("/scan-verify", async (req, res) => {
  try {
    const qrData = req.body;

    if (!qrData || !qrData.bookingId) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invalid QR</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #e74c3c; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Invalid QR Code</h1>
            <p class="error">This QR code does not contain valid booking information.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Format event date
    const eventDate = qrData.eventDate ? new Date(qrData.eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Date TBD';

    const eventTime = qrData.eventDate ? new Date(qrData.eventDate).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }) : '';

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Verification</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            margin: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .status {
            background: #2ecc71;
            color: white;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            font-size: 18px;
          }
          .content {
            padding: 30px;
          }
          .detail-row {
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .label {
            font-size: 12px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          .value {
            font-size: 18px;
            color: #333;
            font-weight: 600;
          }
          .booking-id {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #666;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          .icon {
            font-size: 50px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">🎟️</div>
            <h1>Booking Verified</h1>
          </div>
          
          <div class="status">
            ✓ VALID TICKET
          </div>
          
          <div class="content">
            <div class="detail-row">
              <div class="label">Event Name</div>
              <div class="value">${qrData.eventName || 'N/A'}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Attendee Name</div>
              <div class="value">${qrData.userName || 'Guest'}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Email</div>
              <div class="value">${qrData.userEmail || 'N/A'}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Ticket Type</div>
              <div class="value">${qrData.ticketType}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Quantity</div>
              <div class="value">${qrData.quantity || 1} ticket(s)</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Event Date & Time</div>
              <div class="value">${eventDate}<br>${eventTime}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Venue</div>
              <div class="value">${qrData.venue || 'N/A'}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Address</div>
              <div class="value">${qrData.address || 'N/A'}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">City</div>
              <div class="value">${qrData.city || 'N/A'}</div>
            </div>
            
            <div class="booking-id">
              <strong>Booking ID:</strong><br>
              ${qrData.bookingId}
            </div>
          </div>
          
          <div class="footer">
            Scanned at ${new Date().toLocaleString()}<br>
            Powered by Eventra
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Scan verify error:", err.message);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { color: #e74c3c; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ Error</h1>
          <p class="error">Unable to verify booking. Please try again later.</p>
        </div>
      </body>
      </html>
    `);
  }
});

module.exports = router;
