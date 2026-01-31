import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../utils/auth';
import '../styles/FullDashboard.css';

// 42 Common Core circle structure (project names as they appear in the API)
const CIRCLE_PROJECTS = {
  0: ['libft'],
  1: ['ft_printf', 'get_next_line', 'born2beroot'],
  2: ['push_swap', 'minitalk', 'pipex', 'so_long', 'fdf', 'fract-ol'],
  3: ['philosophers', 'minishell'],
  4: ['cub3d', 'minirt', 'cpp module 00', 'cpp module 01', 'cpp module 02', 'cpp module 03', 'cpp module 04', 'netpractice'],
  5: ['ft_containers', 'webserv', 'ft_irc', 'cpp module 05', 'cpp module 06', 'cpp module 07', 'cpp module 08', 'cpp module 09', 'inception'],
  6: ['ft_transcendence']
};

const FullDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [selectedCircle, setSelectedCircle] = useState(null);

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
  const allProjects = user?.projectsUsers || [];

  const isExamOrPiscine = (projectName) => {
    const name = projectName?.toLowerCase() || '';
    return name.includes('exam') || name.includes('piscine') || name.includes('rush');
  };

  const getProjectCircle = (projectName) => {
    const name = projectName?.toLowerCase() || '';
    for (const [circle, projects] of Object.entries(CIRCLE_PROJECTS)) {
      if (projects.some(p => name.includes(p) || p.includes(name))) {
        return parseInt(circle);
      }
    }
    return -1; 
  };

  const { currentCircle, circleProjects, circleStats } = useMemo(() => {
    const cursusProjects = allProjects.filter(p => {
      const cursusIds = p.cursus_ids || [];
      return cursusIds.includes(21) || (p.project?.parent_id === null && !isExamOrPiscine(p.project?.name));
    });

    const nonExamProjects = cursusProjects.filter(p => !isExamOrPiscine(p.project?.name));

    const projectsByCircle = {};
    for (let i = 0; i <= 6; i++) {
      projectsByCircle[i] = [];
    }

    nonExamProjects.forEach(p => {
      const circle = getProjectCircle(p.project?.name);
      if (circle >= 0 && circle <= 6) {
        projectsByCircle[circle].push(p);
      }
    });

    let current = 0;
    for (let i = 6; i >= 0; i--) {
      const circleProjectsList = projectsByCircle[i];
      const hasInProgress = circleProjectsList.some(p => 
        p.status === 'in_progress' || p.status === 'searching_a_group'
      );
      const hasValidated = circleProjectsList.some(p => 
        p.status === 'finished' && p['validated?']
      );
      
      if (hasInProgress) {
        current = i;
        break;
      }
      if (hasValidated && current < i) {
        current = i;
      }
    }

    const stats = {};
    for (let i = 0; i <= 6; i++) {
      const projects = projectsByCircle[i];
      stats[i] = {
        total: CIRCLE_PROJECTS[i].length,
        completed: projects.filter(p => p.status === 'finished' && p['validated?']).length,
        inProgress: projects.filter(p => p.status === 'in_progress' || p.status === 'searching_a_group').length,
        failed: projects.filter(p => p.status === 'finished' && !p['validated?']).length
      };
    }

    return {
      currentCircle: current,
      circleProjects: projectsByCircle,
      circleStats: stats
    };
  }, [allProjects]);

  const activeCircle = selectedCircle !== null ? selectedCircle : currentCircle;
  const displayProjects = circleProjects[activeCircle] || [];

  const getInitials = (name) => {
    if (!name) return 'YO';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const titles = [
    "the Legendary",
    "the Mighty",
    "the Architect",
    "the Unstoppable",
    "the Bug Slayer",
    "the Chosen One",
    "the Code Wizard",
  ];

  const randomTitle = useMemo(() => 
    titles[Math.floor(Math.random() * titles.length)], 
  []);

  const getStatusBadge = (project) => {
    if (project.status === 'finished' && project['validated?']) {
      return { class: 'badge-completed', text: `${project.final_mark || 0}%` };
    }
    if (project.status === 'finished' && !project['validated?']) {
      return { class: 'badge-failed', text: 'Failed' };
    }
    if (project.status === 'in_progress') {
      return { class: 'badge-active', text: 'In Progress' };
    }
    if (project.status === 'searching_a_group') {
      return { class: 'badge-searching', text: 'Looking for team' };
    }
    return { class: 'badge-active', text: project.status };
  };

  const getProjectColor = (projectName) => {
    const colors = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
      'linear-gradient(135deg, #a8edea, #fed6e3)',
      'linear-gradient(135deg, #d299c2, #fef9d7)',
      'linear-gradient(135deg, #89f7fe, #66a6ff)',
    ];
    const index = (projectName?.length || 0) % colors.length;
    return colors[index];
  };

  const totalActive = Object.values(circleStats).reduce((sum, s) => sum + s.inProgress, 0);
  const totalCompleted = Object.values(circleStats).reduce((sum, s) => sum + s.completed, 0);

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
            <h1>{username}, {randomTitle}</h1>
            <p>Here's what's happening with your projects</p>
          </div>
          <button className="btn-new-project">
            <span className="plus-icon">+</span>
            New Project
          </button>
        </div>

        <div className="stats">
          <div className="stat-card">
            <div className="stat-value">{totalActive}</div>
            <div className="stat-label">Active Projects</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalCompleted}</div>
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
              <div className="info-label">Current Circle</div>
              <div className="info-value">Circle {currentCircle}</div>
            </div>
          </div>
        </div>

        {/* Circle Selector */}
        <div className="section-header">
          <h2>Circle Projects</h2>
        </div>

        <div className="circle-selector">
          {[0, 1, 2, 3, 4, 5, 6].map(circle => {
            const stats = circleStats[circle];
            const isComplete = stats.completed >= stats.total && stats.total > 0;
            const hasActivity = stats.completed > 0 || stats.inProgress > 0;
            
            return (
              <button
                key={circle}
                className={`circle-btn ${activeCircle === circle ? 'active' : ''} ${isComplete ? 'complete' : ''} ${circle === currentCircle ? 'current' : ''}`}
                onClick={() => setSelectedCircle(circle)}
              >
                <span className="circle-number">{circle}</span>
                {hasActivity && (
                  <span className="circle-progress">
                    {stats.completed}/{stats.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="section-header" style={{ marginTop: '24px' }}>
          <h2>Circle {activeCircle} Projects</h2>
          <span style={{ color: 'var(--light)', fontSize: '14px' }}>
            {circleStats[activeCircle]?.completed || 0}/{circleStats[activeCircle]?.total || 0} completed
          </span>
        </div>

        {displayProjects.length > 0 ? (
          <div className="projects-grid">
            {displayProjects.map((project, index) => {
              const badge = getStatusBadge(project);
              return (
                <div key={project.id || index} className="project-card">
                  <div className="project-header">
                    <div 
                      className="project-icon"
                      style={{ background: getProjectColor(project.project?.name) }}
                    >
                      {(project.project?.name || 'P').substring(0, 2).toUpperCase()}
                    </div>
                    <span className={`project-badge ${badge.class}`}>
                      {badge.text}
                    </span>
                  </div>
                  <div className="project-name">{project.project?.name || 'Unknown Project'}</div>
                  <div className="project-members">
                    {project.status === 'finished' 
                      ? (project['validated?'] ? 'Validated' : 'Not validated')
                      : project.status?.replace(/_/g, ' ')
                    }
                  </div>
                  {project.status === 'finished' && project.final_mark !== null && (
                    <div className="project-grade">
                      Final Grade: <strong>{project.final_mark}%</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No Projects in Circle {activeCircle}</h3>
            <p>You haven't started any projects in this circle yet.</p>
            {activeCircle > currentCircle && (
              <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--light)' }}>
                Complete previous circles to unlock these projects.
              </p>
            )}
          </div>
        )}

        {/* Teams Section */}
        <div className="section-header" style={{ marginTop: '32px' }}>
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
