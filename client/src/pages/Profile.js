// src/pages/Profile.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./../style.css";

function Profile() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [goodiesOrders, setGoodiesOrders] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [attendees, setAttendees] = useState({});
  const [stats, setStats] = useState({ totalEvents: 0, totalAttendees: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.user) navigate("/login");
  }, [auth.user, navigate]);

  // Fetch bookings for users
  useEffect(() => {
    if (auth.user?.role === "user") {
      axios
        .get("/api/bookings/my", {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        .then((res) => {
          setBookings(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));

      axios
        .get("/api/goodies/my", {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        .then((res) => setGoodiesOrders(res.data))
        .catch(() => {});
    }
  }, [auth]);

  // Fetch organizer’s events and stats
  useEffect(() => {
    if (auth.user?.role === "organizer") {
      axios
        .get("/api/events", {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        .then(async (res) => {
          const userId = String(auth.user._id);
          const mine = res.data.filter((e) => {
            const organizerId = e.organizer?._id || e.organizer;
            return (
              String(organizerId || "") === userId ||
              String(e.createdBy || "") === userId
            );
          });
          setMyEvents(mine);

          // fetch attendees for stats
          let totalAttendees = 0;
          let revenue = 0;

          for (const event of mine) {
            const res2 = await axios.get(`/api/bookings/event/${event._id}`, {
              headers: { Authorization: `Bearer ${auth.token}` },
            });
            totalAttendees += res2.data.length;
            revenue += res2.data.length * (event.tickets?.[0]?.price || 0);
          }

          setStats({ totalEvents: mine.length, totalAttendees, revenue });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [auth]);

  const fetchAttendees = async (eventId) => {
    try {
      const res = await axios.get(`/api/bookings/event/${eventId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setAttendees((prev) => ({ ...prev, [eventId]: res.data }));
    } catch (err) {
      console.error("Error fetching attendees:", err);
    }
  };

  if (!auth.user) return null;

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <img
          src={
            auth.user.photo ||
            "https://cdn-icons-png.flaticon.com/512/847/847969.png"
          }
          alt="Profile"
          className="profile-avatar"
        />
        <div>
          <h2>{auth.user.name}</h2>
          <p>{auth.user.email}</p>
          <span className="role-badge">
            {auth.user.role === "organizer" ? "Event Organizer" : "Attendee"}
          </span>
        </div>
        <button className="logout-btn" onClick={logout}>
          ⎋ Logout
        </button>
      </div>

      {/* User Bookings */}
      {auth.user.role === "user" && (
        <div className="profile-section">
          <h3>🎟 My Bookings</h3>
          {loading ? (
            <p>Loading bookings...</p>
          ) : bookings.length > 0 ? (
            <ul className="booking-list">
              {bookings.map((b) => (
                <li key={b._id} className="booking-card">
                  <img src={b.event?.image} alt={b.event?.title || "Event"} className="booking-img" />
                  <div>
                    <h4>{b.event?.title || "Event unavailable"}</h4>
                    <p>
                      📅 {b.event?.date ? new Date(b.event.date).toLocaleDateString() : "Date TBD"} | 📍{" "}
                      {b.event?.location?.city || "Unknown"}
                    </p>
                    <p>Ticket: {b.ticketType}</p>
                    {b.qrCode && <img src={b.qrCode} alt="QR" className="qr-small" />}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No bookings yet.</p>
          )}
        </div>
      )}

      {/* Goodies Orders */}
      {auth.user.role === "user" && (
        <div className="profile-section">
          <h3>🛍 My Goodies Orders</h3>
          {goodiesOrders.length > 0 ? (
            <ul className="booking-list">
              {goodiesOrders.map((o) => (
                <li key={o._id} className="booking-card">
                  <div>
                    <h4>Order #{o.razorpayOrderId || o._id.slice(-6)}</h4>
                    <p>
                      ₹{(o.amount / 100).toFixed(2)} · {o.currency}
                    </p>
                    <p>
                      {new Date(o.createdAt || o._id.slice(0, 8)).toLocaleString()}
                    </p>
                    <p style={{ marginTop: "0.5rem", fontWeight: 600 }}>Items:</p>
                    <ul style={{ paddingLeft: "1rem", color: "#4b5563" }}>
                      {o.cartItems.map((item, idx) => (
                        <li key={idx}>
                          {item.name} × {item.qty} — ₹{item.price}
                        </li>
                      ))}
                    </ul>
                    {o.shipping?.address && (
                      <p style={{ marginTop: "0.5rem" }}>
                        Ship to: {o.shipping.name}, {o.shipping.address}, {o.shipping.city} {o.shipping.zip}, {o.shipping.country}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No goodies orders yet.</p>
          )}
        </div>
      )}

      {/* Organizer Dashboard */}
      {auth.user.role === "organizer" && (
        <div className="profile-section">
          <h3>📊 Organizer Dashboard</h3>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card green">
              <h2>{stats.totalEvents}</h2>
              <p>Total Events</p>
            </div>
            <div className="stat-card purple">
              <h2>{stats.totalAttendees}</h2>
              <p>Total Attendees</p>
            </div>
            <div className="stat-card orange">
              <h2>${stats.revenue}</h2>
              <p>Revenue</p>
            </div>
          </div>

          <button className="event-btn" onClick={() => navigate("/create-event")}>
            ➕ Create Event
          </button>

          <h3 className="mt-4">📋 My Events</h3>
          {myEvents.length === 0 ? (
            <p>You haven’t created any events yet.</p>
          ) : (
            myEvents.map((event) => (
              <div key={event._id} className="event-card-small">
                <h4>{event.title}</h4>
                <p>
                  📅 {event.date ? new Date(event.date).toLocaleDateString() : "Date TBD"} | 📍{" "}
                  {event.location?.city || "Unknown"}
                </p>
                <button
                  className="small-btn"
                  onClick={() => fetchAttendees(event._id)}
                >
                  👥 View Attendees
                </button>

                {attendees[event._id] && (
                  <ul className="attendee-list">
                    {attendees[event._id].length > 0 ? (
                      attendees[event._id].map((a) => (
                        <li key={a._id} className="attendee-card">
                          {a.user?.name || "Guest"} ({a.user?.email || "N/A"}) — 🎟 {a.ticketType}
                        </li>
                      ))
                    ) : (
                      <li>No attendees yet</li>
                    )}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
