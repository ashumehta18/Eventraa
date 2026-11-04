// client/src/components/ReviewForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import '../style.css';

function ReviewForm({ 
  reviewType, // 'event' or 'venue'
  itemId, 
  onReviewSubmitted,
  existingReview = null 
}) {
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    comment: existingReview?.comment || '',
    attended: existingReview?.attended || false,
    images: existingReview?.images || [],
    // Event-specific ratings
    eventRatings: {
      organization: existingReview?.eventRatings?.organization || 0,
      value: existingReview?.eventRatings?.value || 0,
      atmosphere: existingReview?.eventRatings?.atmosphere || 0
    },
    // Venue-specific ratings
    venueRatings: {
      cleanliness: existingReview?.venueRatings?.cleanliness || 0,
      location: existingReview?.venueRatings?.location || 0,
      amenities: existingReview?.venueRatings?.amenities || 0,
      staff: existingReview?.venueRatings?.staff || 0
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [submittedDate, setSubmittedDate] = useState('');
  const { auth } = useAuth();
  
  const handleRatingChange = (category, rating) => {
    if (category === 'overall') {
      setFormData(prev => ({ ...prev, rating }));
    } else if (reviewType === 'event' && formData.eventRatings.hasOwnProperty(category)) {
      setFormData(prev => ({
        ...prev,
        eventRatings: { ...prev.eventRatings, [category]: rating }
      }));
    } else if (reviewType === 'venue' && formData.venueRatings.hasOwnProperty(category)) {
      setFormData(prev => ({
        ...prev,
        venueRatings: { ...prev.venueRatings, [category]: rating }
      }));
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // In a real app, you'd upload these to a cloud service
    // For now, we'll just store the file names
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };
  
  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (formData.rating === 0) {
      setError('Please provide an overall rating');
      setLoading(false);
      return;
    }
    
    if (formData.comment.trim().length < 10) {
      setError('Please write at least 10 characters for your review');
      setLoading(false);
      return;
    }
    
    try {
      const url = existingReview 
        ? `/api/reviews/${existingReview._id}`
        : `/api/reviews/${reviewType}/${itemId}`;
      
      const method = existingReview ? 'PUT' : 'POST';
      
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data);
      }
      
      // Show success popup with current date
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      setSubmittedDate(currentDate);
      setShowSuccessPopup(true);
      
      // Reset form if it's a new review
      if (!existingReview) {
        setFormData({
          rating: 0,
          comment: '',
          attended: false,
          images: [],
          eventRatings: { organization: 0, value: 0, atmosphere: 0 },
          venueRatings: { cleanliness: 0, location: 0, amenities: 0, staff: 0 }
        });
      }
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Error submitting review');
    } finally {
      setLoading(false);
    }
  };
  
  const getEventRatingLabels = () => ({
    organization: 'Organization',
    value: 'Value for Money',
    atmosphere: 'Atmosphere'
  });
  
  const getVenueRatingLabels = () => ({
    cleanliness: 'Cleanliness',
    location: 'Location',
    amenities: 'Amenities',
    staff: 'Staff Service'
  });
  
  return (
    <div className="review-form">
      <h3>{existingReview ? 'Edit Your Review' : 'Write a Review'}</h3>
      
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <div className="success-icon">✓</div>
            <h3>Thank you for your review!</h3>
            <p>Your review has been submitted successfully.</p>
            <p className="submission-date">Submitted on: {submittedDate}</p>
            <button 
              className="btn-primary"
              onClick={() => setShowSuccessPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Overall Rating */}
        <div className="form-group">
          <label>Overall Rating *</label>
          <StarRating
            rating={formData.rating}
            onRatingChange={(rating) => handleRatingChange('overall', rating)}
            showLabel={true}
          />
        </div>
        
        {/* Event-specific ratings */}
        {reviewType === 'event' && (
          <div className="form-group">
            <label>Event Details</label>
            <div className="detailed-ratings">
              {Object.entries(getEventRatingLabels()).map(([key, label]) => (
                <div key={key} className="rating-item">
                  <span className="rating-label">{label}</span>
                  <StarRating
                    rating={formData.eventRatings[key]}
                    onRatingChange={(rating) => handleRatingChange(key, rating)}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Venue-specific ratings */}
        {reviewType === 'venue' && (
          <div className="form-group">
            <label>Venue Details</label>
            <div className="detailed-ratings">
              {Object.entries(getVenueRatingLabels()).map(([key, label]) => (
                <div key={key} className="rating-item">
                  <span className="rating-label">{label}</span>
                  <StarRating
                    rating={formData.venueRatings[key]}
                    onRatingChange={(rating) => handleRatingChange(key, rating)}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Comment */}
        <div className="form-group">
          <label>Your Review *</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder="Share your experience... (minimum 10 characters)"
            rows="4"
            required
          />
          <small>{formData.comment.length}/1000 characters</small>
        </div>
        
        {/* Attended checkbox (for events) */}
        {reviewType === 'event' && (
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="attended"
                checked={formData.attended}
                onChange={handleInputChange}
              />
              I attended this event
            </label>
          </div>
        )}
        
        {/* Image upload */}
        <div className="form-group">
          <label>Photos (optional)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="file-input"
          />
          
          {formData.images.length > 0 && (
            <div className="image-preview">
              {formData.images.map((image, index) => (
                <div key={index} className="preview-item">
                  <img src={image} alt={`Review ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReviewForm;
