import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { removeToken } from '../utils/auth';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-card">
          <h2>Loading...</h2>
          <p>Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h2>{error}</h2>
          <button onClick={handleLogout} className="back-to-login-btn">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="user-card">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>

          <div className="user-header">
            {user?.avatar?.medium && (
              <img 
                src={user.avatar.medium} 
                alt={user.login}
                className="user-avatar"
              />
            )}
            <div className="user-info">
              <h2>{user?.displayName}</h2>
              <p className="username">@{user?.login}</p>
              <p className="email">{user?.email}</p>
            </div>
          </div>

          <div className="user-stats">
            <div className="stat-item">
              <div className="stat-label">Campus</div>
              <div className="stat-value">{user?.campus || 'N/A'}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Wallet</div>
              <div className="stat-value">{user?.wallet} ₳</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Correction Points</div>
              <div className="stat-value">{user?.correctionPoints}</div>
            </div>
          </div>

          {user?.cursus && user.cursus.length > 0 && (
            <div className="cursus-section">
              <div className="cursus-label">Cursus</div>
              <p className="cursus-value">{user.cursus.join(', ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
