import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ReviewList from "../components/ReviewList";
import ReviewForm from "../components/ReviewForm";
import StarRating from "../components/StarRating";
import EventLocationMap from "../components/EventLocationMap";
import "./../style.css";

/* 🎨 Random banner images */
const EVENT_BANNERS = [
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
  "https://images.unsplash.com/photo-1506157786151-b8491531f063",
  "https://images.unsplash.com/photo-1531058020387-3be344556be6"
];

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [popup, setPopup] = useState({ show: false, message: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewStats, setReviewStats] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [ticketQuantities, setTicketQuantities] = useState({});

  /* Stable stacked images */
  const img1 = useMemo(() => EVENT_BANNERS[id?.charCodeAt(0) % EVENT_BANNERS.length], [id]);
  const img2 = useMemo(() => EVENT_BANNERS[(id?.charCodeAt(0) + 1) % EVENT_BANNERS.length], [id]);
  const img3 = useMemo(() => EVENT_BANNERS[(id?.charCodeAt(0) + 2) % EVENT_BANNERS.length], [id]);

  useEffect(() => {
    axios.get(`/api/events/${id}`)
      .then(res => {
        setEvent(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching event:", err);
        setLoading(false);
      });
  }, [id]);

  /* ✅ BOOK TICKET LOGIC */
  const handleBook = async (ticketType, quantity) => {
    if (!auth.user) {
      navigate("/login");
      return;
    }

    if (quantity < 1) {
      alert("Please select at least 1 ticket");
      return;
    }

    try {
      // Create booking
      const res = await axios.post(
        `/api/bookings/${id}`,
        { ticketType, quantity },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      const newBooking = res.data.booking;
      setBooking(newBooking);

      // Create payment link
      const payRes = await fetch(`/api/payment/${newBooking._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const payData = await payRes.json();
      if (payRes.ok && payData.payment_link_url) {
        window.location.href = payData.payment_link_url;
      } else {
        alert(payData.message || "Failed to create payment link");
      }

    } catch (err) {
      const msg = err.response?.data?.message || "Error booking ticket";
      if (msg.toLowerCase().includes("already")) {
        setPopup({ show: true, message: msg });
      } else {
        alert(msg);
      }
    }
  };

  if (loading) return <h2>⏳ Loading event details...</h2>;
  if (!event) return <h2>❌ Event not found</h2>;

  return (
    <div className="event-details">

      {/* LEFT IMAGE COLUMN */}
      <div className="event-banner-container">
        <div className="event-banner equal-banner" style={{ backgroundImage: `url(${img1})` }} />
        <div className="event-banner equal-banner" style={{ backgroundImage: `url(${img2})` }} />
        <div className="event-banner equal-banner" style={{ backgroundImage: `url(${img3})` }} />
      </div>

      {/* RIGHT CONTENT */}
      <div className="event-content">
        <button onClick={() => navigate(-1)} className="btn colorful-button">
          ⬅ Back
        </button>

        <div className="event-card-large">
          <h1 className="event-title">{event.title}</h1>

          <p className="event-meta">
            📅 {new Date(event.date).toLocaleDateString()} | 📍 {event.location?.city}
          </p>

          <p className="event-attendees">
            👥 {event.attendees || "N/A"} going
          </p>

          {/* DESCRIPTION */}
          <div className="event-section">
            <h2>📖 Description</h2>
            <p>{event.description}</p>
          </div>

          {/* LOCATION */}
          <div className="event-section">
            <h2>📍 Location</h2>
            <p>
              {event.location?.venue}, {event.location?.address}, {event.location?.city}
            </p>

            {event.location?.coordinates && (
              <EventLocationMap
                latitude={event.location.coordinates.lat}
                longitude={event.location.coordinates.lng}
              />
            )}
          </div>

          {/* TICKETS */}
          <div className="event-section">
            <h2>💰 Tickets</h2>
            <ul className="ticket-list">
              {event.tickets?.map((ticket, idx) => (
                <li key={idx} className="ticket-item">
                  <div className="ticket-left">
                    {ticket.type} – ${ticket.price} ({ticket.available} left)
                  </div>

                  {ticket.available > 0 && (
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <input
                        type="number"
                        min="1"
                        max={ticket.available}
                        value={ticketQuantities[ticket.type] || 1}
                        onChange={(e) =>
                          setTicketQuantities({
                            ...ticketQuantities,
                            [ticket.type]: Number(e.target.value) || 1,
                          })
                        }
                      />

                      <button
                        className="btn colorful-button"
                        onClick={() =>
                          handleBook(ticket.type, ticketQuantities[ticket.type] || 1)
                        }
                      >
                        🎟 Book {ticket.type}
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* QR TICKET */}
          {booking &&
            (booking.paymentDetails?.status === "Paid" ||
              booking.status === "Confirmed") && (
              <div className="ticket-preview">
                <h3>Your Ticket</h3>
                <img src={booking.qrCode} alt="Ticket QR" className="qr-img" />
              </div>
            )}

          {/* REVIEWS */}
          <div className="event-section">
            <div className="reviews-header">
              <h2>⭐ Reviews & Ratings</h2>
              {reviewStats && (
                <div className="rating-display">
                  <span className="rating-number">
                    {reviewStats.averageRating?.toFixed(1)}
                  </span>
                  <StarRating rating={reviewStats.averageRating} readOnly />
                  <span className="review-count">
                    ({reviewStats.totalReviews})
                  </span>
                </div>
              )}
            </div>

            {auth.user && (
              <button
                className="btn-primary"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? "Cancel" : "Write a Review"}
              </button>
            )}

            {showReviewForm && auth.user && (
              <ReviewForm
                reviewType="event"
                itemId={id}
                existingReview={userReview}
                onReviewSubmitted={(review) => {
                  setUserReview(review);
                  setShowReviewForm(false);
                }}
              />
            )}

            <ReviewList
              reviewType="event"
              itemId={id}
              onReviewStats={setReviewStats}
            />
          </div>
        </div>
      </div>

      {/* POPUP */}
      {popup.show && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000 }}>
          <div className="popup">
            <p>{popup.message}</p>
            <button
              className="btn"
              onClick={() => setPopup({ show: false, message: "" })}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetails;
