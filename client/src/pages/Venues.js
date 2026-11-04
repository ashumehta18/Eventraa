// client/src/pages/Venues.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../style.css";

function Venues() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatCapacity = (cap) => {
    if (!cap && cap !== 0) return 'N/A';
    if (typeof cap === 'string') return cap;
    if (typeof cap === 'object') {
      const min = cap.min ?? 0;
      const max = cap.max ?? 0;
      return `${min} - ${max}`;
    }
    return String(cap);
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await axios.get("/api/venues");
      setVenues(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching venues:", error);
      setError("Failed to load venues");
      setLoading(false);
    }
  };

  const placeholder =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='24'%3ENo Image%3C/text%3E%3C/svg%3E";

  if (loading) {
    return (
      <section className="venues-section">
        <h2 className="section-title">🏛 Popular Venues</h2>
        <div className="loading">Loading venues...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="venues-section">
        <h2 className="section-title">🏛 Popular Venues</h2>
        <div className="error">{error}</div>
      </section>
    );
  }

  return (
    <section className="venues-section">
      <h2 className="section-title">🏛 Popular Venues</h2>

      {/* Grid for 3 cards per row */}
      <div
        className="venues-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
        }}
      >
        {venues.map((venue) => (
          <div
            key={venue._id}
            className="venue-card"
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Updated Image */}
            <img
              src={venue.images && venue.images[0] ? venue.images[0] : placeholder}
              alt={venue.name}
              className="venue-img"
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.currentTarget.src = placeholder;
              }}
            />

            <div className="venue-info" style={{ padding: "1rem", flexGrow: 1 }}>
              <h3>{venue.name}</h3>
              <p>
                {venue.location?.address}, {venue.location?.city}
              </p>
              <p>
                <strong>Capacity:</strong> {formatCapacity(venue.capacity)} Guests
              </p>
              <p className="venue-description">{venue.description}</p>
              <div className="venue-amenities">
                {venue.amenities &&
                  venue.amenities.slice(0, 3).map((amenity, index) => (
                    <span
                      key={index}
                      style={{
                        display: "inline-block",
                        background: "#e0f2fe",
                        color: "#0369a1",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        marginRight: "0.25rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {amenity}
                    </span>
                  ))}
              </div>

              {/* Buttons */}
              <div
                className="venue-actions"
                style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}
              >
                <button
                  onClick={() => navigate(`/venues/${venue._id}`)}
                  style={{
                    flex: 1,
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1e40af")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
                >
                  View Details
                </button>

                {/* Only organizers can edit and delete venues */}
                {auth.user && auth.user.role === "organizer" && (
                  <>
                    <button
                      onClick={() => navigate(`/venues/edit/${venue._id}`)}
                      style={{
                        flex: 1,
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#10b981",
                        color: "#fff",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#059669")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#10b981")}
                    >
                      Edit
                    </button>

                    <button
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to delete this venue?")) {
                          try {
                            await axios.delete(`/api/venues/${venue._id}`, {
                              headers: { Authorization: `Bearer ${auth.token}` },
                            });
                            setVenues(venues.filter((v) => v._id !== venue._id));
                            alert("Venue deleted successfully!");
                          } catch (err) {
                            console.error(err);
                            alert("Failed to delete venue.");
                          }
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#ef4444",
                        color: "#fff",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#b91c1c")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create New Venue Button - Only for organizers */}
      {auth.user && auth.user.role === "organizer" && (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            className="btn-primary"
            onClick={() => navigate("/create-venue")}
            style={{
              padding: "0.65rem 1.25rem",
              borderRadius: "8px",
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1e40af")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
          >
            ➕ Create New Venue
          </button>
        </div>
      )}
    </section>
  );
}

export default Venues;
