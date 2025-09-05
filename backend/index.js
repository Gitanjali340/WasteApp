// backend/index.js
const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const apiRoutes  = require('./routes/api');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── MONGODB CONNECTION ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ─── ROUTES ────────────────────────────────────────────────────────────────────
// authRoutes handles: POST /api/auth/register, /api/auth/login, /api/auth/logout
app.use('/api/auth', authRoutes);

// apiRoutes handles: GET /api/users, GET /api, GET /api/analysis, POST /api/buy-bin, POST /api/complaint, GET /api/profile
app.use('/api', apiRoutes);

// ─── START SERVER ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// --- Add these lines with your other route imports ---
const usersRoutes = require('./routes/users');
const tasksRoutes = require('./routes/tasks');


// --- Add these lines with your other app.use() statements ---
app.use('/api/users', usersRoutes);
app.use('/api/tasks', tasksRoutes);
