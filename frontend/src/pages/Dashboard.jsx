import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import WelcomeScreen from '../components/WelcomeScreen';
import FullDashboard from '../components/FullDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      console.log('API Response:', response.data);
      setUser(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  const handleWelcomeComplete = () => {
    setFadeOut(true);
    setTimeout(() => {
      setShowWelcome(false);
    }, 600);
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#201C2A',
        color: '#FAF0E6',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'rgba(37, 32, 48, 0.8)',
          padding: '3rem 2rem',
          borderRadius: '24px',
          border: '1px solid rgba(185, 180, 199, 0.1)'
        }}>
          <h2 style={{ marginBottom: '1rem', fontFamily: 'Space Grotesk, sans-serif' }}>Loading...</h2>
          <p style={{ color: '#B9B4C7' }}>Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#201C2A',
        color: '#FAF0E6',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'rgba(37, 32, 48, 0.8)',
          padding: '3rem 2rem',
          borderRadius: '24px',
          border: '1px solid rgba(185, 180, 199, 0.1)'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#fca5a5', fontFamily: 'Space Grotesk, sans-serif' }}>{error}</h2>
          <button
            onClick={() => navigate('/login')}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              background: '#FAF0E6',
              color: '#252030',
              border: 'none',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showWelcome && (
        <div className={fadeOut ? 'fade-out' : ''}>
          <WelcomeScreen user={user} onComplete={handleWelcomeComplete} />
        </div>
      )}
      {!showWelcome && <FullDashboard user={user} />}
    </>
  );
};

export default Dashboard;
