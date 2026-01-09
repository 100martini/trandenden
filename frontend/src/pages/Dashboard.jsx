import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';
import WelcomeScreen from '../components/WelcomeScreen';
import FullDashboard from '../components/FullDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#1a1721',
        color: '#FAF0E6',
        fontFamily: 'Space Grotesk, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (showWelcome) {
    return <WelcomeScreen user={user} onComplete={() => setShowWelcome(false)} />;
  }

  return <FullDashboard user={user} />;
};

export default Dashboard;
