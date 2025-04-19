const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BuyBin = require('../models/BuyBin');
const Complaint = require('../models/Complaint');

// Create a user (register)
router.post('/users', async (req, res) => {
  const { name, role } = req.body;
  try {
    const user = await User.create({ name, role });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all users (for admin)
router.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Home Route
router.get('/', (req, res) => {
  res.send('Welcome to the Garbage Management API!');
});

// Analysis
router.get('/analysis', (req, res) => {
  res.send('Company Analysis data will be provided here.');
});

// Buy Bin Request
router.post('/buy-bin', async (req, res) => {
  const { name, address } = req.body;

  try {
    const newRequest = new BuyBin({ name, address });
    await newRequest.save();
    res.json({ success: true, message: 'Buy bin request saved to database.' });
  } catch (err) {
    console.error('Error saving Buy Bin request:', err);
    res.status(500).json({ success: false, message: 'Failed to save request.' });
  }
});

// Complaints
router.post('/complaint', async (req, res) => {
  const { subject, description } = req.body;

  try {
    const newComplaint = new Complaint({ subject, description });
    await newComplaint.save();
    res.json({ success: true, message: 'Complaint saved to database.' });
  } catch (err) {
    console.error('Error saving complaint:', err);
    res.status(500).json({ success: false, message: 'Failed to save complaint.' });
  }
});

// Profile
router.get('/profile', (req, res) => {
  res.json({
    name: "Gitanjali Pandey",
    role: "Society Member",
    requestsMade: 3
  });
});

module.exports = router;
