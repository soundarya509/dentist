import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import DentistList from './components/DentistList';
import AdminPanel from './components/AdminPanel';
import './App.css';

function Navbar() {
  const location = useLocation();
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="tooth-icon">🦷</span>
        <span className="brand-name">OroGlee</span>
      </div>
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Find a Dentist</Link>
        <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin Panel</Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DentistList />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>© 2025 OroGlee · Smile with confidence</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
