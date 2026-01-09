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
  
  const level = user?.level || 
                user?.cursusUsers?.find(c => c.cursus?.slug === '42cursus')?.level ||
                user?.cursusUsers?.[user?.cursusUsers.length - 1]?.level || 0;
                
  const avatarUrl = user?.avatar?.medium || user?.avatar;

  const projects = user?.projectsUsers || [];
  const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'searching_a_group').length;
  const completedProjects = projects.filter(p => p.status === 'finished' && p['validated?']).length;

  const getInitials = (name) => {
    if (!name) return 'YO';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getProjectIcon = (projectName) => {
    const name = projectName.toLowerCase();
    if (name.includes('exam')) return '📝';
    if (name.includes('cpp') || name.includes('c++')) return '⚙️';
    if (name.includes('webserv') || name.includes('web')) return '🌐';
    if (name.includes('inception')) return '🐳';
    if (name.includes('transcendence') || name.includes('ft_transcendence')) return '🎮';
    if (name.includes('minishell')) return '💻';
    if (name.includes('philosophers')) return '🍝';
    if (name.includes('cub3d')) return '🎮';
    if (name.includes('miniRT') || name.includes('minirt')) return '🎨';
    if (name.includes('push_swap')) return '🔄';
    if (name.includes('so_long')) return '🗺️';
    if (name.includes('pipex')) return '⚡';
    if (name.includes('born2beroot')) return '🔐';
    if (name.includes('printf')) return '📄';
    if (name.includes('get_next_line')) return '📖';
    if (name.includes('libft')) return '📚';
    return '🚀';
  };

  return (
    <div className="full-dashboard">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">21</div>
          <div className="logo-text">Project Hub</div>
        </div>

        <nav className="nav-section">
          <a href="#" className="nav-item active">
            Dashboard
          </a>
          <a href="#" className="nav-item">
            Projects
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
          <button className="btn-new-project">
            <span className="plus-icon">+</span>
            New Project
          </button>
        </div>

        <div className="stats">
          <div className="stat-card">
            <div className="stat-value">{activeProjects}</div>
            <div className="stat-label">Active Projects</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{completedProjects}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{wallet}</div>
            <div className="stat-label">Wallet</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{correctionPoints}</div>
            <div className="stat-label">Evaluation Points</div>
          </div>
        </div>

        <div className="info-card">
          <div className="info-header">
            <h3>Your Profile</h3>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Level</div>
              <div className="info-value">{level.toFixed(2)}</div>
            </div>
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
          </div>
        </div>

        <div className="section-header">
          <h2>My Teams</h2>
          <a href="#" style={{ color: 'var(--light)', fontSize: '14px', textDecoration: 'none' }}>
            View all
          </a>
        </div>

        <div className="empty-state">
          <h3>No Teams Yet</h3>
          <p>Create your first team to start collaborating on projects</p>
          <button className="btn-create-team" style={{
            marginTop: '16px',
            padding: '12px 24px',
            background: 'var(--cream)',
            color: 'var(--dark)',
            border: 'none',
            borderRadius: '12px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            + Create Team
          </button>
        </div>
      </main>
    </div>
  );
};

export default FullDashboard;
