import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken, getToken } from '../utils/auth';
import '../styles/FullDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const OLD_CURRICULUM = {
  0: [{ slug: 'libft', name: 'Libft', team: 1 }],
  1: [
    { slug: 'get_next_line', name: 'get_next_line', team: 1 },
    { slug: 'ft_printf', name: 'ft_printf', team: 1 },
    { slug: 'born2beroot', name: 'Born2beroot', team: 1 }
  ],
  2: [
    { slug: 'push_swap', name: 'push_swap', team: 1 },
    { slug: 'pipex', name: 'pipex', team: 1, alt: 'minitalk' },
    { slug: 'minitalk', name: 'minitalk', team: 1, alt: 'pipex' },
    { slug: 'fract-ol', name: 'fract-ol', team: 1, alt: 'fdf' },
    { slug: 'fdf', name: 'FdF', team: 1, alt: 'fract-ol' },
    { slug: 'so_long', name: 'so_long', team: 1, alt: 'fract-ol' }
  ],
  3: [
    { slug: 'philosophers', name: 'Philosophers', team: 1 },
    { slug: 'minishell', name: 'minishell', team: 2 }
  ],
  4: [
    { slug: 'cub3d', name: 'cub3D', team: 2, alt: 'minirt' },
    { slug: 'minirt', name: 'miniRT', team: 2, alt: 'cub3d' },
    { slug: 'netpractice', name: 'NetPractice', team: 1 },
    { slug: 'cpp-module-00', name: 'CPP Module 00', team: 1 },
    { slug: 'cpp-module-01', name: 'CPP Module 01', team: 1 },
    { slug: 'cpp-module-02', name: 'CPP Module 02', team: 1 },
    { slug: 'cpp-module-03', name: 'CPP Module 03', team: 1 },
    { slug: 'cpp-module-04', name: 'CPP Module 04', team: 1 }
  ],
  5: [
    { slug: 'webserv', name: 'webserv', team: 3 },
    { slug: 'ft_irc', name: 'ft_irc', team: 3, alt: 'webserv' },
    { slug: 'cpp-module-05', name: 'CPP Module 05', team: 1 },
    { slug: 'cpp-module-06', name: 'CPP Module 06', team: 1 },
    { slug: 'cpp-module-07', name: 'CPP Module 07', team: 1 },
    { slug: 'cpp-module-08', name: 'CPP Module 08', team: 1 },
    { slug: 'cpp-module-09', name: 'CPP Module 09', team: 1 },
    { slug: 'inception', name: 'Inception', team: 1 }
  ],
  6: [
    { slug: 'ft_transcendence', name: 'ft_transcendence', team: 5 },
    { slug: '42_collaborative_resume', name: '42 Collaborative Resume', team: 2 }
  ]
};

const NEW_CURRICULUM = {
  0: [{ slug: 'libft', name: 'Libft', team: 1 }],
  1: [
    { slug: 'get_next_line', name: 'get_next_line', team: 1 },
    { slug: 'ft_printf', name: 'ft_printf', team: 1 },
    { slug: 'push_swap', name: 'push_swap', team: 1 }
  ],
  2: [
    { slug: 'born2beroot', name: 'Born2beroot', team: 1 },
    { slug: 'python-module-00', name: 'Python Module 00', team: 1 },
    { slug: 'python-module-01', name: 'Python Module 01', team: 1 },
    { slug: 'python-module-02', name: 'Python Module 02', team: 1 },
    { slug: 'python-module-03', name: 'Python Module 03', team: 1 },
    { slug: 'python-module-04', name: 'Python Module 04', team: 1 },
    { slug: 'python-module-05', name: 'Python Module 05', team: 1 },
    { slug: 'python-module-06', name: 'Python Module 06', team: 1 },
    { slug: 'python-module-07', name: 'Python Module 07', team: 1 },
    { slug: 'python-module-08', name: 'Python Module 08', team: 1 },
    { slug: 'python-module-09', name: 'Python Module 09', team: 1 },
    { slug: 'python-module-10', name: 'Python Module 10', team: 1 },
    { slug: 'a-maze-ing', name: 'A-Maze-ing', team: 2 }
  ],
  3: [
    { slug: 'codexion', name: 'Codexion', team: 1 },
    { slug: 'fly-in', name: 'Fly-in', team: 1 },
    { slug: 'call-me-maybe', name: 'Call Me Maybe', team: 1 }
  ],
  4: [
    { slug: 'netpractice', name: 'NetPractice', team: 1 },
    { slug: 'pac-man', name: 'Pac-Man', team: 2 },
    { slug: 'rag-against-the-machine', name: 'RAG against the machine', team: 1 }
  ],
  5: [
    { slug: 'agent-smith', name: 'Agent Smith', team: 3 },
    { slug: 'the-answer-protocol', name: 'The Answer Protocol', team: 3 },
    { slug: 'inception', name: 'Inception', team: 1 }
  ],
  6: [
    { slug: 'ft_transcendence', name: 'ft_transcendence', team: 5 },
    { slug: '42_collaborative_resume', name: '42 Collaborative Resume', team: 2 }
  ]
};

