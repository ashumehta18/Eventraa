import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VenueSelector from "../components/VenueSelector";
import "./../style.css";

function CreateEvent() {
  const [step, setStep] = useState(1);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [searchParams] = useSearchParams();
  const [showPreview, setShowPreview] = useState(false);

  const navigate = useNavigate();
  const { auth } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    image: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    capacity: "",
    venueName: "",
    address: "",
    city: "",
    currency: "USD",
    ticketPrice: "",
  });

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle preset venue selection
  const handleVenueSelect = (venue) => {
    setSelectedVenue(venue);
    if (venue) {
      setFormData((prev) => ({
        ...prev,
        venueName: venue.name,
        address: venue.location.address,
        city: venue.location.city,
      }));
    }
  };

  const handleCustomVenue = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Fetch venue details (wrapped in useCallback)
  const fetchVenueDetails = useCallback(
    async (venueId) => {
      try {
        const response = await axios.get(`/api/venues/${venueId}`);
        const venue = response.data;

        setSelectedVenue(venue);

        setFormData((prev) => ({
          ...prev,
          venueName: venue.name,
          address: venue.location?.address || "",
          city: venue.location?.city || "",
        }));
      } catch (error) {
        console.error("Error fetching venue:", error);

        const venueName = searchParams.get("venueName");
        if (venueName) {
          setFormData((prev) => ({
            ...prev,
            venueName: decodeURIComponent(venueName),
          }));
        }
      }
    },
    [searchParams]
  );

  // Prefill venue from URL
  useEffect(() => {
    const venueId = searchParams.get("venueId");
    const venueName = searchParams.get("venueName");

    if (venueId && venueName) {
      fetchVenueDetails(venueId);
      setStep(3);
    }
  }, [searchParams, fetchVenueDetails]);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  // Submit Event
  const handlePublish = async () => {
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(","),
        image: formData.image,
        date: formData.startDate,
        location: {
          venue: formData.venueName,
          address: formData.address,
          city: formData.city,
        },
        tickets: [
          {
            type: "General",
            price: formData.ticketPrice,
            available: formData.capacity || 100,
          },
        ],
      };

      if (selectedVenue) eventData.venueId = selectedVenue._id;

      const res = await axios.post("/api/events", eventData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      alert("Event Created Successfully!");
      navigate(`/event/${res.data._id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Error creating event");
    }
  };

  return (
    <div className="create-event">
      <h1 className="form-title">Create Your Event</h1>
      <p className="form-subtitle">
        Bring your event to life. Fill in the details below to create an amazing experience.
      </p>

      {/* Tabs */}
      <div className="tabs">
        <button className={step === 1 ? "active" : ""} onClick={() => setStep(1)}>
          Basic Info
        </button>
        <button className={step === 2 ? "active" : ""} onClick={() => setStep(2)}>
          Event Details
        </button>
        <button className={step === 3 ? "active" : ""} onClick={() => setStep(3)}>
          Location
        </button>
        <button className={step === 4 ? "active" : ""} onClick={() => setStep(4)}>
          Pricing & Tickets
        </button>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="form-card">
          <h2>📌 Basic Information</h2>

          <input type="text" name="title" placeholder="Event Title *" value={formData.title} onChange={handleChange} />
          <textarea name="description" placeholder="Event Description *" value={formData.description} onChange={handleChange} />

          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="">Select Category</option>
            <option value="Music">Music</option>
            <option value="Conference">Conference</option>
            <option value="Workshop">Workshop</option>
            <option value="Festival">Festival</option>
          </select>

          <input type="text" name="tags" placeholder="Tags (comma separated)" value={formData.tags} onChange={handleChange} />

          <input type="text" name="image" placeholder="Enter Image URL" value={formData.image} onChange={handleChange} />

          {formData.image && (
            <img src={formData.image} alt="preview" style={{ width: "150px", marginTop: "10px", borderRadius: "8px" }} />
          )}

          <button className="btn-next" onClick={nextStep}>Next ➡</button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="form-card">
          <h2>📅 Event Schedule</h2>

          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
          <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} />

          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
          <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} />

          <input type="number" name="capacity" placeholder="Expected Capacity" value={formData.capacity} onChange={handleChange} />

          <div className="buttons">
            <button className="btn-back" onClick={prevStep}>⬅ Back</button>
            <button className="btn-next" onClick={nextStep}>Next ➡</button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="form-card">
          <VenueSelector selectedVenue={selectedVenue} onVenueSelect={handleVenueSelect} onCustomVenue={handleCustomVenue} />

          <div className="buttons">
            <button className="btn-back" onClick={prevStep}>⬅ Back</button>
            <button className="btn-next" onClick={nextStep}>Next ➡</button>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="form-card">
          <h2>💰 Pricing & Tickets</h2>

          <select name="currency" value={formData.currency} onChange={handleChange}>
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
            <option value="EUR">EUR (€)</option>
          </select>

          <input type="number" name="ticketPrice" placeholder="Ticket Price" value={formData.ticketPrice} onChange={handleChange} />

          <p>Platform Fee (2%): {formData.ticketPrice ? (formData.ticketPrice * 0.02).toFixed(2) : "0"}</p>
          <p>Total Price (incl. Fee): {formData.ticketPrice ? (formData.ticketPrice * 1.02).toFixed(2) : "0"}</p>

          <div className="buttons">
            <button className="btn-back" onClick={prevStep}>⬅ Back</button>

            <button className="btn-outline" onClick={() => setShowPreview(true)}>Preview Event</button>

            <button className="btn-outline">Save Draft</button>

            <button className="btn-primary" onClick={handlePublish}>Publish Event</button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="preview-modal">
          <div className="preview-content">
            <h2>👀 Event Preview</h2>
            <h3>{formData.title || "Untitled Event"}</h3>

            {formData.image && (
              <img src={formData.image} alt="preview" style={{ width: "200px", borderRadius: "10px", marginBottom: "10px" }} />
            )}

            <p>{formData.description}</p>

            <p><strong>Category:</strong> {formData.category}</p>
            <p><strong>Tags:</strong> {formData.tags}</p>

            <p>
              <strong>Schedule:</strong> {formData.startDate} {formData.startTime} - {formData.endDate} {formData.endTime}
            </p>

            <p>
              <strong>Location:</strong> {formData.venueName}, {formData.address}, {formData.city}
            </p>

            <p>
              <strong>Tickets:</strong> {formData.currency} {formData.ticketPrice}
            </p>

            <div className="buttons">
              <button className="btn-back" onClick={() => setShowPreview(false)}>Close</button>
              <button className="btn-primary" onClick={handlePublish}>Publish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateEvent;
