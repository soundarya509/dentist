// Line 1  - Import Express framework
const express = require('express');
// Line 2  - Import CORS (allows React on port 3000 to talk to backend on 5000)
const cors = require('cors');
// Line 3  - Import path (to build file paths that work on all OS)
const path = require('path');
// Line 4  - Import fs (to read/write the .db file to disk)
const fs = require('fs');

// Line 6  - Create the Express app
const app = express();
// Line 7  - Enable CORS for all routes
app.use(cors());
// Line 8  - Allow Express to read JSON from request body
app.use(express.json());

// Line 10 - Import sql.js (pure JavaScript SQLite, no C++ needed on Windows)
const initSqlJs = require('sql.js');
// Line 11 - Set the file path where SQLite DB will be saved
const DB_PATH = path.join(__dirname, 'appointments.db');

// Line 13 - Main async function to initialize DB then start server
async function initDB() {

  // Line 15 - Initialize sql.js engine
  const SQL = await initSqlJs();
  let db;

  // Line 18 - If DB file already exists, load it; otherwise create a new empty DB
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH)); // Load existing
  } else {
    db = new SQL.Database(); // Create new empty DB
  }

  // Line 23 - saveDB: exports in-memory DB and writes it to appointments.db file
  function saveDB() {
    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  }

  // Line 27 - Create tables if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS dentists (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT,
      qualification TEXT,
      experience    INTEGER,
      clinic        TEXT,
      address       TEXT,
      location      TEXT,
      specialty     TEXT,
      photo         TEXT
    );
    CREATE TABLE IF NOT EXISTS appointments (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_name     TEXT,
      age              INTEGER,
      gender           TEXT,
      appointment_date TEXT,
      dentist_id       INTEGER,
      dentist_name     TEXT,
      clinic_name      TEXT,
      created_at       TEXT DEFAULT (datetime('now'))
    );
  `);

  // Line 51 - Check how many dentists are already in the DB
  const countRes = db.exec("SELECT COUNT(*) FROM dentists");
  const count = countRes[0]?.values[0][0];

  // Line 54 - If no dentists exist, seed 6 sample dentists
  if (!count || count === 0) {
    const dentists = [
      ['Dr. Priya Sharma',  'BDS, MDS (Orthodontics)',   12, 'SmileCare Dental',    '45 Jubilee Hills, Rd No. 36', 'Hyderabad',   'Orthodontics',      'https://randomuser.me/api/portraits/women/44.jpg'],
      ['Dr. Arjun Mehta',   'BDS, MDS (Endodontics)',     9, 'PearlDent Clinic',    '12 Banjara Hills, Road 2',    'Hyderabad',   'Root Canal',        'https://randomuser.me/api/portraits/men/32.jpg'],
      ['Dr. Kavya Reddy',   'BDS, MDS (Prosthodontics)', 15, 'Reddy Dental Care',   '88 Madhapur, Phase 2',        'Hyderabad',   'Implants & Crowns', 'https://randomuser.me/api/portraits/women/68.jpg'],
      ['Dr. Sanjay Nair',   'BDS, MDS (Oral Surgery)',   11, 'MaxiDent Hospital',   '3 Secunderabad Main Rd',      'Secunderabad','Oral Surgery',      'https://randomuser.me/api/portraits/men/55.jpg'],
      ['Dr. Anita Kulkarni','BDS, MPH',                   7, 'BrightSmile Center',  '22 Gachibowli, IT Park Lane', 'Hyderabad',   'General Dentistry', 'https://randomuser.me/api/portraits/women/26.jpg'],
      ['Dr. Rohan Verma',   'BDS, MDS (Periodontics)',   14, 'GumCare Specialists', '67 HITEC City, Cyberabad',    'Hyderabad',   'Gum Treatment',     'https://randomuser.me/api/portraits/men/76.jpg'],
    ];
    // Line 63 - Insert each dentist into the DB
    dentists.forEach(d => {
      db.run('INSERT INTO dentists (name,qualification,experience,clinic,address,location,specialty,photo) VALUES (?,?,?,?,?,?,?,?)', d);
    });
    // Line 66 - Save seeded data to file
    saveDB();
  }

  // Line 69 - queryAll: runs SELECT and returns ALL matching rows as objects
  function queryAll(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  // Line 77 - queryOne: same as queryAll but returns only the first row
  function queryOne(sql, params = []) {
    return queryAll(sql, params)[0] || null;
  }

  // Line 80 - run: executes INSERT/UPDATE/DELETE and saves DB to file
  function run(sql, params = []) {
    db.run(sql, params);
    saveDB();
    const res = db.exec("SELECT last_insert_rowid()");
    return res[0]?.values[0][0];
  }

  // ── API ROUTES ──────────────────────────────────────────────────────────────

  // Line 88 - GET /api/dentists → Returns all 6 dentists (used by DentistList.js)
  app.get('/api/dentists', (req, res) => {
    res.json(queryAll('SELECT * FROM dentists'));
  });

  // Line 92 - GET /api/dentists/:id → Returns one dentist by ID
  app.get('/api/dentists/:id', (req, res) => {
    const d = queryOne('SELECT * FROM dentists WHERE id = ?', [req.params.id]);
    if (!d) return res.status(404).json({ error: 'Not found' });
    res.json(d);
  });

  // Line 98 - POST /api/appointments → Books a new appointment (used by BookAppointment.js)
  app.post('/api/appointments', (req, res) => {
    const { patient_name, age, gender, appointment_date, dentist_id } = req.body;
    // Line 100 - Validate required fields
    if (!patient_name || !dentist_id || !appointment_date)
      return res.status(400).json({ error: 'Missing required fields' });
    // Line 103 - Find the dentist to get their name and clinic
    const dentist = queryOne('SELECT * FROM dentists WHERE id = ?', [dentist_id]);
    if (!dentist) return res.status(404).json({ error: 'Dentist not found' });
    // Line 106 - Insert appointment into DB
    const id = run(
      'INSERT INTO appointments (patient_name,age,gender,appointment_date,dentist_id,dentist_name,clinic_name) VALUES (?,?,?,?,?,?,?)',
      [patient_name, age, gender, appointment_date, dentist_id, dentist.name, dentist.clinic]
    );
    // Line 110 - Send success response back to React
    res.status(201).json({ id, message: 'Appointment booked successfully!' });
  });

  // Line 113 - GET /api/appointments → Returns all appointments (used by AdminPanel.js)
  app.get('/api/appointments', (req, res) => {
    res.json(queryAll('SELECT * FROM appointments ORDER BY id DESC'));
  });

  // Line 117 - DELETE /api/appointments/:id → Deletes one appointment (used by AdminPanel.js)
  app.delete('/api/appointments/:id', (req, res) => {
    run('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  });

  // Line 122 - Start server on port 5000 (or process.env.PORT for deployment)
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}

// Line 126 - Run initDB and exit if anything fails
initDB().catch(err => { console.error('DB init failed:', err); process.exit(1); });