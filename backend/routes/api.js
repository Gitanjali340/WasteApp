const express   = require('express');
const router    = express.Router();
const User      = require('../models/User');
const BuyBin    = require('../models/BuyBin');
const Complaint = require('../models/Complaint');

// GET /api/users
router.get('/users', async (req, res) => {
  console.log('📥 [GET] /api/users');
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('❌ [GET] /api/users error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/buy-bin
router.post('/buy-bin', async (req, res) => {
  console.log('📥 [POST] /api/buy-bin', req.body);
  try {
    const record = new BuyBin(req.body);
    const saved  = await record.save();
    res.json({ success: true, message: 'Buy bin request saved to database.', data: saved });
  } catch (err) {
    console.error('❌ [POST] /api/buy-bin error:', err);
    res.status(500).json({ success: false, message: 'Failed to save request.' });
  }
});

// POST /api/complaint
router.post('/complaint', async (req, res) => {
  console.log('📥 [POST] /api/complaint', req.body);
  try {
    const record = new Complaint(req.body);
    const saved  = await record.save();
    res.json({ success: true, message: 'Complaint saved to database.', data: saved });
  } catch (err) {
    console.error('❌ [POST] /api/complaint error:', err);
    res.status(500).json({ success: false, message: 'Failed to save complaint.' });
  }
});

// GET /api        (Health)
router.get('/', (req, res) => res.send('Welcome to the Garbage Management API!'));

// GET /api/analysis
router.get('/analysis', (req, res) => res.send('Company Analysis data will be provided here.'));

// GET /api/profile  (Dummy)
router.get('/profile', (req, res) => {
  res.json({ name: "Gitanjali Pandey", role: "Society Member", requestsMade: 3 });
});

module.exports = router;
