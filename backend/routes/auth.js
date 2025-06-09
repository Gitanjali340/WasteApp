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
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    user.LoginHistory.push(new Date());
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: {
        username: user.username,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('[LOGIN] error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_, res) => {
  console.log('🔒 [LOGOUT]');
  res.json({ success: true, message: 'User logged out' });
});

module.exports = router;
