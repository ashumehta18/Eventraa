// src/pages/TrendingEvents.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./../style.css";

function TrendingEvents() {
  // ✅ Static trending events
  const demoTrending = [
    {
      id: "trend-1",
      title: "Coldplay World Tour",
      date: "2025-09-20",
      location: "Delhi, India",
      image:
        "https://www.sganalytics.com/wp-content/uploads/2024/12/0958a-coldplay-concert-in-india.jpg",
    },
    {
      id: "trend-2",
      title: "AI Global Summit",
      date: "2025-10-05",
      location: "Bangalore, India",
      image:
        "https://images.stockcake.com/public/2/9/2/292f8e62-8891-41bb-9d82-cf81027244bf_large/tech-conference-speech-stockcake.jpg",
    },
    {
      id: "trend-3",
      title: "Food & Music Festival",
      date: "2025-11-15",
      location: "Goa, India",
      image:
        "https://c8.alamy.com/comp/E6G8JN/state-fair-food-concessions-E6G8JN.jpg",
    },
  ];

  const [dbEvents, setDbEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch events from backend
  useEffect(() => {
    axios
      .get("/api/events")
      .then((res) => {
        setDbEvents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2>⏳ Loading trending events...</h2>;

  // ✅ Merge static + DB events
  const allEvents = [...demoTrending, ...dbEvents];

  return (
    <section className="trending-section">
      <h2 className="section-title">🔥 Trending Events Near You</h2>
      <div className="events-grid">
        {allEvents.map((event) => (
          <div key={event._id || event.id} className="event-card">
            <img src={event.image} alt={event.title} className="event-img" />
            <div className="event-info">
              <h3>{event.title}</h3>
              <p>
                📅{" "}
                {event.date
                  ? new Date(event.date).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Date TBA"}{" "}
                • 📍 {event.location?.city || event.location || "Unknown"}
              </p>
              {/* ✅ Works for static + db events */}
              <Link to={`/event/${event._id || event.id}`}>
                <button className="event-btn">Book Now</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrendingEvents;
