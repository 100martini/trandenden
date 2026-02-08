# Trandenden - 21 Project Hub

A project management and collaboration platform for 42 Network students. Integrates with the 42 Intra API for automatic curriculum tracking, team management, and project organization.

## Features

- 42 OAuth authentication
- Automatic curriculum detection (C/C++ or Python)
- Circle progression tracking (0-6)
- Common Core and Outer Core project organization
- Democratic team management system
- Real-time updates
- Kanban boards per project

## Technology Stack

**Frontend**
- React 18 + Vite
- React Router v6
- Axios

**Backend**
- Node.js 20 + Express
- MongoDB
- MariaDB
- JWT authentication

**DevOps**
- Docker + Docker Compose

## Installation

### Prerequisites
- Docker and Docker Compose
- 42 API OAuth credentials

### Setup

1. Clone the repository
```bash
git clone https://github.com/100martini/trandenden.git
cd trandenden
```

2. Create `backend/.env` with your credentials
```bash
cp backend/.env.example backend/.env
```

3. Start the application
```bash
make build
make start
```

4. Access at http://localhost:5173

## Project Structure

```
trandenden/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth middleware
│   │   └── config/          # Configuration
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── styles/          # CSS files
│   │   └── utils/           # Helper functions
│   └── Dockerfile
├── docker-compose.yml
├── Makefile
└── README.md
```

## How It Works

**First Login:**
User authenticates via 42 OAuth → System fetches and analyzes user data → Calculates current circle and detects curriculum → Dashboard displays personalized progress

**Team Management:**
Creator invites members → All members must accept for team to activate → Any member can request deletion (requires unanimous approval)

**Project Organization:**
Solo projects open kanban directly → Team projects require active team → Projects categorized by circle or core type

## API Endpoints

**Authentication**
- `GET /api/auth/42` - OAuth redirect
- `GET /api/auth/callback` - OAuth callback
- `GET /api/auth/me` - Current user data

**Teams**
- `POST /api/teams` - Create team
- `GET /api/teams/pending` - Pending invitations
- `PATCH /api/teams/:teamId/respond` - Accept/decline
- `GET /api/teams/my-teams` - User's teams
- `POST /api/teams/:teamId/request-delete` - Request deletion