# Satisfactory Dedicated Server Web Dashboard

## 1. Project Overview

**Project Name:** SatisFactory Server Web
**Type:** Full-stack web application (Express backend + React frontend)
**Core Functionality:** A web dashboard to monitor and manage Satisfactory dedicated servers via the community SDK.
**Target Users:** Satisfactory server administrators who want a visual interface instead of command-line tools.

---

## 2. Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────────────┐
│   React SPA     │ ──── │   Express API   │ ──── │  Satisfactory Server    │
│   (Frontend)    │ HTTP │   (Backend)     │ HTTPS│  (Port 7777)           │
└─────────────────┘      └─────────────────┘      └─────────────────────────┘
```

- **Frontend:** React 18 + Vite + TypeScript
- **Backend:** Express + TypeScript, wraps the `satisfactory-dedicated-server-sdk`
- **Communication:** REST API (frontend → backend → Satisfactory server)

---

## 3. Backend API Design

### 3.1 API Endpoints

All endpoints are prefixed with `/api`.

#### Connection Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/connect` | Connect to a server and store session |
| DELETE | `/api/connect` | Disconnect and clear session |
| GET | `/api/status` | Get connection/health status |

#### Server State
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/server-state` | Query current server state |
| GET | `/api/server-options` | Get server options |
| PUT | `/api/server-options` | Update server options |
| GET | `/api/advanced-settings` | Get advanced game settings |
| PUT | `/api/advanced-settings` | Update advanced game settings |

#### Session Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | List all save sessions |
| POST | `/api/sessions` | Create new game |
| POST | `/api/sessions/save` | Save current game |
| POST | `/api/sessions/load` | Load a saved game |
| DELETE | `/api/sessions/{name}` | Delete a save session |

#### Server Actions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/command` | Run a console command |
| POST | `/api/shutdown` | Shutdown the server |

### 3.2 Request/Response Format

**Request:**
```json
POST /api/connect
{
  "host": "192.168.1.100",
  "port": 7777,
  "username": "admin",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "data": { "message": "Connected successfully" }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "CONNECTION_FAILED",
  "message": "Server unreachable"
}
```

---

## 4. Frontend Design

### 4.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: Logo + Server Name + Connection Status Indicator      │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                   │
│   Sidebar    │              Main Content Area                   │
│   - Status   │                                                   │
│   - Options  │   (Dynamic based on sidebar selection)           │
│   - Settings │                                                   │
│   - Sessions │                                                   │
│   - Actions  │                                                   │
│              │                                                   │
└──────────────┴──────────────────────────────────────────────────┘
```

### 4.2 Pages/Views

#### 4.2.1 Dashboard (Home)
- Server online/offline status card
- Current players list (if any)
- Server info summary (map name, session name, uptime)
- Quick stats (autosave interval, auto-pause status)

#### 4.2.2 Server Options
- Toggle switches for: Auto Pause, Auto Save on Disconnect
- Slider/input for: Autosave Interval, Network Quality
- Apply button with confirmation

#### 4.2.3 Advanced Settings
- Toggle switches for: God Mode, No Power, Flight Mode, etc.
- Apply button with confirmation

#### 4.2.4 Sessions (Save Management)
- Table listing all save sessions
- Actions per row: Load, Delete
- "Create New Game" button with modal form
- "Save Current Game" button with name input

#### 4.2.5 Actions
- Console command input + execute button
- Shutdown button (with confirmation modal)

### 4.3 Visual Design

**Theme:** Dark industrial/Factory theme matching Satisfactory's aesthetic
- Primary Background: `#1a1a2e` (deep navy)
- Secondary Background: `#16213e` (dark blue)
- Card Background: `#0f3460` (medium blue)
- Primary Accent: `#e94560` (Satisfactory red/coral)
- Secondary Accent: `#f39c12` (warning yellow/orange)
- Text Primary: `#eaeaea`
- Text Secondary: `#a0a0a0`
- Success: `#27ae60`
- Error: `#e74c3c`

**Typography:**
- Font Family: `"JetBrains Mono", "Fira Code", monospace` (for that factory/technical feel)
- Headings: Bold, uppercase with letter-spacing

**Spacing:** 8px grid system

---

## 5. Functionality Specification

### 5.1 Connection Flow
1. On app load, check if stored connection exists
2. If yes, attempt to reconnect automatically
3. If no, show connection modal
4. User enters: host, port, username (optional), password (optional)
5. Backend calls `initCertificate()` then `healthCheck()` then `passwordlessLogin()` or `passwordLogin()`
6. On success, store session and navigate to dashboard
7. On failure, show error and allow retry

### 5.2 Data Fetching
- Poll server state every 10 seconds for live updates
- Manual refresh buttons on each page
- Loading states and error handling for all API calls

### 5.3 State Management
- React Context for global app state (connection info, auth token)
- Local state for UI-specific states

### 5.4 Edge Cases
- Server goes offline → Show disconnected banner, stop polling, offer reconnect
- API timeout → Show timeout error, allow retry
- Invalid credentials → Show auth error, clear stored credentials
- Unsaved changes → Confirm before navigating away

---

## 6. File Structure

```
SatisFactory-Server-Web/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── api/             # API client functions
│   │   ├── types/           # TypeScript types
│   │   └── styles/          # Global styles
│   └── index.html
├── backend/                 # Express API server
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # SDK wrapper services
│   │   ├── middleware/     # Express middleware
│   │   └── index.ts        # Entry point
│   └── package.json
├── satisfactory-dedicated-server-sdk-main/  # Local SDK (copied/cloned)
└── SPEC.md
```

---

## 7. Dependencies

### Backend
- `express` — Web framework
- `cors` — Cross-origin resource sharing
- `satisfactory-dedicated-server-sdk` — From local copy
- `dotenv` — Environment variables

### Frontend
- `react` / `react-dom` — UI framework
- `react-router-dom` — Routing
- `axios` — HTTP client
- `@tanstack/react-query` — Data fetching and caching
- `lucide-react` — Icons

---

## 8. TODO List

### Phase 1: Project Setup
- [ ] Initialize backend with Express + TypeScript
- [ ] Initialize frontend with Vite + React + TypeScript
- [ ] Copy SDK to backend dependencies
- [ ] Configure CORS for local development

### Phase 2: Backend API
- [ ] Implement `/api/connect` endpoint
- [ ] Implement `/api/status` endpoint
- [ ] Implement server state/proxy endpoints
- [ ] Implement session management endpoints
- [ ] Implement command/shutdown endpoints

### Phase 3: Frontend Core
- [ ] Set up routing and layout
- [ ] Create connection context and modal
- [ ] Build sidebar navigation
- [ ] Create global styles and theme

### Phase 4: Frontend Features
- [ ] Dashboard page with live status
- [ ] Server Options page with forms
- [ ] Advanced Settings page with forms
- [ ] Sessions page with table and modals
- [ ] Actions page with command input and shutdown

### Phase 5: Polish
- [ ] Loading states and skeletons
- [ ] Error handling and toasts
- [ ] Responsive design adjustments
- [ ] Auto-reconnect logic
