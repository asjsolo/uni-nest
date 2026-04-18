# UNI NEST - Project Status Report

This document outlines the current state of the UNI NEST codebase to align the development team and track pending implementations.

## 1. Frontend Status
**Overview:** A Vite-based React frontend has been initialized in the `frontend` folder with core routing set up.

**Routing & Structure (`App.jsx`):**
- **Gateway:** `/login` loads a `DummyLogin` component.
- **Admin Zone:** `/admin` loads the `AdminDashboard`.
- **Student Zone:** `/*` loads a wrapped environment containing a `StudentNavbar` and routes for:
  - Marketplace (`/`)
  - Item Lending (`/lend` - currently a dummy `LendSlot`)
  - Student Dashboard (`/dashboard` - currently a dummy `DashboardSlot`)

**Components & Mock Data:**
- **Admin Dashboard (`src/pages/Admin/AdminDashboard.jsx`):** The UI is highly developed with a glassmorphism theme, charts, and data tables spanning across Overview, Users, Listings, Disputes, and Action Logs.
> [!WARNING]
> MOCK DATA USAGE
> `AdminDashboard.jsx` is heavily reliant on hardcoded initial states (`initialUsers`, `initialItems`, `initialDisputes`, `initialLogs`). It attempts to fetch from `/api/admin/...` but falls back to mock data if the API is unavailable.
- **Pending Areas:** Folders for `Analytics`, `InventoryLender`, and `SmartBorrowing` exist but are waiting for logic and components.

## 2. Backend Status
**Overview:** An Express server backend has been initialized in the `backend` folder.

**Structure & Setup:**
- **Folders:** The core architectural folders (`controllers`, `models`, `routes`, `config`) have been created.
- **Entry File (`server.js`):** Contains the foundational Express app boilerplate. It includes middleware for JSON parsing and CORS, and a MongoDB connection handler utilizing `mongoose`. A basic test route (`/`) is running.
- **Configuration (`.env`):** A environment file (`.env`) is present, defining `PORT=5000` and a sample `MONGO_URI`.
- **Scripts:** `nodemon server.js` is set as the `dev` script for hot-reloading development.

## 3. Tech Stack

### Frontend Dependencies (`frontend/package.json`)
- **Core:** React 19 (`react`, `react-dom`) & Vite
- **Routing:** `react-router-dom` (v7+)
- **Styling & UI:** `framer-motion` (animations), `lucide-react` (icons), `recharts` (dashboard charts)
- **Networking:** `axios`

### Backend Dependencies (`backend/package.json`)
- **Core:** Node.js (ES Modules set via `"type": "module"`), Express (v5+)
- **Database:** Mongoose (v9+)
- **Utilities:** `cors`, `dotenv`

---
### Next Steps for the Team
1. **API Development:** Connect the mock states in `AdminDashboard.jsx` to real backend schemas by creating Mongoose models and Express routes inside the `backend` directory.
2. **Student Zone:** Replace the `LendSlot` and `DashboardSlot` dummy components in `App.jsx` with actual page implementations.
3. **Authentication:** Implement real authentication to replace the `DummyLogin` gateway.
