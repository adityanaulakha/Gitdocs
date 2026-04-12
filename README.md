# GitDocs

A full-stack collaboration platform for documents, projects, version branches, and commits.

## What this project does

GitDocs combines a React + Vite frontend with a Node + Express backend, MongoDB data storage, and Redis caching.

Key functionality:

- User registration, login, JWT auth, protected API routes
- Projects with collaborators and role-based access
- Documents tied to projects and branches
- Commits / activity timeline for project changes
- Branch version management and branch sync
- Real-time document collaboration through Socket.IO with Redis pub/sub
- Account settings for profile, password, and notification preferences
- In-app documentation page at `/docs`
- Redis-powered caching for improved performance
- Rate limiting for API protection

## Architecture

- `backend/` — Express API, MongoDB connection, Redis caching, JWT auth, project/document/commit/version routes, Socket.IO collaboration with Redis pub/sub
- `frontend/` — React app, React Router, Redux Toolkit, Redux Saga, Tailwind CSS, Tiptap editor, Socket.IO client
- `backend/server.js` — starts Express app and Socket.IO server on the same backend port
- `frontend/src/services/BaseApiService.js` — API client with bearer token auth and global 401 handling
- Redis features:
  - Document caching (5-10 minute TTL)
  - Cross-server real-time collaboration via pub/sub
  - API rate limiting (100 requests/minute per IP)
  - Session data storage capabilities

## Local setup

1. Install dependencies
   - `cd backend && npm install`
   - `cd ../frontend && npm install`

2. Install and start Redis
   - Download and install Redis from https://redis.io/download
   - Start Redis server: `redis-server` (default port 6379)

3. Create backend environment variables
   - Add `backend/.env` with:
     ```env
     MONGO_URI=mongodb://127.0.0.1:27017/gitdocs
     JWT_SECRET=your_jwt_secret
     PORT=5000
     REDIS_URL=redis://127.0.0.1:6379
     REDIS_PASSWORD=
     REDIS_DB=0
     ```

4. Run the backend
   - `cd backend && npm run dev`

5. Run the frontend
   - `cd frontend && npm run dev`

6. Open the app in a browser
   - Frontend default: `http://localhost:5174`
   - Backend API base: `http://localhost:5000/api`

## Important notes

- The backend and frontend are separate apps; there is no root `package.json` in this repository.
- The project currently does not include automated tests.
- `backend/.env` is not included in source control and must be created locally.
- A sample environment file is available at `backend/.env.example`.
- There is a stale root `package-lock.json` at the repository root. It is not used by the `backend/` or `frontend/` packages.

## Known change made

- Fixed Socket.IO CORS origins in `backend/server.js` so the editor collaboration socket server accepts Vite frontend origins on `http://localhost:5173` and `http://localhost:5174`.

## Routes and pages

Frontend pages:

- `/` — Home/marketing
- `/auth`, `/signin`, `/createaccount` — authentication
- `/dashboard` — user dashboard
- `/projects` — project list and CRUD
- `/project/:id` — single project workspace
- `/documents` — documents list and filters
- `/versions` — branch/version list
- `/activity` — commit/activity feed
- `/settings` — user profile and preferences
- `/docs` — in-app documentation
- `/editor` and `/editor/:id` — document editor with live collaboration

Backend API base: `http://localhost:5000/api`

Core endpoints include:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users/me`, `PATCH /api/users/me`, `PATCH /api/users/me/password`, `PATCH /api/users/me/preferences`
- `GET/POST /api/projects`, `PUT/DELETE /api/projects/:id`
- `GET /api/projects/:id/collaborators`, `POST/PUT/DELETE /api/projects/:id/collaborators/:userId`
- `GET/POST /api/documents`, `PUT/DELETE /api/documents/:id`
- `GET/POST /api/commits`
- `GET/POST /api/versions`, `DELETE /api/versions/:id`, `POST /api/versions/sync`

## Recommended next improvement

- Add a `backend/.env.example` file to document required variables
- Add automated tests for backend and frontend functionality
- Add a root-level README or update docs to document repository structure clearly
