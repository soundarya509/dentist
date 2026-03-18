# 🦷 OroGlee – Dentist Appointment Booking Platform

A full-stack dental appointment booking app built with React, Node.js, Express, and SQLite.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express |
| Database | SQLite (via better-sqlite3) |
| Styling | Custom CSS with Google Fonts |

## Features

- 🔍 Browse and search dentists by name, specialty, or location
- 📅 Book appointments with an intuitive modal form
- ✅ Instant booking confirmation screen
- 🛠️ Admin panel with live stats, search, and delete functionality
- 📱 Fully responsive design

## Architecture

```
dentist-appointment/
├── backend/
│   └── server.js          # Express server + SQLite routes
├── src/
│   ├── components/
│   │   ├── DentistList.js      # Main listing page
│   │   ├── BookAppointment.js  # Booking modal
│   │   └── AdminPanel.js       # Admin dashboard
│   ├── App.js             # Router + Navbar
│   └── App.css            # Global styles
└── README.md
```

## Setup & Run

### 1. Install backend dependencies

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:5000`

### 2. Install & run React frontend

```bash
# from project root
npm install
npm start
```

Frontend runs on `http://localhost:3000`

### 3. Open in browser

- **Patient view:** http://localhost:3000
- **Admin panel:** http://localhost:3000/admin

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/dentists | List all dentists |
| GET | /api/dentists/:id | Get dentist by ID |
| POST | /api/appointments | Create appointment |
| GET | /api/appointments | List all appointments |
| DELETE | /api/appointments/:id | Delete appointment |

## Deployment

- **Frontend:** Deploy `/build` folder to Netlify or Vercel
- **Backend:** Deploy to Render, Railway, or Heroku
- Update `API` constant in components to your deployed backend URL
