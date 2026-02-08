import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setToken } from '../utils/auth';
import '../styles/Dashboard.css';

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
    <div className="loading-container">
      <div className="loading-card">
        <div className="loading-spinner"></div>
        <h2>Fetching data from 42 API</h2>
        <p>Please wait</p>
      </div>
    </div>
  );
};

export default AuthSuccess;