import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BookAppointment from './BookAppointment';

const API = 'http://localhost:5000/api';

export default function DentistList() {
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDentist, setSelectedDentist] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get(`${API}/dentists`)
      .then(res => { setDentists(res.data); setLoading(false); })
      .catch(() => { setError('Could not connect to the server. Is your backend running?'); setLoading(false); });
  }, []);

  const filtered = dentists.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase()) ||
    d.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="loading">
      <div className="spinner" />
      <span>Finding dentists near you…</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Find Your Dentist</h1>
        <p>Browse verified dental professionals and book an appointment instantly</p>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="search-input"
          style={{ width: '280px' }}
          placeholder="Search by name, specialty, or location…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span style={{ color: 'var(--slate-light)', fontSize: '0.85rem' }}>
          {filtered.length} dentist{filtered.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {error && <div className="error-msg">⚠️ {error}</div>}

      <div className="dentist-grid">
        {filtered.map(dentist => (
          <div key={dentist.id} className="dentist-card">
            <div className="card-header">
              <img src={dentist.photo} alt={dentist.name} className="dentist-photo" />
              <div className="dentist-header-info">
                <h3>{dentist.name}</h3>
                <span className="specialty-badge">{dentist.specialty}</span>
              </div>
            </div>
            <div className="card-body">
              <div className="exp-badge">
                ⭐ {dentist.experience} years experience
              </div>
              <div className="dentist-detail">
                <span className="icon">🎓</span>
                <div>
                  <span className="label">Qualification</span>
                  <span className="value">{dentist.qualification}</span>
                </div>
              </div>
              <div className="dentist-detail">
                <span className="icon">🏥</span>
                <div>
                  <span className="label">Clinic</span>
                  <span className="value">{dentist.clinic}</span>
                </div>
              </div>
              <div className="dentist-detail">
                <span className="icon">📍</span>
                <div>
                  <span className="label">Address</span>
                  <span className="value">{dentist.address}, {dentist.location}</span>
                </div>
              </div>
              <button className="book-btn" onClick={() => setSelectedDentist(dentist)}>
                Book Appointment →
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedDentist && (
        <BookAppointment
          dentist={selectedDentist}
          onClose={() => setSelectedDentist(null)}
        />
      )}
    </div>
  );
}
