// client/src/pages/CreateVenue.js
import React, { useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MapLocationPicker from "../components/MapLocationPicker";
import "../style.css";

function CreateVenue() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: {
      address: "",
      city: "",
      state: "",
      country: "India",
      coordinates: { lat: 28.6139, lng: 77.209 }
    },
    capacity: {
      min: "",
      max: ""
    },
    amenities: "",
    images: "",
    contactInfo: {
      phone: "",
      email: "",
      website: ""
    },
    pricing: {
      basePrice: "",
      currency: "INR"
    }
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [venueCreated, setVenueCreated] = useState(false);
  const [createdVenue, setCreatedVenue] = useState(null);

  const handleMapLocationSelect = useCallback(({ coordinates, address, city, state, country }) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: coordinates || prev.location.coordinates,
        address: address || prev.location.address,
        city: city || prev.location.city,
        state: state || prev.location.state,
        country: country || prev.location.country,
      },
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const venueData = {
        ...formData,
        capacity: {
          min: parseInt(formData.capacity.min),
          max: parseInt(formData.capacity.max)
        },
        pricing: {
          ...formData.pricing,
          basePrice: parseFloat(formData.pricing.basePrice) || 0
        },
        amenities: formData.amenities.split(',').map(item => item.trim()).filter(item => item)
      };

      const response = await axios.post("/api/venues", venueData, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

  // Show a success modal instead of redirecting
  setCreatedVenue(response.data);
  setVenueCreated(true);
    } catch (error) {
      console.error("Error creating venue:", error);
      alert("Error creating venue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-venue">
      <div className="form-container" style={{ maxWidth: 900, margin: '40px auto', background: '#fff', padding: 28, borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>
        <h1 className="form-title">Create New Venue</h1>
        <p className="form-subtitle">
          Add your venue to our platform and make it available for event organizers.
        </p>

        <form onSubmit={handleSubmit} className="venue-form">
          {/* Basic Information */}
          <div className="form-section">
            <h2>📌 Basic Information</h2>
            <input
              type="text"
              name="name"
              placeholder="Venue Name *"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <textarea
              name="description"
              placeholder="Venue Description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          {/* Location */}
          <div className="form-section">
            <h2>📍 Location Details</h2>
            <input
              type="text"
              name="location.address"
              placeholder="Address *"
              value={formData.location.address}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="location.city"
              placeholder="City *"
              value={formData.location.city}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="location.state"
              placeholder="State"
              value={formData.location.state}
              onChange={handleChange}
            />
            <select
              name="location.country"
              value={formData.location.country}
              onChange={handleChange}
            >
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
            </select>

            <MapLocationPicker
              initialLocation={formData.location.coordinates}
              onLocationSelect={handleMapLocationSelect}
            />
          </div>

          {/* Capacity */}
          <div className="form-section">
            <h2>👥 Capacity</h2>
            <div className="capacity-inputs">
              <input
                type="number"
                name="capacity.min"
                placeholder="Minimum Capacity *"
                value={formData.capacity.min}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="capacity.max"
                placeholder="Maximum Capacity *"
                value={formData.capacity.max}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="form-section">
            <h2>🏆 Amenities</h2>
            <input
              type="text"
              name="amenities"
              placeholder="Amenities (comma separated) - e.g., Wi-Fi, Parking, Catering"
              value={formData.amenities}
              onChange={handleChange}
            />
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h2>📞 Contact Information</h2>
            <input
              type="tel"
              name="contactInfo.phone"
              placeholder="Phone Number"
              value={formData.contactInfo.phone}
              onChange={handleChange}
            />
            <input
              type="email"
              name="contactInfo.email"
              placeholder="Email Address"
              value={formData.contactInfo.email}
              onChange={handleChange}
            />
            <input
              type="url"
              name="contactInfo.website"
              placeholder="Website URL"
              value={formData.contactInfo.website}
              onChange={handleChange}
            />
          </div>

          {/* Pricing */}
          <div className="form-section">
            <h2>💰 Pricing</h2>
            <div className="pricing-inputs">
              <select
                name="pricing.currency"
                value={formData.pricing.currency}
                onChange={handleChange}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
              <input
                type="number"
                name="pricing.basePrice"
                placeholder="Base Price (per day)"
                value={formData.pricing.basePrice}
                onChange={handleChange}
                step="0.01"
              />
            </div>
          </div>

          {/* Images */}
          <div className="form-section">
            <h2>📸 Images</h2>
            <input
              type="url"
              name="images"
              placeholder="Image URL (optional)"
              value={formData.images}
              onChange={handleChange}
            />
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate("/venues")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Venue"}
            </button>
          </div>
        </form>
      </div>

      {/* Success modal */}
      {venueCreated && createdVenue && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', zIndex: 2000 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 10, width: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3>✅ Venue Created</h3>
            <p style={{ marginTop: 8 }}>Your venue "{createdVenue.name}" was created successfully.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
              <button className="btn" onClick={() => setVenueCreated(false)}>Close</button>
              <button className="btn colorful-button" onClick={() => {
                // navigate to create event with venue preselected (if route supports it)
                navigate(`/create-event?venueId=${createdVenue._id}`);
              }}>Create Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateVenue;

