import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { removeToken } from '../utils/auth';

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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        <h2>{error}</h2>
        <button onClick={handleLogout}>Back to Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Welcome, {user?.firstName || user?.login}!</h1>
        <button onClick={handleLogout} style={{ 
          padding: '0.5rem 1rem', 
          background: '#ef4444', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          Logout
        </button>
      </div>

      <div style={{ 
        background: 'rgba(45, 53, 97, 0.6)', 
        padding: '2rem', 
        borderRadius: '12px',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
          {user?.avatar?.medium && (
            <img 
              src={user.avatar.medium} 
              alt={user.login}
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
            />
          )}
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>{user?.displayName}</h2>
            <p style={{ margin: '0', color: '#a8b2d1' }}>@{user?.login}</p>
            <p style={{ margin: '0.5rem 0 0 0', color: '#a8b2d1' }}>{user?.email}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong style={{ color: '#00babc' }}>Campus:</strong>
            <p style={{ margin: '0.25rem 0 0 0' }}>{user?.campus || 'N/A'}</p>
          </div>
          <div>
            <strong style={{ color: '#00babc' }}>Wallet:</strong>
            <p style={{ margin: '0.25rem 0 0 0' }}>{user?.wallet} ₳</p>
          </div>
          <div>
            <strong style={{ color: '#00babc' }}>Correction Points:</strong>
            <p style={{ margin: '0.25rem 0 0 0' }}>{user?.correctionPoints}</p>
          </div>
        </div>

        {user?.cursus && user.cursus.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <strong style={{ color: '#00babc' }}>Cursus:</strong>
            <p style={{ margin: '0.25rem 0 0 0' }}>{user.cursus.join(', ')}</p>
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
        You're successfully authenticated with 42 OAuth!
      </p>
    </div>
  );
};

export default Dashboard;