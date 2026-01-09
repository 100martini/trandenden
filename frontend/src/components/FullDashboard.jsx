import React from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../utils/auth';
import '../styles/FullDashboard.css';

const FullDashboard = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const displayName = user?.displayName || user?.firstName || 'User';
  const username = user?.login || 'yourlogin';
  const campus = user?.campus || 'Campus';
  const wallet = user?.wallet || 0;
  const correctionPoints = user?.correctionPoints || 0;
  const cursus = user?.cursus || [];
  const avatarUrl = user?.avatar?.medium || user?.avatar;

  const getInitials = (name) => {
    if (!name) return 'YO';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="full-dashboard">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">42</div>
          <div className="logo-text">Project Hub</div>
        </div>

        <nav className="nav-section">
          <a href="#" className="nav-item active">
            Dashboard
          </a>
          <a href="#" className="nav-item">
            Projects
            <span className="badge">0</span>
          </a>
          <a href="#" className="nav-item">
            Tasks
          </a>
          <a href="#" className="nav-item">
            Documents
          </a>
        </nav>

        <div className="nav-divider"></div>

        <nav className="nav-section">
          <a href="#" className="nav-item">
            Chat
          </a>
          <a href="#" className="nav-item">
            Games
          </a>
        </nav>

        <div className="user-profile">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="user-avatar-img" />
          ) : (
            <div className="user-avatar">{getInitials(displayName)}</div>
          )}
          <div className="user-info">
            <div className="user-name">{displayName}</div>
            <div className="user-login">@{username}</div>
          </div>
          <button onClick={handleLogout} className="logout-dots">•••</button>
        </div>
      </aside>

      <main className="main">
        <div className="header">
          <div>
            <h1>Welcome back! 👋</h1>
            <p>Here's what's happening with your projects</p>
          </div>
        </div>

        <div className="stats">
          <div className="stat-card">
            <div>
              <div className="stat-value">0</div>
              <div className="stat-label">Active Projects</div>
            </div>
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-value">0</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-value">{wallet}</div>
              <div className="stat-label">Wallet</div>
            </div>
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-value">{correctionPoints}</div>
              <div className="stat-label">Evaluation Points</div>
            </div>
          </div>
        </div>

        <div className="info-card">
          <div className="info-header">
            <h3>Your Profile</h3>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Campus</div>
              <div className="info-value">{campus}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Email</div>
              <div className="info-value">{user?.email}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Login</div>
              <div className="info-value">{username}</div>
            </div>
            {cursus && cursus.length > 0 && (
              <div className="info-item">
                <div className="info-label">Cursus</div>
                <div className="info-value">{cursus.join(', ')}</div>
              </div>
            )}
          </div>
        </div>

        <div className="section-header">
          <h2>Current Projects</h2>
        </div>

        <div className="empty-state">
          <h3>No Projects Data Available</h3>
          <p>Your backend needs to fetch project data from the 42 API.</p>
          <details style={{ marginTop: '16px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--light)' }}>
              How to fix this
            </summary>
            <div style={{ 
              marginTop: '12px', 
              padding: '16px', 
              background: 'rgba(0,0,0,0.3)', 
              borderRadius: '8px',
              fontSize: '13px'
            }}>
              <p style={{ marginBottom: '8px' }}>Your backend needs to store or fetch these fields from 42 API:</p>
              <ul style={{ marginLeft: '20px', color: 'var(--light)' }}>
                <li><code>projects_users</code> - Array of your projects</li>
                <li><code>cursus_users</code> - Array with level and skills</li>
              </ul>
              <p style={{ marginTop: '12px', fontSize: '12px', color: '#93C5FD' }}>
                Check the backend code examples I'll provide next!
              </p>
            </div>
          </details>
        </div>
      </main>
    </div>
  );
};

export default FullDashboard;
