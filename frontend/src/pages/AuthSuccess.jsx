import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setToken } from '../utils/auth';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      setToken(token);
      navigate('/dashboard');
    } else {
      navigate('/login?error=no_token');
    }
  }, [searchParams, navigate]);

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
      Authenticating...
    </div>
  );
};

export default AuthSuccess;
