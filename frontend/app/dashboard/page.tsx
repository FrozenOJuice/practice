// frontend/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './dashboard.css';
import { getMovies, Movie } from '../utils/api';

interface DashboardData {
  username?: string;
  role?: string;
  transactions?: any[];
  penalties?: any[];
  system_stats?: {
    total_users: number;
    active_penalties: number;
  };
  user_id?: string;
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [moviesError, setMoviesError] = useState('');


  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // First try user dashboard
        let response = await fetch('http://localhost:8000/dashboard/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 403) {
          // If user doesn't have access, try admin dashboard
          response = await fetch('http://localhost:8000/dashboard/admin', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        }

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError('Failed to load dashboard');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const result = await getMovies({
          sort_by: 'rating',
          order: 'desc',
          limit: 6 // Show top 6 rated movies
        });
        
        if (result.error) {
          setMoviesError(result.error);
        } else {
          setMovies(result.data || []);
        }
      } catch (err) {
        setMoviesError('Failed to load movies');
      } finally {
        setMoviesLoading(false);
      }
    };
  
    fetchMovies();
  }, []);
  

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-message">{error}</div>
        <button 
          onClick={() => router.push('/login')}
          className="btn btn-primary"
        >
          Back to Login
        </button>
      </div>
    );
  }

  // Render User Dashboard
  if (dashboardData?.username) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {dashboardData.username}!</h1>
          <p>Role: {dashboardData.role}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Profile Summary</h3>
            <div className="stat">
              <span className="stat-label">Username:</span>
              <span className="stat-value">{dashboardData.username}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Role:</span>
              <span className="stat-value">{dashboardData.role}</span>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Transactions</h3>
            <p className="stat-value">
              {dashboardData.transactions?.length || 0} total
            </p>
            {dashboardData.transactions && dashboardData.transactions.length > 0 ? (
              <ul className="transaction-list">
                {dashboardData.transactions.slice(0, 3).map((transaction, index) => (
                  <li key={index} className="transaction-item">
                    {JSON.stringify(transaction)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No transactions yet</p>
            )}
          </div>

          <div className="dashboard-card">
            <h3>Penalties</h3>
            <p className="stat-value">
              {dashboardData.penalties?.length || 0} active
            </p>
            {dashboardData.penalties && dashboardData.penalties.length > 0 ? (
              <ul className="penalty-list">
                {dashboardData.penalties.slice(0, 3).map((penalty, index) => (
                  <li key={index} className="penalty-item">
                    {JSON.stringify(penalty)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No penalties</p>
            )}
          </div>
        </div>

        {/* Movies Section */}
        <div className="movies-section">
          <h2>Featured Movies</h2>
          
          {moviesLoading ? (
            <div className="loading-spinner">Loading movies...</div>
          ) : moviesError ? (
            <div className="error-message">{moviesError}</div>
          ) : (
            <div className="movies-grid">
              {movies.map(movie => (
                <div key={movie.id} className="movie-card">
                  <h3>{movie.metadata.title}</h3>
                  <p>⭐ {movie.metadata.movieIMDbRating}/10</p>
                  <p>{movie.metadata.movieGenres.join(', ')}</p>
                  <button 
                    onClick={() => router.push(`/movies/${movie.id}`)}
                    className="btn btn-outline"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Admin Dashboard
  if (dashboardData?.system_stats) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>System Overview</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card admin-card">
            <h3>User Information</h3>
            <div className="stat">
              <span className="stat-label">User ID:</span>
              <span className="stat-value">{dashboardData.user_id}</span>
            </div>
          </div>

          <div className="dashboard-card admin-card">
            <h3>System Statistics</h3>
            <div className="stat">
              <span className="stat-label">Total Users:</span>
              <span className="stat-value highlight">
                {dashboardData.system_stats.total_users}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Active Penalties:</span>
              <span className="stat-value highlight">
                {dashboardData.system_stats.active_penalties}
              </span>
            </div>
          </div>

          <div className="dashboard-card admin-card">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="btn btn-primary">Manage Users</button>
              <button className="btn btn-outline">View Reports</button>
              <button className="btn btn-outline">System Settings</button>
            </div>
          </div>
        </div>

        {/* Movies Section */}
        <div className="movies-section">
          <h2>Featured Movies</h2>
          
          {moviesLoading ? (
            <div className="loading-spinner">Loading movies...</div>
          ) : moviesError ? (
            <div className="error-message">{moviesError}</div>
          ) : (
            <div className="movies-grid">
              {movies.map(movie => (
                <div key={movie.id} className="movie-card">
                  <h3>{movie.metadata.title}</h3>
                  <p>⭐ {movie.metadata.movieIMDbRating}/10</p>
                  <p>{movie.metadata.movieGenres.join(', ')}</p>
                  <button 
                    onClick={() => router.push(`/movies/${movie.id}`)}
                    className="btn btn-outline"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}