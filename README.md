# WMT Car Sales Management

A full-stack car sales management application (mobile frontend + Node.js backend) used for managing cars, bookings, orders, promotions, inquiries, and user administration.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication and profiles
- Car listings (CRUD)
- Bookings and orders
- Promotions and admin management
- Reviews and inquiry handling
- Spare parts inventory

## Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React Native / Expo

## Repository Structure

Top-level folders:

- `backend/` — Node.js API server and services
- `frontend/` — React Native / Expo mobile app

Detailed structure (high level):

- backend/src/features — feature folders: `auth`, `cars`, `bookings`, `orders`, `promotions`, `inquiries`, `spareParts`, `users`, etc.
- backend/src/middleware — middleware implementations
- backend/src/utils — utility helpers (e.g., `AppError`)
- frontend/src/screens — app screens
- frontend/src/services/api.js — API client for frontend

## Getting Started

Prerequisites:

- Node.js (recommended v16+)
- npm or yarn
- MongoDB instance or connection string

### Backend

1. Change to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in `backend/` (see **Environment Variables** below).

4. Run the server in development:

```bash
npm run dev
```

### Frontend

1. Change to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run the Expo app:

```bash
npm start
```

## Environment Variables

Create a `.env` file for the backend with values similar to:

```
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
```

The frontend may also include `.env` values depending on how API base URLs are configured.

## Scripts

Common scripts (may vary per package.json):

- `npm start` — start the app/server
- `npm run dev` — start server in development with nodemon
- `npm test` — run tests (if configured)

## Contributing

Feel free to open issues or submit pull requests. Keep changes focused and add tests where appropriate.

## License

Add a license file if you plan to open-source this repository.

---

If you want, I can also:

- add example `.env` templates for backend and frontend
- expand the Setup steps with exact commands for Windows
- add a `CONTRIBUTING.md` or `docs/` folder
