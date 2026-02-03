import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { removeToken } from '../utils/auth';
import WelcomeScreen from '../components/WelcomeScreen';
import FullDashboard from '../components/FullDashboard';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const cached = sessionStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(!user);
  const [showWelcome, setShowWelcome] = useState(() => {
    return !sessionStorage.getItem('welcomeShown');
  });
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      sessionStorage.setItem('user', JSON.stringify(response.data));
      setLoading(false);
    } catch (err) {
      removeToken();
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('welcomeShown');
      navigate('/login');
    }
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    sessionStorage.setItem('welcomeShown', 'true');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (showWelcome) {
    return <WelcomeScreen user={user} onComplete={handleWelcomeComplete} />;
  }

  return <FullDashboard user={user} />;
};

export default Dashboard;
