// client/src/components/StarRating.js
import React, { useState } from 'react';
import '../style.css';

function StarRating({ 
  rating = 0, 
  onRatingChange, 
  maxRating = 5, 
  size = 'medium',
  readOnly = false,
  showLabel = false 
}) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleClick = (newRating) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(newRating);
    }
  };
  
  const handleMouseEnter = (newRating) => {
    if (!readOnly) {
      setHoverRating(newRating);
    }
  };
  
  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };
  
  const getRatingLabels = () => {
    return {
      1: 'Poor',
      2: 'Fair', 
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
  };
  
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'star-small';
      case 'large': return 'star-large';
      default: return 'star-medium';
    }
  };
  
  const displayRating = hoverRating || rating;
  const labels = getRatingLabels();
  
  return (
    <div className={`star-rating ${getSizeClass()} ${readOnly ? 'read-only' : ''}`}>
      <div className="stars-container">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          
          return (
            <span
              key={index}
              className={`star ${isFilled ? 'filled' : 'empty'}`}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
            >
              ★
            </span>
          );
        })}
      </div>
      
      {showLabel && (
        <span className="rating-label">
          {labels[displayRating] || ''}
        </span>
      )}
      
      {!readOnly && (
        <span className="rating-value">
          {rating > 0 ? `${rating}/${maxRating}` : 'Rate this'}
        </span>
      )}
    </div>
  );
}

export default StarRating;
