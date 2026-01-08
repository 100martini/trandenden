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
      console.log('Token saved:', token.substring(0, 20) + '...');

      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } else
        navigate('/login?error=no_token');
  }, [searchParams, navigate]);

  return (
    <div className="login-container">
      <div className="loading">
        <h2>Logging you in...</h2>
        <p>Please wait while we authenticate you.</p>
      </div>
    </div>
  );
};

export default AuthSuccess;