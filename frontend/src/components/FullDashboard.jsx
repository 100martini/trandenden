import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken, getToken } from '../utils/auth';
import '../styles/FullDashboard.css';
import '../styles/Congrats.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [deleteRequests, setDeleteRequests] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const username = user?.login || 'user';
  const currentUserId = user?.intraId || user?.id;
  const campus = user?.campus || 'Campus';
  const wallet = user?.wallet || 0;
  const correctionPoints = user?.correctionPoints || user?.correction_point || 0;
  const level = user?.level || user?.cursusUsers?.find(c => c.cursus?.slug === '42cursus')?.level || 0;
  const avatarUrl = user?.image?.link || user?.image?.versions?.medium || user?.avatar?.medium;
  const userProjects = user?.projectsUsers || [];
  const currentCircle = user?.currentCircle ?? 0;
  const curriculum = user?.curriculum || 'unknown';

  const grade = useMemo(() => {
    const cursus42 = user?.cursusUsers?.find(c => c.cursus?.slug === '42cursus' || c.cursus_id === 21);
    return cursus42?.grade || 'Cadet';
  }, [user]);

  const isCadet = grade === 'Cadet';
  const isTranscender = grade === 'Transcender' || grade === 'Member';

  useEffect(() => {
    fetchProjects();
    fetchMyTeams();
    fetchPendingInvites();
    fetchDeleteRequests();

    const interval = setInterval(() => {
      fetchMyTeams();
      fetchPendingInvites();
      fetchDeleteRequests();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects`);
      if (response.ok) {
        const data = await response.json();
        setAllProjects(data);
      }
    } catch (err) {
      console.error('Failed to fetch projects');
    } finally {
      setProjectsLoading(false);
    }
  };

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

  const fetchDeleteRequests = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/teams/delete-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDeleteRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch delete requests');
    }
  };

  const handleLogout = useCallback(() => {
    removeToken();
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('welcomeShown');
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
      const params = new URLSearchParams({
        q: query,
        curriculum: curriculum
      });
      if (selectedProject?.slug) {
        params.append('projectSlug', selectedProject.slug);
      }
      const response = await fetch(`${API_URL}/auth/users/search?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setSearchResults([]);
    }
    setSearching(false);
  }, [curriculum, selectedProject]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const addMember = (member) => {
    const maxMembers = (selectedProject?.maxTeam || selectedProject?.minTeam || 2) - 1;
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

  const minMembers = (selectedProject?.minTeam || 2) - 1;
  const maxMembers = (selectedProject?.maxTeam || selectedProject?.minTeam || 2) - 1;
  const canCreateTeam = teamName.trim() !== '' && selectedMembers.length >= minMembers;

  const getCurriculumProjects = useMemo(() => {
    if (projectsLoading || allProjects.length === 0) return {};
    
    const projectsByCircle = {};
    const userCurriculum = curriculum === 'unknown' ? 'old' : curriculum;
    
    allProjects.forEach(project => {
      if (project.curricula.includes(userCurriculum)) {
        if (!projectsByCircle[project.circle]) {
          projectsByCircle[project.circle] = [];
        }
        projectsByCircle[project.circle].push({
          slug: project.slug,
          name: project.name,
          team: project.minTeam,
          minTeam: project.minTeam,
          maxTeam: project.maxTeam
        });
      }
    });
    
    return projectsByCircle;
  }, [allProjects, curriculum, projectsLoading]);

  const getUserProjectStatus = useCallback((projectSlug) => {
    const normalizedSlug = projectSlug.toLowerCase().replace(/_/g, '-');
    const project = userProjects.find(p => {
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
  }, [userProjects]);

  const getCircleProjects = useCallback((circleNum) => {
    const circleDefinition = getCurriculumProjects[circleNum] || [];
    return circleDefinition.map(proj => ({
      ...proj,
      userStatus: getUserProjectStatus(proj.slug)
    }));
  }, [getCurriculumProjects, getUserProjectStatus]);

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
    if (!isTranscender || projectsLoading) return [];
    const projects = [];
    const userCurriculum = curriculum === 'unknown' ? 'old' : curriculum;
    
    allProjects.forEach(project => {
      if (project.curricula.includes(userCurriculum) && !project.isOuterCore) {
        const userStatus = getUserProjectStatus(project.slug);
        if (userStatus) {
          projects.push({
            slug: project.slug,
            name: project.name,
            team: project.minTeam,
            minTeam: project.minTeam,
            maxTeam: project.maxTeam,
            circle: project.circle,
            userStatus
          });
        }
      }
    });
    
    return projects;
  }, [isTranscender, allProjects, curriculum, getUserProjectStatus, projectsLoading]);

  const outerCoreProjects = useMemo(() => {
    if (!isTranscender) return [];
    const ccSlugs = new Set(allProjects.filter(p => !p.isOuterCore).map(p => p.slug.toLowerCase()));
    
    return userProjects.filter(p => {
      const slug = (p.project?.slug || '').toLowerCase();
      const isCC = Array.from(ccSlugs).some(cc => slug.includes(cc) || cc.includes(slug));
      const is42Cursus = p.cursus_ids?.includes(21);
      return is42Cursus && !isCC;
    }).map(p => ({
      slug: p.project?.slug,
      name: p.project?.name,
      team: 1,
      minTeam: 1,
      maxTeam: 1,
      userStatus: {
        status: p.status,
        validated: p['validated?'],
        finalMark: p.final_mark,
        id: p.id
      }
    }));
  }, [isTranscender, allProjects, userProjects]);

  const handleProjectClick = (project) => {
    if (project.team > 1 || project.minTeam > 1) {
      const existingTeam = myTeams.find(t => t.project.slug === project.slug && t.status === 'active');
      if (existingTeam) {
        navigate(`/kanban/${project.slug}`);
        return;
      }
      const pendingTeam = myTeams.find(t => t.project.slug === project.slug && t.status === 'pending');
      if (pendingTeam) {
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
          memberIds: selectedMembers.map(m => m.id)
        })
      });

      if (response.ok) {
        await fetchMyTeams();
        await fetchPendingInvites();
        setShowCreateTeam(false);
        resetTeamModal();
      }
    } catch (err) {
      console.error('Failed to create team');
    }
  };

  const handleInviteResponse = async (team, accept) => {
    try {
      const token = getToken();
      const teamId = team._id || team.id;
      
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

  const handleDeleteTeam = (team, e) => {
    e.stopPropagation();
    setTeamToDelete(team);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTeam = async () => {
    if (!teamToDelete) return;
    
    try {
      const token = getToken();
      const teamId = teamToDelete._id || teamToDelete.id;
      
      const response = await fetch(`${API_URL}/teams/${teamId}/request-delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchMyTeams();
        await fetchDeleteRequests();
        setShowDeleteConfirm(false);
        setTeamToDelete(null);
      }
    } catch (err) {
      console.error('Failed to request team deletion');
    }
  };

  const handleDeleteRequestResponse = async (request, accept) => {
    try {
      const token = getToken();
      const requestId = request._id || request.id;
      
      const response = await fetch(`${API_URL}/teams/delete-requests/${requestId}/respond`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accept })
      });

      if (response.ok) {
        await fetchDeleteRequests();
        await fetchMyTeams();
      }
    } catch (err) {
      console.error('Failed to respond to delete request');
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

  const validDeleteRequests = useMemo(() => 
    deleteRequests.filter(req => req.requestedBy?.login && req.teamName),
  [deleteRequests]);

  const totalActive = userProjects.filter(p => 
    p.status === 'in_progress' || p.status === 'searching_a_group'
  ).length;
  
  const totalCompleted = userProjects.filter(p => 
    p.status === 'finished' && p['validated?']
  ).length;

  const titles = [
    "the Legendary", "the Mighty", "the Architect", "the Unstoppable",
    "the Bug Slayer", "the Chosen One", "the Code Wizard"
  ];

  const randomTitle = useMemo(() => 
    titles[Math.floor(Math.random() * titles.length)], 
  []);

  if (projectsLoading) {
    return (
      <div className="full-dashboard">
        <div className="loading">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="full-dashboard">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">21</div>
          <div className="logo-text">Project Hub</div>
        </div>

        <nav className="nav-section">
          <a href="#" className="nav-item active">Dashboard</a>
          {(pendingInvites.length > 0 || validDeleteRequests.length > 0) && (
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); setShowInvites(true); }}>
              Requests
              <span className="badge">{pendingInvites.length + validDeleteRequests.length}</span>
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
          <button onClick={handleLogout} className="logout-dots" title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
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

        {isTranscender && (
          <div className="cc-congrats-section">
            <div className="congrats-card">
              <div className="congrats-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h2>Congratulations, {grade}!</h2>
              <p>You've completed the Common Core. Welcome to the next level of your 42 journey.</p>
            </div>
          </div>
        )}

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
                const hasPendingTeam = !!pendingTeam;
                
                return (
                  <div 
                    key={idx} 
                    className={`project-card ${activeTeam ? 'has-team' : ''} ${hasPendingTeam ? 'pending-team' : ''}`}
                    onClick={() => !activeTeam && !hasPendingTeam && handleProjectClick(project)}
                  >
                    <div className="project-header">
                      <div className="project-icon">
                        {project.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className={`project-badge ${activeTeam ? 'badge-completed' : hasPendingTeam ? 'badge-pending' : badge.className}`}>
                        {activeTeam ? 'Active Team' : hasPendingTeam ? `Pending (${pendingTeam.acceptanceCount}/${pendingTeam.totalMembers})` : badge.text}
                      </span>
                    </div>
                    <div className="project-name">{project.name}</div>
                    <div className="project-meta">
                      {project.team > 1 || project.minTeam > 1 ? `Team` : 'Solo'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="section-header">
              <h2>My Teams</h2>
            </div>

            {myTeams.filter(t => t.status === 'active' || t.isPending).length === 0 ? (
              <div className="empty-teams">
                <p>No active teams yet. Create a team by clicking on a team project above.</p>
              </div>
            ) : (
              <div className="teams-grid">
                {myTeams.filter(t => t.status === 'active' || t.isPending).map(team => {
                  const isPendingDelete = !!(team.deleteRequest && team.deleteRequest.requestedBy && team.deleteRequest.requestedByLogin);
                  const isPendingAcceptance = team.isPending && !isPendingDelete;
                  
                  return (
                    <div 
                      key={team._id || team.id} 
                      className={`team-card ${isPendingDelete ? 'pending-delete' : ''} ${isPendingAcceptance ? 'pending-acceptance' : ''}`}
                      onClick={() => !isPendingDelete && !isPendingAcceptance && goToTeamKanban(team)}
                    >
                      {isPendingDelete && (
                        <div className="pending-badge">
                          @{team.deleteRequest.requestedByLogin}
                        </div>
                      )}
                      {isPendingAcceptance && (
                        <div className="pending-badge acceptance">
                          {team.acceptanceCount}/{team.totalMembers} accepted
                        </div>
                      )}
                      <div className="team-header">
                        <div className="team-avatars">
                          {team.members.slice(0, 3).map((member, idx) => (
                            member.avatar || member.user?.avatar ? (
                              <img key={idx} src={member.avatar || member.user.avatar} alt={member.login || member.user.login} className="team-header-avatar" title={member.login || member.user.login} />
                            ) : (
                              <div key={idx} className="team-header-placeholder" title={member.login || member.user.login}>
                                {(member.login || member.user.login).slice(0, 2).toUpperCase()}
                              </div>
                            )
                          ))}
                        </div>
                        <div className="team-info">
                          <div className="team-name">{team.name}</div>
                          <div className="team-project">{team.project.name}</div>
                        </div>
                        {!isPendingDelete && !isPendingAcceptance && (
                          <button 
                            className="team-delete" 
                            onClick={(e) => handleDeleteTeam(team, e)}
                            title="Delete team"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
              <button className="modal-close" onClick={closeModal}>x</button>
            </div>
            <div className="modal-body">
              <p><strong>{selectedProject.name}</strong></p>
              <p>Team size: {selectedProject.minTeam}{selectedProject.maxTeam && selectedProject.maxTeam !== selectedProject.minTeam ? `-${selectedProject.maxTeam}` : ''} members (you + {minMembers}{maxMembers !== minMembers ? `-${maxMembers}` : ''} others)</p>
              
              <div className="team-form">
                <input 
                  type="text" 
                  placeholder="Team name *" 
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
                    disabled={selectedMembers.length >= maxMembers}
                  />
                  {searching && <div className="search-loading">Searching...</div>}
                  {selectedMembers.length >= maxMembers && (
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
                  <p>Team Members: {selectedMembers.length}/{minMembers}{maxMembers !== minMembers ? `-${maxMembers}` : ''}</p>
                  {selectedMembers.length < minMembers && (
                    <div className="no-members">Add at least {minMembers} member{minMembers > 1 ? 's' : ''} to continue</div>
                  )}
                  {selectedMembers.map(member => (
                    <div key={member.id} className="selected-member">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.login} className="member-avatar" />
                      ) : (
                        <div className="member-avatar-placeholder">{member.login.slice(0, 2).toUpperCase()}</div>
                      )}
                      <span>{member.login}</span>
                      <button className="remove-member" onClick={() => removeMember(member.id)}>x</button>
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

      {showDeleteConfirm && teamToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Team?</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{teamToDelete.name}</strong>?</p>
              <p>All team members will need to approve this deletion request.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDeleteTeam}>Request Delete</button>
            </div>
          </div>
        </div>
      )}

      {showInvites && (
        <div className="modal-overlay" onClick={() => setShowInvites(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Team Requests</h2>
              <button className="modal-close" onClick={() => setShowInvites(false)}>×</button>
            </div>
            <div className="modal-body">
              {pendingInvites.length === 0 && validDeleteRequests.length === 0 ? (
                <p>No pending requests</p>
              ) : (
                <div className="requests-container">
                  {pendingInvites.length > 0 && (
                    <>
                      <h3 className="requests-section-title">Team Invitations</h3>
                      <div className="invites-list">
                        {pendingInvites.map(invite => {
                          const hasAccepted = invite.acceptances?.some(id => Number(id) === Number(currentUserId));
                          
                          return (
                            <div key={invite._id || invite.id} className="invite-item">
                              <div className="invite-info">
                                <div className="invite-team-name">{invite.name}</div>
                                <div className="invite-project">{invite.project.name}</div>
                                <div className="invite-creator">
                                  by @{invite.creator?.login} ({invite.acceptanceCount || 0}/{invite.totalMembers || 0} accepted)
                                </div>
                              </div>
                              <div className="invite-actions">
                                {hasAccepted ? (
                                  <span className="response-status approved">Accepted</span>
                                ) : (
                                  <>
                                    <button 
                                      className="btn-accept"
                                      onClick={() => handleInviteResponse(invite, true)}
                                    >
                                      Accept
                                    </button>
                                    <button 
                                      className="btn-decline"
                                      onClick={() => handleInviteResponse(invite, false)}
                                    >
                                      Decline
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {validDeleteRequests.length > 0 && (
                    <>
                      <h3 className="requests-section-title">Deletion Requests</h3>
                      <div className="invites-list">
                        {validDeleteRequests.map(request => {
                          const hasResponded = request.approvals?.some(id => Number(id) === Number(currentUserId));
                          
                          return (
                            <div key={request._id || request.id} className="invite-item delete-request">
                              <div className="invite-info">
                                <div className="invite-team-name">{request.teamName}</div>
                                <div className="invite-project">{request.project?.name}</div>
                                <div className="invite-creator">@{request.requestedBy?.login} wants to delete ({request.approvalCount}/{request.totalMembers} approved)</div>
                              </div>
                              <div className="invite-actions">
                                {hasResponded ? (
                                  <span className="response-status approved">Approved</span>
                                ) : (
                                  <>
                                    <button 
                                      className="btn-accept"
                                      onClick={() => handleDeleteRequestResponse(request, true)}
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      className="btn-decline"
                                      onClick={() => handleDeleteRequestResponse(request, false)}
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
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