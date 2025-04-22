const express = require('express');
const bcrypt  = require('bcryptjs');
const router  = express.Router();
const User    = require('../models/User');

// Register route - only username and password required
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('📥 [REGISTER] body:', req.body);

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'Username and password are required.' });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: 'Username already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔑 [REGISTER] hashed password:', hashedPassword);

    // Create the user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    console.log('📝 Saving user to DB:', newUser);

    const savedUser = await newUser.save();
    console.log('✅ [REGISTER] user saved:', savedUser);

    res
      .status(201)
      .json({ success: true, message: 'User registered successfully', user: savedUser });
  } catch (err) {
    console.error('❌ [REGISTER] error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('📥 [LOGIN] body:', req.body);
  const { username, password } = req.body;

  // Validate
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'Username and password are required.' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log('✅ [LOGIN] successful for:', username);
    res.json({ success: true, message: 'Login successful', user });
  } catch (err) {
    console.error('❌ [LOGIN] error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_, res) => {
  console.log('🔒 [LOGOUT]');
  res.json({ success: true, message: 'User logged out' });
});

module.exports = router;
