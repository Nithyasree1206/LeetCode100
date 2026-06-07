const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// ---------- ADD THIS (IMPORTANT) ----------
app.get('/', (req, res) => {
  res.send('Auth API is running 🚀');
});
// -----------------------------------------

function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// REGISTER
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const db = readDB();

  const existing = db.users.find(u => u.email === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hash = bcrypt.hashSync(password, 10);

  const user = {
    id: Date.now(),
    email: email.toLowerCase(),
    name: name || email,
    passwordHash: hash
  };

  db.users.push(user);
  writeDB(db);

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, user: { email: user.email, name: user.name } });
});

// LOGIN
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const db = readDB();

  const user = db.users.find(u => u.email === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, user: { email: user.email, name: user.name } });
});

// VERIFY
app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ ok: true, payload });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log('Auth server running on port', PORT);
});