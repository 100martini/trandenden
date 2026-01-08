import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginButton from '../components/LoginButton';
import { isAuthenticated } from '../utils/auth';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }

    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'access_denied':
          setError('You denied access to the application.');
          break;
        case 'no_code':
          setError('No authorization code received.');
          break;
        case 'auth_failed':
          setError('Authentication failed. Please try again.');
          break;
        default:
          setError('An error occurred during login.');
      }
    }
  }, [navigate, searchParams]);

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="logo-42">42</div>
        
        <h1 className="app-title">Project Hub</h1>
        <p className="app-subtitle">Collaborate on 42 projects with your team</p>

        <div className="login-card">
          <h2 className="login-title">Welcome back</h2>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <LoginButton />
        </div>

        <div className="login-footer">
          <div className="footer-item">
            <span className="footer-label">Team</span>
            <span className="footer-value">Collaboration</span>
          </div>
          <div className="footer-item">
            <span className="footer-label">Task</span>
            <span className="footer-value">Management</span>
          </div>
          <div className="footer-item">
            <span className="footer-label">Game</span>
            <span className="footer-value">Hub</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;