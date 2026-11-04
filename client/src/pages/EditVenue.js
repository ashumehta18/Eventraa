// client/src/pages/EditVenue.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../style.css";

function EditVenue() {
  const { id } = useParams(); // Get venue ID from URL
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: { address: "", city: "", state: "", country: "India" },
    capacity: { min: "", max: "" },
    amenities: "",
    images: "",
    pricing: { basePrice: "", currency: "INR" },
  });

  const [loading, setLoading] = useState(true);

  // Fetch venue data
  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await axios.get(`/api/venues/${id}`);
        const venue = res.data;

        setFormData({
          name: venue.name,
          description: venue.description,
          location: venue.location,
          capacity: venue.capacity,
          amenities: Array.isArray(venue.amenities) ? venue.amenities.join(", ") : "",
          images: venue.images?.[0] || "",
          pricing: venue.pricing,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching venue:", err);
        alert("Failed to load venue details.");
        navigate("/venues");
      }
    };

    fetchVenue();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const venueData = {
        ...formData,
        capacity: {
          min: parseInt(formData.capacity.min) || 0,
          max: parseInt(formData.capacity.max) || 0,
        },
        pricing: {
          ...formData.pricing,
          basePrice: parseFloat(formData.pricing.basePrice) || 0,
        },
        amenities: String(formData.amenities || "")
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item),
      };

      await axios.put(`/api/venues/${id}`, venueData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      alert("✅ Venue updated successfully!");
      navigate("/venues");
    } catch (error) {
      console.error("Error updating venue:", error);
      alert("Error updating venue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading venue data...</div>;

  return (
    <div className="create-venue" style={{ padding: "2rem", minHeight: "90vh", background: "#f9fafb" }}>
      <div className="form-container" style={{
        maxWidth: "700px",
        margin: "auto",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        backgroundColor: "#fff"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "#111827" }}>✏️ Edit Venue</h1>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.25rem" }}>

          {/* Name & Description */}
          <input type="text" name="name" placeholder="Venue Name *" value={formData.name} onChange={handleChange} required style={inputStyle} />
          <textarea name="description" placeholder="Description of your venue..." value={formData.description} onChange={handleChange} rows="3" style={{ ...inputStyle, resize: "none" }} />

          {/* Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <input type="text" name="location.address" placeholder="Address *" value={formData.location?.address || ""} onChange={handleChange} required style={inputStyle} />
            <input type="text" name="location.city" placeholder="City *" value={formData.location?.city || ""} onChange={handleChange} required style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <input type="text" name="location.state" placeholder="State" value={formData.location?.state || ""} onChange={handleChange} style={inputStyle} />
            <select name="location.country" value={formData.location?.country || "India"} onChange={handleChange} style={inputStyle}>
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
            </select>
          </div>

          {/* Capacity & Pricing */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <input type="number" name="capacity.min" placeholder="Minimum Capacity" value={formData.capacity.min} onChange={handleChange} style={inputStyle} />
            <input type="number" name="capacity.max" placeholder="Maximum Capacity" value={formData.capacity.max} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <input type="number" name="pricing.basePrice" placeholder="Base Price (per day)" value={formData.pricing.basePrice} onChange={handleChange} step="0.01" style={inputStyle} />
            <select name="pricing.currency" value={formData.pricing.currency} onChange={handleChange} style={inputStyle}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          {/* Image & Amenities */}
          <input type="url" name="images" placeholder="Image URL" value={formData.images} onChange={handleChange} style={inputStyle} />
          <input type="text" name="amenities" placeholder="Amenities (comma separated)" value={formData.amenities} onChange={handleChange} style={inputStyle} />

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
            <button type="button" onClick={() => navigate("/venues")} className="btn-outline" style={{ padding: "0.75rem 1.5rem" }}>Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "0.75rem 1.5rem" }}>
              {loading ? "Updating..." : "Update Venue"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.65rem 0.75rem",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "1rem",
  outline: "none",
  transition: "all 0.2s",
  boxSizing: "border-box"
};

export default EditVenue;
