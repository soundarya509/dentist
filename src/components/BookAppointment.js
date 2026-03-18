import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

export default function BookAppointment({ dentist, onClose }) {
  const [form, setForm] = useState({ patient_name: '', age: '', gender: '', appointment_date: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.patient_name || !form.age || !form.gender || !form.appointment_date) {
      setError('Please fill in all fields.');
      return;
    }
    if (parseInt(form.age) < 1 || parseInt(form.age) > 120) {
      setError('Please enter a valid age.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/appointments`, { ...form, age: parseInt(form.age), dentist_id: dentist.id });
      setSuccess(true);
    } catch {
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {success ? (
          <div className="success-state">
            <div className="success-icon">🎉</div>
            <h3>Appointment Confirmed!</h3>
            <p>Your appointment with <strong>{dentist.name}</strong> at <strong>{dentist.clinic}</strong> has been booked for <strong>{new Date(form.appointment_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
            <button className="close-success" onClick={onClose}>Done ✓</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div>
                <h2>Book Appointment</h2>
                <p>{dentist.name} · {dentist.clinic}</p>
              </div>
              <button className="modal-close" onClick={onClose}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}
              <form onSubmit={submit}>
                <div className="form-group">
                  <label>Patient Name</label>
                  <input name="patient_name" placeholder="Full name" value={form.patient_name} onChange={handle} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Age</label>
                    <input name="age" type="number" placeholder="e.g. 28" min="1" max="120" value={form.age} onChange={handle} />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={form.gender} onChange={handle}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Appointment Date</label>
                  <input name="appointment_date" type="date" min={today} value={form.appointment_date} onChange={handle} />
                </div>
                <button className="submit-btn" type="submit" disabled={loading}>
                  {loading ? 'Booking…' : 'Confirm Appointment →'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
