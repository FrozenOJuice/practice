// frontend/app/movies/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import './movie-details.css';
import { getMovieById, getMovieReviews, Movie, Review } from '../../utils/api';

export default function MovieDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        console.log('Fetching movie details for:', movieId);
        
        const [movieResult, reviewsResult] = await Promise.all([
          getMovieById(movieId),
          getMovieReviews(movieId)
        ]);
        
        console.log('Movie result:', movieResult);
        console.log('Reviews result:', reviewsResult);
        
        if (movieResult.error) {
          setError(movieResult.error);
        } else {
          setMovie(movieResult.data || null);
        }
  
        if (reviewsResult.error) {
          console.error('Failed to load reviews:', reviewsResult.error);
        } else {
          setReviews(reviewsResult.data || []);
        }
      } catch (err) {
        console.error('Error in fetchMovieDetails:', err);
        setError('Failed to load movie details');
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    };
  
    fetchMovieDetails();
  }, [movieId]);

  if (loading) {
    return (
      <div className="movie-details-container">
        <div className="loading-spinner">Loading movie details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-details-container">
        <div className="error-message">{error}</div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="btn btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-details-container">
        <div className="error-message">Movie not found</div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="btn btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="movie-details-container">
      <div className="movie-header">
        <button 
          onClick={() => router.push('/dashboard')}
          className="btn btn-outline back-button"
        >
          ← Back to Dashboard
        </button>
        
        <h1>{movie.metadata.title}</h1>
        <div className="movie-rating">
          <span className="rating-star">⭐</span>
          <span className="rating-value">{movie.metadata.movieIMDbRating}/10</span>
          <span className="rating-count">({movie.metadata.totalRatingCount} ratings)</span>
        </div>
      </div>

      <div className="movie-content">
        <div className="movie-info-card">
          <h2>Movie Information</h2>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Released:</span>
              <span className="info-value">{movie.metadata.datePublished}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Duration:</span>
              <span className="info-value">{movie.metadata.duration} minutes</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Genres:</span>
              <span className="info-value">{movie.metadata.movieGenres.join(', ')}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Directors:</span>
              <span className="info-value">{movie.metadata.directors.join(', ')}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Main Cast:</span>
              <span className="info-value">{movie.metadata.mainStars.join(', ')}</span>
            </div>
          </div>

          <div className="movie-description">
            <h3>Description</h3>
            <p>{movie.metadata.description}</p>
          </div>
        </div>

        <div className="reviews-section">
          <h2>Reviews ({reviews.length})</h2>
          
          {reviewsLoading ? (
            <div className="loading-spinner">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="no-reviews">
              <p>No reviews yet. Be the first to review this movie!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <div className="review-user">
                      <strong>{review.user}</strong>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <div className="review-rating">
                      ⭐ {review.rating}/10
                    </div>
                  </div>
                  
                  <h3 className="review-title">{review.title}</h3>
                  <p className="review-text">{review.review}</p>
                  
                  <div className="review-footer">
                    <span className="usefulness">
                      {review.usefulness_vote} of {review.total_votes} found this helpful
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}