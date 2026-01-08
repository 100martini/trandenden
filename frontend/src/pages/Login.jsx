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
      <div className="login-header">
        <div className="logo-container">
          <div className="logo-42">42</div>
        </div>
        <h1 className="app-title">Project Hub</h1>
        <p className="app-subtitle">Collaborate on 42 projects with your team</p>
      </div>

      <div className="login-card">
        <h2 className="login-title">Welcome back</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <LoginButton />

        <div className="divider">
          <span>or</span>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="your@email.com"
              disabled
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••••••"
              disabled
            />
          </div>

          <button type="submit" className="sign-in-btn" disabled>
            Sign In
          </button>
        </form>

        <div className="signup-link">
          Don't have an account? <a href="#">Sign up</a>
        </div>
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
  );
};

export default Login;