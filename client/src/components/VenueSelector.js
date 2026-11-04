// client/src/components/VenueSelector.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style.css";

function VenueSelector({ selectedVenue, onVenueSelect, onCustomVenue }) {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

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

  // Fetch venues from API
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/venues");
        setVenues(response.data);
      } catch (err) {
        console.error("Error fetching venues:", err);
        setError("Failed to load venues");
        // Fallback to hardcoded venues if API fails
        setVenues([
          {
            _id: "1",
            name: "JW Marriott Hotel",
            location: { city: "Mumbai", address: "Juhu Beach, Mumbai" },
            capacity: { min: 500, max: 2000 }
          },
          {
            _id: "2", 
            name: "Bangalore International Convention Centre",
            location: { city: "Bangalore", address: "Whitefield, Bangalore" },
            capacity: { min: 1000, max: 5000 }
          },
          {
            _id: "3",
            name: "Pragati Maidan",
            location: { city: "Delhi", address: "Mathura Road, Delhi" },
            capacity: { min: 2000, max: 10000 }
          },
          {
            _id: "4",
            name: "Taj Palace Hotel",
            location: { city: "Delhi", address: "Sardar Patel Marg, Delhi" },
            capacity: { min: 300, max: 1500 }
          },
          {
            _id: "5",
            name: "Beachside Resort",
            location: { city: "Goa", address: "Calangute Beach, Goa" },
            capacity: { min: 200, max: 800 }
          },
          {
            _id: "6",
            name: "Hyderabad Expo Centre",
            location: { city: "Hyderabad", address: "HITEC City, Hyderabad" },
            capacity: { min: 1000, max: 7000 }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const handleVenueSelect = (venue) => {
    onVenueSelect(venue);
    setShowDropdown(false);
  };

  const handleCreateNewVenue = () => {
    // Navigate to create venue page
    navigate("/create-venue");
  };

  const handleBrowseVenues = () => {
    // Navigate to venues page
    navigate("/venues");
  };

  if (loading) {
    return (
      <div className="venue-selector">
        <div className="loading">Loading venues...</div>
      </div>
    );
  }

  return (
    <div className="venue-selector">
      <h3>📍 Event Location</h3>
      
      {/* Selected Venue Display */}
      {selectedVenue && (
        <div className="selected-venue">
          <h4>Selected Venue:</h4>
          <div className="venue-card-small">
            <h5>{selectedVenue.name}</h5>
            <p>{selectedVenue.location.address}, {selectedVenue.location.city}</p>
            <p>Capacity: {formatCapacity(selectedVenue.capacity)} guests</p>
            <button 
              className="btn-outline btn-small"
              onClick={() => onVenueSelect(null)}
            >
              Change Venue
            </button>
          </div>
        </div>
      )}

      {/* Venue Selection Options */}
      {!selectedVenue && (
        <div className="venue-options">
          <div className="venue-option">
            <h4>🔹 Choose Existing Venue</h4>
            <div className="venue-dropdown">
              <button 
                className="dropdown-toggle"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                Select from existing venues ▼
              </button>
              
              {showDropdown && (
                <div className="dropdown-menu">
                  {venues.map((venue) => (
                    <div 
                      key={venue._id}
                      className="dropdown-item"
                      onClick={() => handleVenueSelect(venue)}
                    >
                      <div className="venue-item">
                        <h5>{venue.name}</h5>
                        <p>{venue.location.city} • {formatCapacity(venue.capacity)} guests</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              className="btn-outline"
              onClick={handleBrowseVenues}
            >
              Browse All Venues
            </button>
          </div>

          <div className="venue-option">
            <h4>🔹 Or Create New Venue</h4>
            <p>Don't see the venue you need? Create your own venue listing.</p>
            <button 
              className="btn-primary"
              onClick={handleCreateNewVenue}
            >
              Create New Venue
            </button>
          </div>
        </div>
      )}

      {/* Custom Venue Input (fallback) */}
      <div className="custom-venue-section">
        <h4>Or Enter Venue Details Manually:</h4>
        <div className="venue-inputs">
          <input 
            type="text" 
            name="venueName" 
            placeholder="Venue Name" 
            onChange={(e) => onCustomVenue('venueName', e.target.value)}
          />
          <input 
            type="text" 
            name="address" 
            placeholder="Address" 
            onChange={(e) => onCustomVenue('address', e.target.value)}
          />
          <input 
            type="text" 
            name="city" 
            placeholder="City" 
            onChange={(e) => onCustomVenue('city', e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default VenueSelector;
