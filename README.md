# Trandenden - 21 Project Hub

A project management and collaboration platform for 42 Network students, integrating with the 42 Intra API for curriculum tracking, team management, and project organization.

---

## Table of Contents
- [Features](#features)
- [User Flows](#user-flows)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)

---

## Features

- **42 OAuth Authentication** - Secure login via 42 Intra
- **Automatic Curriculum Detection** - Identifies C/C++ or Python path
- **Circle Progression Tracking** - Monitors completion across 7 milestones (0-6)
- **Common Core & Outer Core Organization** - Projects categorized by curriculum stage
- **Team Management** - Create teams with democratic acceptance system
- **Real-time Updates** - Polling-based synchronization every 5 seconds
- **Kanban Boards** - Per-project task management workspace
- **Session Caching** - Instant navigation with cached data

---

## User Flows

### New Common Core User Login
1. User authenticates via 42 OAuth
2. Backend fetches user data from 42 API (profile, projects, quests)
3. System calculates current circle from completed quests
4. System detects curriculum (C/C++ or Python) from registered projects
5. User sees welcome screen with avatar, level, and stats
6. Dashboard loads with circles 0-1 unlocked (more unlock after curriculum detection)
7. Projects displayed by milestone with status badges

### Returning User Login
1. OAuth authentication completes
2. System updates user data from 42 API
3. Dashboard loads instantly with cached data
4. Background refresh updates information silently

### Common Core (Cadet) Navigation
1. User sees 7 circles (0-6) with completion ratios
2. Clicking a circle shows its projects
3. Each project shows status (completed score, in progress, failed, not started)
4. Solo projects open kanban directly
5. Team projects require team creation first

### Outer Core (Transcender/Member) Navigation
1. User switches between Common Core and Outer Core tabs
2. Common Core shows all completed 42 cursus projects from circles 0-6
3. Outer Core shows additional 42 cursus projects outside common core
4. Projects clickable to access kanban boards

### Creating a Team
1. User clicks team project card
2. Modal opens with team name input and member search
3. User searches teammates by login
4. User selects required number of members
5. Creator clicks "Create Team"
6. Creator auto-accepts, other members receive invitation
7. Team appears in "My Teams" with acceptance counter (e.g., "1/3 accepted")
8. Project card shows "Pending (1/3)"

### Team Invitation Response
1. Invited members see request in "Requests" section
2. Request shows team name, project, creator, and acceptance progress
3. Member accepts: shows "Accepted" status, counter updates
4. Invitation stays visible until all accept or one declines
5. All accept: team activates, invitation disappears, kanban accessible
6. Any decline: team deletes immediately for everyone

### Team Deletion
1. Any member requests deletion
2. Other members see deletion request with approval counter
3. Each member approves or rejects
4. After approving, member sees "Approved" status
5. All approve: team deletes permanently
6. Any reject: deletion cancelled, team stays active

### Accessing Kanban Board
1. Solo projects: open kanban immediately
2. Team projects with no team: opens team creation modal
3. Team projects with pending team: disabled until all accept
4. Team projects with active team: opens shared kanban board
5. Board has four columns: To Do, In Progress, Review, Done

---

## Technology Stack

### Frontend
- React 18 with Vite
- React Router v6
- Axios for HTTP requests
- Custom CSS with dark theme

### Backend
- Node.js 20 + Express
- MongoDB (users, teams)
- MariaDB (secondary database)
- JWT authentication
- 42 OAuth integration

### DevOps
- Docker + Docker Compose
- Nodemon for hot reload

---

## Installation

### Prerequisites
- Docker and Docker Compose
- 42 API credentials (OAuth app)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd trandenden
```

2. **Configure environment variables**

Create `backend/.env`:
```env
PORT=3000
NODE_ENV=development
FT_CLIENT_UID=your_42_client_id
FT_CLIENT_SECRET=your_42_client_secret
FT_REDIRECT_URI=http://localhost:3000/api/auth/callback
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=mongodb://mongodb:27017/ft_transcendence
```

3. **Build and start services**
```bash
make build
make start
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Development Commands
```bash
make build      # Build Docker images
make start      # Start all services
make stop       # Stop all services
make restart    # Restart services
make logs       # View logs
make clean      # Remove containers and volumes
```

---

## Project Structure

```
trandenden/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js      # OAuth, user management, curriculum detection
│   │   │   └── team.controller.js      # Team CRUD, invitations, deletion
│   │   ├── models/
│   │   │   ├── user.model.js           # User schema with projects and circle data
│   │   │   └── team.model.js           # Team schema with acceptances tracking
│   │   ├── routes/
│   │   │   ├── auth.routes.js          # Authentication endpoints
│   │   │   └── team.routes.js          # Team management endpoints
│   │   ├── middleware/
│   │   │   └── auth.middleware.js      # JWT verification
│   │   ├── config/
│   │   │   └── oauth.config.js         # 42 OAuth configuration
│   │   └── server.js                   # Express app initialization
│   ├── .env
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FullDashboard.jsx       # Main dashboard UI
│   │   │   └── WelcomeScreen.jsx       # First-login animation
│   │   ├── pages/
│   │   │   ├── Login.jsx               # Login page
│   │   │   ├── AuthSuccess.jsx         # OAuth callback handler
│   │   │   ├── Dashboard.jsx           # Dashboard wrapper with data fetching
│   │   │   └── ProjectKanban.jsx       # Kanban board
│   │   ├── styles/                     # CSS files
│   │   ├── utils/
│   │   │   ├── auth.js                 # Token management
│   │   │   └── api.js                  # Axios instance with interceptors
│   │   └── App.jsx                     # Router configuration
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── Makefile
└── README.md
```

### Key Files

**Backend**
- `server.js` - Express setup, middleware, routes, database connections
- `auth.controller.js` - OAuth flow, user data fetching, curriculum detection, user search
- `team.controller.js` - Team creation, invitations, acceptances, deletion requests
- `user.model.js` - User schema with profile, projects, quests, circle, curriculum
- `team.model.js` - Team schema with members, acceptances, deleteRequest, status

**Frontend**
- `App.jsx` - Router setup with protected routes
- `Dashboard.jsx` - Fetches user data, manages loading state, handles caching
- `FullDashboard.jsx` - Main UI with circles, projects grid, teams, modals
- `ProjectKanban.jsx` - Kanban board with four columns
- `auth.js` - Token management utilities
- `api.js` - Axios instance with JWT and error handling

---

## API Endpoints

### Authentication
```
GET  /api/auth/42                    - Redirect to 42 OAuth
GET  /api/auth/callback              - Handle OAuth callback
GET  /api/auth/me                    - Get current user (authenticated)
GET  /api/auth/users/search?q=login  - Search users (authenticated)
POST /api/auth/refresh               - Refresh user data (authenticated)
```

### Teams
```
POST  /api/teams                                        - Create team (authenticated)
GET   /api/teams/pending                                - Get pending invitations (authenticated)
PATCH /api/teams/:teamId/respond                        - Accept/decline invitation (authenticated)
GET   /api/teams/my-teams                               - Get user's teams (authenticated)
POST  /api/teams/:teamId/request-delete                 - Request deletion (authenticated)
GET   /api/teams/delete-requests                        - Get deletion requests (authenticated)
PATCH /api/teams/delete-requests/:requestId/respond     - Approve/reject deletion (authenticated)
```

---

## License

This project is part of the 42 Network curriculum.