import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

export default function AdminPanel() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchAppointments = useCallback(() => {
    axios.get(`${API}/appointments`)
      .then(res => { setAppointments(res.data); setLoading(false); })
      .catch(() => { setError('Could not load appointments. Is your backend running?'); setLoading(false); });
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    await axios.delete(`${API}/appointments/${id}`);
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const filtered = appointments.filter(a =>
    a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    a.dentist_name.toLowerCase().includes(search.toLowerCase()) ||
    a.clinic_name.toLowerCase().includes(search.toLowerCase())
  );

  const genderClass = g => {
    if (!g) return '';
    const map = { Male: 'gender-male', Female: 'gender-female', Other: 'gender-other' };
    return map[g] || '';
  };

  const formatDate = d => {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner" />
      <span>Loading appointments…</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Manage all dental appointments from one place</p>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-label">Total Appointments</div>
          <div className="stat-value">{appointments.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today's Appointments</div>
          <div className="stat-value">
            {appointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unique Patients</div>
          <div className="stat-value">
            {new Set(appointments.map(a => a.patient_name.toLowerCase())).size}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dentists with Bookings</div>
          <div className="stat-value">
            {new Set(appointments.map(a => a.dentist_id)).size}
          </div>
        </div>
      </div>

      {error && <div className="error-msg">⚠️ {error}</div>}

      <div className="table-container">
        <div className="table-toolbar">
          <h2>All Appointments ({filtered.length})</h2>
          <input
            className="search-input"
            placeholder="Search patient, dentist…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>{appointments.length === 0 ? 'No appointments booked yet.' : 'No results match your search.'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Appointment Date</th>
                  <th>Dentist</th>
                  <th>Clinic</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a.id}>
                    <td style={{ color: 'var(--slate-light)', fontSize: '0.8rem' }}>{i + 1}</td>
                    <td><strong>{a.patient_name}</strong></td>
                    <td>{a.age}</td>
                    <td>
                      <span className={`gender-badge ${genderClass(a.gender)}`}>{a.gender}</span>
                    </td>
                    <td>{formatDate(a.appointment_date)}</td>
                    <td>{a.dentist_name}</td>
                    <td>{a.clinic_name}</td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDelete(a.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
