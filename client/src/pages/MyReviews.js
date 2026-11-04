// client/src/pages/MyReviews.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import '../style.css';

function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { auth } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!auth.user) {
      navigate('/login');
      return;
    }
    fetchMyReviews();
  }, [auth.user, currentPage]);
  
  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reviews/user/my-reviews', {
        params: { page: currentPage, limit: 10 },
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching my reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      alert('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review');
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getItemLink = (review) => {
    if (review.reviewType === 'event' && review.event) {
      return `/event/${review.event._id}`;
    } else if (review.reviewType === 'venue' && review.venue) {
      return `/venues/${review.venue._id}`;
    }
    return '#';
  };
  
  const getItemName = (review) => {
    if (review.reviewType === 'event' && review.event) {
      return review.event.title;
    } else if (review.reviewType === 'venue' && review.venue) {
      return review.venue.name;
    }
    return 'Unknown Item';
  };
  
  const getItemImage = (review) => {
    if (review.reviewType === 'event' && review.event) {
      return review.event.image;
    } else if (review.reviewType === 'venue' && review.venue) {
      return review.venue.images?.[0];
    }
    return null;
  };
  
  if (loading) {
    return (
      <div className="my-reviews-page">
        <div className="loading">Loading your reviews...</div>
      </div>
    );
  }
  
  return (
    <div className="my-reviews-page">
      <div className="page-header">
        <h1>My Reviews</h1>
        <p>Manage and view all your reviews</p>
      </div>
      
      {reviews.length === 0 ? (
        <div className="no-reviews">
          <div className="no-reviews-content">
            <h3>No reviews yet</h3>
            <p>You haven't written any reviews yet. Start by exploring events and venues!</p>
            <div className="no-reviews-actions">
              <button 
                className="btn-primary"
                onClick={() => navigate('/explore')}
              >
                Explore Events
              </button>
              <button 
                className="btn-outline"
                onClick={() => navigate('/venues')}
              >
                Browse Venues
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="reviews-stats">
            <div className="stat-card">
              <h3>{reviews.length}</h3>
              <p>Total Reviews</p>
            </div>
            <div className="stat-card">
              <h3>
                {reviews.length > 0 
                  ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </h3>
              <p>Average Rating Given</p>
            </div>
          </div>
          
          <div className="my-reviews-list">
            {reviews.map(review => (
              <div key={review._id} className="my-review-item">
                <div className="review-item-header">
                  <div className="item-info">
                    <img 
                      src={getItemImage(review) || '/placeholder-image.jpg'} 
                      alt={getItemName(review)}
                      className="item-image"
                    />
                    <div className="item-details">
                      <h3>
                        <a href={getItemLink(review)}>
                          {getItemName(review)}
                        </a>
                      </h3>
                      <p className="item-type">
                        {review.reviewType === 'event' ? 'Event' : 'Venue'} Review
                      </p>
                      <p className="review-date">
                        Reviewed on {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="review-actions">
                    <button
                      className="btn-outline btn-small"
                      onClick={() => navigate(getItemLink(review))}
                    >
                      View {review.reviewType}
                    </button>
                    <button
                      className="btn-danger btn-small"
                      onClick={() => handleDeleteReview(review._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="review-content">
                  <div className="review-rating">
                    <StarRating rating={review.rating} readOnly={true} size="small" />
                    <span className="rating-text">
                      {review.rating}/5 stars
                    </span>
                  </div>
                  
                  <p className="review-comment">{review.comment}</p>
                  
                  {review.attended && review.reviewType === 'event' && (
                    <span className="attended-badge">✓ Attended this event</span>
                  )}
                  
                  {review.helpfulVotes > 0 && (
                    <div className="helpful-info">
                      👍 {review.helpfulVotes} people found this helpful
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyReviews;
