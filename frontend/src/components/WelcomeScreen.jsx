import React, { useEffect } from 'react';
import '../styles/WelcomeScreen.css';

const WelcomeScreen = ({ user, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const firstName = user?.firstName || user?.login || 'Student';
  const campus = user?.campus || 'Campus';
  const wallet = user?.wallet || 0;
  const correctionPoints = user?.correctionPoints || 0;
  const avatarUrl = user?.avatar?.medium || user?.avatar;

  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        {avatarUrl ? (
          <img 
            src={avatarUrl}
            alt={firstName}
            className="welcome-avatar"
          />
        ) : (
          <div className="welcome-avatar-placeholder">
            {firstName.substring(0, 2).toUpperCase()}
          </div>
        )}
        
        <h1 className="welcome-title">
          Welcome, {firstName}! 👋
        </h1>
        
        <p className="welcome-subtitle">
          {campus}
        </p>
        
        <div className="welcome-stats">
          <div className="welcome-stat">
            <div className="welcome-stat-value">{wallet} ₳</div>
            <div className="welcome-stat-label">Wallet</div>
          </div>
          <div className="welcome-divider"></div>
          <div className="welcome-stat">
            <div className="welcome-stat-value">{correctionPoints}</div>
            <div className="welcome-stat-label">Evaluation Points</div>
          </div>
        </div>

        <div className="welcome-loading">
          <div className="loading-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
