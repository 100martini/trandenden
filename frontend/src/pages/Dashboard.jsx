import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import WelcomeScreen from '../components/WelcomeScreen';
import FullDashboard from '../components/FullDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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
    } catch (err) {
      console.error('Failed to fetch user:', err);
      navigate('/login');
    }
  };

  const handleWelcomeComplete = () => {
    setFadeOut(true);
    setTimeout(() => {
      setShowWelcome(false);
    }, 600);
  };

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