const COMMON_CIRCLE_01 = {
  0: [{ slug: 'libft', name: 'Libft', team: 1 }],
  1: [
    { slug: 'get_next_line', name: 'get_next_line', team: 1 },
    { slug: 'ft_printf', name: 'ft_printf', team: 1 }
  ]
};

const FullDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [activeSection, setActiveSection] = useState('cc');
  const [teamName, setTeamName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [myTeams, setMyTeams] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [showInvites, setShowInvites] = useState(false);

  useEffect(() => {
    fetchMyTeams();
    fetchPendingInvites();
  }, []);

  const fetchMyTeams = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/teams/my-teams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyTeams(data);
      }
    } catch (err) {
      console.error('Failed to fetch teams');
    }
  };

  const fetchPendingInvites = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/teams/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPendingInvites(data);
      }
    } catch (err) {
      console.error('Failed to fetch invites');
    }
  };

  const handleLogout = useCallback(() => {
    removeToken();
    navigate('/login');
  }, [navigate]);

  const searchUsers = useCallback(async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/auth/users/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setSearchResults([]);
    }
    setSearching(false);
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const addMember = (member) => {
    const maxMembers = (selectedProject?.team || 2) - 1;
    if (selectedMembers.length >= maxMembers) {
      return;
    }
    if (!selectedMembers.find(m => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeMember = (memberId) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== memberId));
  };

  const resetTeamModal = () => {
    setTeamName('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedMembers([]);
  };

  const canCreateTeam = teamName.trim() !== '' && selectedMembers.length > 0;

  const username = user?.login || 'user';
  const userId = user?.id;
  const campus = user?.campus || 'Campus';
  const wallet = user?.wallet || 0;
  const correctionPoints = user?.correctionPoints || user?.correction_point || 0;
  const level = user?.level || user?.cursusUsers?.find(c => c.cursus?.slug === '42cursus')?.level || 0;
  const avatarUrl = user?.image?.link || user?.image?.versions?.medium || user?.avatar?.medium;
  const allProjects = user?.projectsUsers || [];
  const currentCircle = user?.currentCircle ?? 0;
  const curriculum = user?.curriculum || 'unknown';

  const grade = useMemo(() => {
    const cursus42 = user?.cursusUsers?.find(c => c.cursus?.slug === '42cursus' || c.cursus_id === 21);
    return cursus42?.grade || 'Cadet';
  }, [user]);

  const isCadet = grade === 'Cadet';
  const isTranscender = grade === 'Transcender' || grade === 'Member';

  const getCurriculum = useMemo(() => {
    if (curriculum === 'old') return OLD_CURRICULUM;
    if (curriculum === 'new') return NEW_CURRICULUM;
    return COMMON_CIRCLE_01;
  }, [curriculum]);

  const getUserProjectStatus = useCallback((projectSlug) => {
    const normalizedSlug = projectSlug.toLowerCase().replace(/_/g, '-');
    const project = allProjects.find(p => {
      const pSlug = (p.project?.slug || '').toLowerCase().replace(/_/g, '-');
      return pSlug.includes(normalizedSlug) || normalizedSlug.includes(pSlug);
    });
    if (!project) return null;
    return {
      status: project.status,
      validated: project['validated?'],
      finalMark: project.final_mark,
      id: project.id
    };
  }, [allProjects]);

  const getCircleProjects = useCallback((circleNum) => {
    const circleDefinition = getCurriculum[circleNum] || [];
    return circleDefinition.map(proj => ({
      ...proj,
      userStatus: getUserProjectStatus(proj.slug)
    }));
  }, [getCurriculum, getUserProjectStatus]);

  const needsCurriculumDetection = curriculum === 'unknown' && currentCircle >= 1;

  const activeCircle = selectedCircle !== null ? selectedCircle : currentCircle;

  const circleProjects = useMemo(() => {
    if (needsCurriculumDetection && activeCircle === 1) {
      return getCircleProjects(1);
    }
    return getCircleProjects(activeCircle);
  }, [activeCircle, getCircleProjects, needsCurriculumDetection]);

  const getCircleStats = useCallback((circleNum) => {
    const projects = getCircleProjects(circleNum);
    const completed = projects.filter(p => p.userStatus?.status === 'finished' && p.userStatus?.validated).length;
    return { total: projects.length, completed };
  }, [getCircleProjects]);

  const allCCProjects = useMemo(() => {
    if (!isTranscender) return [];
    const projects = [];
    const curr = curriculum === 'new' ? NEW_CURRICULUM : OLD_CURRICULUM;
    for (let i = 0; i <= 6; i++) {
      const circleProjs = curr[i] || [];
      circleProjs.forEach(proj => {
        const userStatus = getUserProjectStatus(proj.slug);
        if (userStatus) {
          projects.push({ ...proj, circle: i, userStatus });
        }
      });
    }
    return projects;
  }, [isTranscender, curriculum, getUserProjectStatus]);

  const outerCoreProjects = useMemo(() => {
    if (!isTranscender) return [];
    const ccSlugs = new Set();
    const curr = curriculum === 'new' ? NEW_CURRICULUM : OLD_CURRICULUM;
    for (let i = 0; i <= 6; i++) {
      (curr[i] || []).forEach(p => ccSlugs.add(p.slug.toLowerCase()));
    }
    return allProjects.filter(p => {
      const slug = (p.project?.slug || '').toLowerCase();
      const isCC = Array.from(ccSlugs).some(cc => slug.includes(cc) || cc.includes(slug));
      const is42Cursus = p.cursus_ids?.includes(21);
      return is42Cursus && !isCC;
    }).map(p => ({
      slug: p.project?.slug,
      name: p.project?.name,
      team: 1,
      userStatus: {
        status: p.status,
        validated: p['validated?'],
        finalMark: p.final_mark,
        id: p.id
      }
    }));
  }, [isTranscender, curriculum, allProjects]);

  const handleProjectClick = (project) => {
    if (project.team > 1) {
      const existingTeam = myTeams.find(t => t.project.slug === project.slug && t.status === 'active');
      if (existingTeam) {
        navigate(`/kanban/${project.slug}`);
        return;
      }
      setSelectedProject(project);
      setShowCreateTeam(true);
    } else {
      navigate(`/kanban/${project.slug}`);
    }
  };

  const handleTeamCreated = async () => {
    if (!canCreateTeam) return;
    
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/teams`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: teamName,
          projectSlug: selectedProject.slug,
          projectName: selectedProject.name,
          memberIds: selectedMembers.map(m => m.id)
        })
      });

      if (response.ok) {
        await fetchMyTeams();
        setShowCreateTeam(false);
        resetTeamModal();
      }
    } catch (err) {
      console.error('Failed to create team');
    }
  };

  const handleInviteResponse = async (teamId, accept) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/teams/${teamId}/respond`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accept })
      });

      if (response.ok) {
        await fetchPendingInvites();
        await fetchMyTeams();
      }
    } catch (err) {
      console.error('Failed to respond to invite');
    }
  };

  const goToTeamKanban = (team) => {
    navigate(`/kanban/${team.project.slug}`);
  };

  const closeModal = () => {
    setSelectedProject(null);
    setShowCreateTeam(false);
    resetTeamModal();
  };

  const getStatusBadge = (userStatus) => {
    if (!userStatus) return { className: 'badge-not-started', text: 'Not Started' };
    if (userStatus.status === 'finished' && userStatus.validated) {
      return { className: 'badge-completed', text: `${userStatus.finalMark}%` };
    }
    if (userStatus.status === 'finished' && !userStatus.validated) {
      return { className: 'badge-failed', text: 'Failed' };
    }
    if (userStatus.status === 'in_progress') {
      return { className: 'badge-active', text: 'In Progress' };
    }
    if (userStatus.status === 'searching_a_group') {
      return { className: 'badge-searching', text: 'Finding Team' };
    }
    return { className: 'badge-active', text: userStatus.status };
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const totalActive = allProjects.filter(p => 
    p.status === 'in_progress' || p.status === 'searching_a_group'
  ).length;
  
  const totalCompleted = allProjects.filter(p => 
    p.status === 'finished' && p['validated?']
  ).length;

  const titles = [
    "the Legendary", "the Mighty", "the Architect", "the Unstoppable",
    "the Bug Slayer", "the Chosen One", "the Code Wizard"
  ];

  const randomTitle = useMemo(() => 
    titles[Math.floor(Math.random() * titles.length)], 
  []);

  return (
    <div className="full-dashboard">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">21</div>
          <div className="logo-text">Project Hub</div>
        </div>

        <nav className="nav-section">
          <a href="#" className="nav-item active">Dashboard</a>
          {pendingInvites.length > 0 && (
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); setShowInvites(true); }}>
              Invites
              <span className="badge">{pendingInvites.length}</span>
            </a>
          )}
        </nav>

        <div className="nav-divider"></div>

        <nav className="nav-section">
          <a href="#" className="nav-item">Chat</a>
          <a href="#" className="nav-item">Games</a>
        </nav>

        <div className="user-profile">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="user-avatar-img" />
          ) : (
            <div className="user-avatar">{getInitials(username)}</div>
          )}
          <div className="user-info">
            <div className="user-login">@{username}</div>
          </div>
          <button onClick={handleLogout} className="logout-dots">...</button>
        </div>
      </aside>

      <main className="main">
        <div className="header">
          <div>
            <h1>{username}, {randomTitle}</h1>
            <p>Here's what's happening with your projects</p>
          </div>
          <div className="header-actions">
            <span className="curriculum-badge">
              {curriculum === 'old' ? 'C/C++' : curriculum === 'new' ? 'Python' : 'Detecting...'}
            </span>
          </div>
        </div>

        <div className="stats">
          <div className="stat-card">
            <div className="stat-value">{totalActive}</div>
            <div className="stat-label">Active</div>
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
            <div className="stat-label">Eval Points</div>
          </div>
        </div>

        <div className="info-card">
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
              <div className="info-label">Grade</div>
              <div className="info-value">{grade}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Milestone</div>
              <div className="info-value">{currentCircle}</div>
            </div>
          </div>
        </div>

        {isCadet && (
          <>
            <div className="section-header">
              <h2>Milestones</h2>
            </div>

            <div className="circle-selector">
              {[0, 1, 2, 3, 4, 5, 6].map(milestone => {
                const stats = getCircleStats(milestone);
                const isLocked = curriculum === 'unknown' && milestone > 1;
                const isCurrent = milestone === currentCircle;
                const isCompleted = milestone < currentCircle;
                const isActive = milestone === activeCircle;
                
                return (
                  <button
                    key={milestone}
                    className={`circle-btn ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''} ${isCompleted ? 'complete' : ''} ${isLocked ? 'locked' : ''}`}
                    onClick={() => !isLocked && setSelectedCircle(milestone)}
                    disabled={isLocked}
                  >
                    <span className="circle-number">{milestone}</span>
                    {!isLocked && (
                      <span className="circle-progress">{stats.completed}/{stats.total}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {needsCurriculumDetection && activeCircle === 1 && (
              <div className="curriculum-notice">
                <p>Register for <strong>Born2beroot</strong> or <strong>push_swap</strong> on the intranet to unlock your curriculum path.</p>
              </div>
            )}

            <div className="section-header">
              <h2>Milestone {activeCircle} Projects</h2>
            </div>

            <div className="projects-grid">
              {circleProjects.map((project, idx) => {
                const badge = getStatusBadge(project.userStatus);
                const activeTeam = myTeams.find(t => t.project.slug === project.slug && t.status === 'active');
                const pendingTeam = myTeams.find(t => t.project.slug === project.slug && t.status === 'pending');
                
                return (
                  <div 
                    key={idx} 
                    className={`project-card ${activeTeam ? 'has-team' : ''} ${pendingTeam ? 'pending-team' : ''}`}
                    onClick={() => !activeTeam && !pendingTeam && handleProjectClick(project)}
                  >
                    <div className="project-header">
                      <div className="project-icon">
                        {project.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className={`project-badge ${activeTeam ? 'badge-completed' : pendingTeam ? 'badge-pending' : badge.className}`}>
                        {activeTeam ? 'Active Team' : pendingTeam ? 'Pending' : badge.text}
                      </span>
                    </div>
                    <div className="project-name">{project.name}</div>
                    <div className="project-meta">
                      {project.team > 1 ? `Team (${project.team})` : 'Solo'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="section-header">
              <h2>My Teams</h2>
            </div>

            {myTeams.filter(t => t.status === 'active').length === 0 ? (
              <div className="empty-teams">
                <p>No active teams yet. Create a team by clicking on a team project above.</p>
              </div>
            ) : (
              <div className="teams-grid">
                {myTeams.filter(t => t.status === 'active').map(team => (
                  <div key={team.id} className="team-card" onClick={() => goToTeamKanban(team)}>
                    <div className="team-header">
                      <div className="team-avatars">
                        {team.members.slice(0, 3).map((member, idx) => (
                          member.avatar ? (
                            <img key={idx} src={member.avatar} alt={member.login} className="team-header-avatar" title={member.login} />
                          ) : (
                            <div key={idx} className="team-header-placeholder" title={member.login}>
                              {member.login.slice(0, 2).toUpperCase()}
                            </div>
                          )
                        ))}
                      </div>
                      <div className="team-info">
                        <div className="team-name">{team.name}</div>
                        <div className="team-project">{team.project.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {isTranscender && (
          <>
            <div className="section-header">
              <h2>Core Selection</h2>
            </div>

            <div className="core-selector">
              <button 
                className={`core-btn ${activeSection === 'cc' ? 'active' : ''}`}
                onClick={() => setActiveSection('cc')}
              >
                <span className="core-label">CC</span>
                <span className="core-sublabel">Common Core</span>
              </button>
              <button 
                className={`core-btn ${activeSection === 'oc' ? 'active' : ''}`}
                onClick={() => setActiveSection('oc')}
              >
                <span className="core-label">OC</span>
                <span className="core-sublabel">Outer Core</span>
              </button>
            </div>

            {activeSection === 'cc' && (
              <>
                <div className="section-header">
                  <h2>Common Core - Completed</h2>
                </div>
                <div className="projects-grid">
                  {allCCProjects.map((project, idx) => {
                    const badge = getStatusBadge(project.userStatus);
                    return (
                      <div 
                        key={idx} 
                        className="project-card"
                        onClick={() => handleProjectClick(project)}
                      >
                        <div className="project-header">
                          <div className="project-icon">
                            {project.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className={`project-badge ${badge.className}`}>
                            {badge.text}
                          </span>
                        </div>
                        <div className="project-name">{project.name}</div>
                        <div className="project-meta">Circle {project.circle}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {activeSection === 'oc' && (
              <>
                <div className="section-header">
                  <h2>Outer Core Projects</h2>
                </div>
                {outerCoreProjects.length > 0 ? (
                  <div className="projects-grid">
                    {outerCoreProjects.map((project, idx) => {
                      const badge = getStatusBadge(project.userStatus);
                      return (
                        <div 
                          key={idx} 
                          className="project-card"
                          onClick={() => handleProjectClick(project)}
                        >
                          <div className="project-header">
                            <div className="project-icon">
                              {project.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className={`project-badge ${badge.className}`}>
                              {badge.text}
                            </span>
                          </div>
                          <div className="project-name">{project.name}</div>
                          <div className="project-meta">Outer Core</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>No Outer Core Projects</h3>
                    <p>Register for projects on the intranet to start your outer core journey.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {showCreateTeam && selectedProject && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Team</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>{selectedProject.name}</strong></p>
              <p>Team size: {selectedProject.team} members (you + {selectedProject.team - 1} others)</p>
              
              <div className="team-form">
                <input 
                  type="text" 
                  placeholder="Team name" 
                  className={`team-input ${!teamName.trim() ? 'input-required' : ''}`}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
                
                <div className="search-container">
                  <input 
                    type="text" 
                    placeholder="Search member by login..." 
                    className="team-input"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    disabled={selectedMembers.length >= selectedProject.team - 1}
                  />
                  {searching && <div className="search-loading">Searching...</div>}
                  {selectedMembers.length >= selectedProject.team - 1 && (
                    <div className="max-members-reached">Maximum team members reached</div>
                  )}
                  {searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.map(result => (
                        <div 
                          key={result.id} 
                          className="search-result-item"
                          onClick={() => addMember(result)}
                        >
                          {result.avatar ? (
                            <img src={result.avatar} alt={result.login} className="result-avatar" />
                          ) : (
                            <div className="result-avatar-placeholder">{result.login.slice(0, 2).toUpperCase()}</div>
                          )}
                          <div className="result-info">
                            <span className="result-login">{result.login}</span>
                            <span className="result-details">{result.campus} - Level {result.level?.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="selected-members">
                  <p>Team Members: {selectedMembers.length}/{selectedProject.team - 1}</p>
                  {selectedMembers.length === 0 && (
                    <div className="no-members">Add at least one member to continue</div>
                  )}
                  {selectedMembers.map(member => (
                    <div key={member.id} className="selected-member">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.login} className="member-avatar" />
                      ) : (
                        <div className="member-avatar-placeholder">{member.login.slice(0, 2).toUpperCase()}</div>
                      )}
                      <span>{member.login}</span>
                      <button className="remove-member" onClick={() => removeMember(member.id)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button 
                className={`btn-primary ${!canCreateTeam ? 'btn-disabled' : ''}`} 
                onClick={handleTeamCreated}
                disabled={!canCreateTeam}
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvites && (
        <div className="modal-overlay" onClick={() => setShowInvites(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Team Invitations</h2>
              <button className="modal-close" onClick={() => setShowInvites(false)}>×</button>
            </div>
            <div className="modal-body">
              {pendingInvites.length === 0 ? (
                <p>No pending invitations</p>
              ) : (
                <div className="invites-list">
                  {pendingInvites.map(invite => (
                    <div key={invite.id} className="invite-item">
                      <div className="invite-info">
                        <div className="invite-team-name">{invite.name}</div>
                        <div className="invite-project">{invite.project.name}</div>
                        <div className="invite-creator">by @{invite.creator.login}</div>
                      </div>
                      <div className="invite-actions">
                        <button 
                          className="btn-accept"
                          onClick={() => handleInviteResponse(invite.id, true)}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn-decline"
                          onClick={() => handleInviteResponse(invite.id, false)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullDashboard;