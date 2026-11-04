// client/src/components/ReviewList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import '../style.css';

function ReviewList({ reviewType, itemId, onReviewStats }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { auth } = useAuth();
  
  const fetchReviews = async (page = 1, sort = 'newest') => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reviews/${reviewType}/${itemId}`, {
        params: { page, limit: 5, sort }
      });
      
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      
      // Update stats in parent component
      if (onReviewStats) {
        onReviewStats({
          averageRating: response.data.averageRating,
          totalReviews: response.data.totalReviews
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/reviews/stats/${reviewType}/${itemId}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };
  
  useEffect(() => {
    fetchReviews(currentPage, sortBy);
    fetchStats();
  }, [reviewType, itemId, currentPage, sortBy]);
  
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
    fetchReviews(1, newSort);
  };
  
  const handleHelpfulClick = async (reviewId) => {
    if (!auth.user) {
      alert('Please login to mark reviews as helpful');
      return;
    }
    
    try {
      const response = await axios.post(`/api/reviews/${reviewId}/helpful`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      
      // Update the review in the list
      setReviews(prev => prev.map(review => 
        review._id === reviewId 
          ? { ...review, helpfulVotes: response.data.helpfulVotes }
          : review
      ));
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getDetailedRatings = (review) => {
    if (reviewType === 'event' && review.eventRatings) {
      return [
        { label: 'Organization', rating: review.eventRatings.organization },
        { label: 'Value', rating: review.eventRatings.value },
        { label: 'Atmosphere', rating: review.eventRatings.atmosphere }
      ].filter(item => item.rating > 0);
    } else if (reviewType === 'venue' && review.venueRatings) {
      return [
        { label: 'Cleanliness', rating: review.venueRatings.cleanliness },
        { label: 'Location', rating: review.venueRatings.location },
        { label: 'Amenities', rating: review.venueRatings.amenities },
        { label: 'Staff', rating: review.venueRatings.staff }
      ].filter(item => item.rating > 0);
    }
    return [];
  };
  
  if (loading && reviews.length === 0) {
    return <div className="loading">Loading reviews...</div>;
  }
  
  return (
    <div className="review-list">
      {/* Review Statistics */}
      {stats && (
        <div className="review-stats">
          <div className="stats-summary">
            <div className="average-rating">
              <span className="rating-number">{stats.averageRating.toFixed(1)}</span>
              <StarRating rating={stats.averageRating} readOnly={true} size="large" />
              <span className="total-reviews">({stats.totalReviews} reviews)</span>
            </div>
          </div>
          
          {stats.ratingDistribution && (
            <div className="rating-breakdown">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = stats.ratingDistribution[rating] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="rating-bar">
                    <span className="rating-label">{rating}★</span>
                    <div className="bar-container">
                      <div 
                        className="bar-fill" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="rating-count">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Sort Options */}
      <div className="review-controls">
        <div className="sort-options">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="most_helpful">Most Helpful</option>
          </select>
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="reviews-container">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this {reviewType}!</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.user?.photo ? (
                      <img src={review.user.photo} alt={review.user?.name || "User"} />
                    ) : (
                      <div className="avatar-placeholder">
                        {(review.user?.name || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="reviewer-details">
                    <h4>{review.user?.name || "User"}</h4>
                    <span className="review-date">{formatDate(review.createdAt)}</span>
                    {review.attended && reviewType === 'event' && (
                      <span className="attended-badge">✓ Attended</span>
                    )}
                  </div>
                </div>
                
                <div className="review-rating">
                  <StarRating rating={review.rating} readOnly={true} size="small" />
                </div>
              </div>
              
              <div className="review-content">
                <p>{review.comment}</p>
                
                {/* Detailed Ratings */}
                {getDetailedRatings(review).length > 0 && (
                  <div className="detailed-ratings">
                    {getDetailedRatings(review).map((item, index) => (
                      <div key={index} className="detailed-rating">
                        <span className="rating-label">{item.label}:</span>
                        <StarRating rating={item.rating} readOnly={true} size="small" />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="review-images">
                    {review.images.map((image, index) => (
                      <img key={index} src={image} alt={`Review ${index + 1}`} />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="review-footer">
                <button
                  className="helpful-button"
                  onClick={() => handleHelpfulClick(review._id)}
                >
                  👍 Helpful ({review.helpfulVotes || 0})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => fetchReviews(currentPage - 1, sortBy)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => fetchReviews(currentPage + 1, sortBy)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ReviewList;
