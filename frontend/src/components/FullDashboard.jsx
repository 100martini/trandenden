import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../utils/auth';
import '../styles/FullDashboard.css';

// Fallback mapping of project slugs/names to circles (used if backend doesn't provide circle data)
const PROJECT_TO_CIRCLE = {
  // Circle 0
  'libft': 0,
  
  // Circle 1
  'ft_printf': 1, 'ft-printf': 1,
  'get_next_line': 1,
  'born2beroot': 1,
  
  // Circle 2
  'push_swap': 2, 'push-swap': 2,
  'minitalk': 2,
  'pipex': 2,
  'so_long': 2, 'so-long': 2,
  'fdf': 2,
  'fract-ol': 2, 'fractol': 2, '42cursus-fract-ol': 2,
  
  // Circle 3
  'philosophers': 3, 'philo': 3,
  'minishell': 3,
  
  // Circle 4
  'cub3d': 4, 'cub3D': 4,
  'minirt': 4, 'miniRT': 4,
  'netpractice': 4, 'net_practice': 4,
  'cpp-module-00': 4, 'cpp module 00': 4, 'CPP Module 00': 4,
  'cpp-module-01': 4, 'cpp module 01': 4, 'CPP Module 01': 4,
  'cpp-module-02': 4, 'cpp module 02': 4, 'CPP Module 02': 4,
  'cpp-module-03': 4, 'cpp module 03': 4, 'CPP Module 03': 4,
  'cpp-module-04': 4, 'cpp module 04': 4, 'CPP Module 04': 4,
  
  // Circle 5
  'cpp-module-05': 5, 'cpp module 05': 5, 'CPP Module 05': 5,
  'cpp-module-06': 5, 'cpp module 06': 5, 'CPP Module 06': 5,
  'cpp-module-07': 5, 'cpp module 07': 5, 'CPP Module 07': 5,
  'cpp-module-08': 5, 'cpp module 08': 5, 'CPP Module 08': 5,
  'cpp-module-09': 5, 'cpp module 09': 5, 'CPP Module 09': 5,
  'webserv': 5,
  'ft_irc': 5, 'ft-irc': 5,
  'inception': 5,
  
  // Circle 6
  'ft_transcendence': 6, 'ft-transcendence': 6,
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
  const correctionPoints = user?.correctionPoints || user?.correction_point || 0;
  
  const level = user?.level || 
                user?.cursusUsers?.find(c => c.cursus?.slug === '42cursus')?.level ||
                user?.cursusUsers?.[user?.cursusUsers.length - 1]?.level || 0;
                
  const avatarUrl = user?.image?.link || user?.image?.versions?.medium || user?.avatar?.medium || user?.avatar;
  const allProjects = user?.projectsUsers || [];

  // Filter out exams and piscine projects
  const isExamOrPiscine = (projectName, projectSlug) => {
    const name = (projectName || '').toLowerCase();
    const slug = (projectSlug || '').toLowerCase();
    return name.includes('exam') || slug.includes('exam') || 
           name.includes('piscine') || slug.includes('piscine') || 
           name.includes('rush') || slug.includes('rush');
  };

  // Get circle for a project - uses backend data first, falls back to hardcoded mapping
  const getProjectCircle = (project) => {
    if (!project) return null;
    
    // First, check if backend provided circle data (from 42 API difficulty field)
    if (project.circle !== undefined && project.circle !== null) {
      return project.circle;
    }
    
    // Fallback to hardcoded mapping
    const slug = (project.slug || '').toLowerCase();
    const name = (project.name || '').toLowerCase();
    
    // Try slug first, then name
    if (PROJECT_TO_CIRCLE[slug] !== undefined) return PROJECT_TO_CIRCLE[slug];
    if (PROJECT_TO_CIRCLE[name] !== undefined) return PROJECT_TO_CIRCLE[name];
    
    // Try partial matches
    for (const [key, circle] of Object.entries(PROJECT_TO_CIRCLE)) {
      if (slug.includes(key) || name.includes(key) || key.includes(slug) || key.includes(name)) {
        return circle;
      }
    }
    
    return null;
  };

  // Process projects
  const { currentCircle, circleProjects, availableCircles } = useMemo(() => {
    const projectsByCircle = {};
    let maxCircle = 0;
    let currentCircleValue = 0;

    allProjects.forEach(p => {
      // Skip exams and piscines
      if (isExamOrPiscine(p.project?.name, p.project?.slug)) return;
      
      // Only include 42cursus projects (cursus_id 21)
      if (p.cursus_ids && !p.cursus_ids.includes(21)) return;
      
      const circle = getProjectCircle(p.project);
      if (circle === null) return; // Skip if we can't determine the circle
      
      if (!projectsByCircle[circle]) {
        projectsByCircle[circle] = [];
      }
      projectsByCircle[circle].push(p);
      
      if (circle > maxCircle) {
        maxCircle = circle;
      }

      // Current circle = highest with in-progress
      const isInProgress = p.status === 'in_progress' || p.status === 'searching_a_group';
      if (isInProgress && circle > currentCircleValue) {
        currentCircleValue = circle;
      }
    });

    // If no in-progress, current = highest with activity
    if (currentCircleValue === 0 && Object.keys(projectsByCircle).length > 0) {
      currentCircleValue = Math.max(...Object.keys(projectsByCircle).map(Number));
    }

    const available = Object.keys(projectsByCircle)
      .map(Number)
      .sort((a, b) => a - b);

    return {
      currentCircle: currentCircleValue,
      circleProjects: projectsByCircle,
      availableCircles: available
    };
  }, [allProjects]);

  // Use selected circle or default to current circle
  const activeCircle = selectedCircle !== null ? selectedCircle : currentCircle;
  const displayProjects = circleProjects[activeCircle] || [];

  // Calculate stats for a circle
  const getCircleStats = (circle) => {
    const projects = circleProjects[circle] || [];
    return {
      total: projects.length,
      completed: projects.filter(p => p.status === 'finished' && p['validated?']).length,
      inProgress: projects.filter(p => p.status === 'in_progress' || p.status === 'searching_a_group').length,
    };
  };

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

  // Overall stats from user's actual projects only
  const totalActive = Object.values(circleProjects).flat().filter(p => 
    p.status === 'in_progress' || p.status === 'searching_a_group'
  ).length;
  
  const totalCompleted = Object.values(circleProjects).flat().filter(p => 
    p.status === 'finished' && p['validated?']
  ).length;

  const activeStats = getCircleStats(activeCircle);

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

        {availableCircles.length > 0 ? (
          <>
            <div className="circle-selector">
              {availableCircles.map(circle => {
                const stats = getCircleStats(circle);
                const isComplete = stats.completed === stats.total && stats.total > 0;
                
                return (
                  <button
                    key={circle}
                    className={`circle-btn ${activeCircle === circle ? 'active' : ''} ${isComplete ? 'complete' : ''} ${circle === currentCircle ? 'current' : ''}`}
                    onClick={() => setSelectedCircle(circle)}
                  >
                    <span className="circle-number">{circle}</span>
                    <span className="circle-progress">
                      {stats.completed}/{stats.total}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Projects Grid */}
            <div className="section-header" style={{ marginTop: '24px' }}>
              <h2>Circle {activeCircle}</h2>
              <span style={{ color: 'var(--light)', fontSize: '14px' }}>
                {activeStats.completed}/{activeStats.total} completed
              </span>
            </div>

            {displayProjects.length > 0 ? (
              <div className="projects-grid">
                {displayProjects.map((project, index) => {
                  const badge = getStatusBadge(project);
                  return (
                    <div key={project.id || index} className="project-card">
                      <div className="project-header">
                        <div className="project-icon">
                          {(project.project?.name || 'P').substring(0, 2).toUpperCase()}
                        </div>
                        <span className={`project-badge ${badge.class}`}>
                          {badge.text}
                        </span>
                      </div>
                      <div className="project-name">{project.project?.name || 'Unknown Project'}</div>
                      <div className="project-status">
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
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <h3>No Projects Found</h3>
            <p>Start your 42 journey by registering for projects on the intranet.</p>
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
