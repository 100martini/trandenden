import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import WelcomeScreen from '../components/WelcomeScreen';
import FullDashboard from '../components/FullDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeComplete, setWelcomeComplete] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const startTime = Date.now();
      const response = await api.get('/auth/me');
      console.log('API Response:', response.data);
      setUser(response.data);
      
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(1500 - elapsedTime, 0);
      
      setTimeout(() => {
        setLoading(false);
        setTimeout(() => {
          setShowWelcome(true);
        }, 100);
      }, remainingTime);
      
    } catch (err) {
      console.error('Failed to fetch user:', err);
      navigate('/login');
    }
  };

  const handleWelcomeComplete = () => {
    setFadeOut(true);
    setTimeout(() => {
      setShowWelcome(false);
      setWelcomeComplete(true);
    }, 600);
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        background: '#201C2A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'rgba(37, 32, 48, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(185, 180, 199, 0.1)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 1.5rem',
            border: '4px solid rgba(185, 180, 199, 0.2)',
            borderTop: '4px solid #FAF0E6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.5rem',
            color: '#FAF0E6',
            marginBottom: '0.5rem'
          }}>
            Loading your dashboard
          </h2>
          <p style={{
            color: '#B9B4C7',
            fontSize: '0.875rem'
          }}>
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  if (showWelcome && !welcomeComplete) {
    return (
      <div className={fadeOut ? 'fade-out' : ''}>
        <WelcomeScreen user={user} onComplete={handleWelcomeComplete} />
      </div>
    );
  }

  if (welcomeComplete && user) {
    return <FullDashboard user={user} />;
  }

  return null;
};

export default Dashboard;